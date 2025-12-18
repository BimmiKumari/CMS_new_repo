using AutoMapper;
using CMS.Application.Appointments.DTOs.Requests;
using CMS.Application.Appointments.DTOs.Responses;
using CMS.Application.Appointments.Interfaces;
using CMS.Application.Shared.Configuration;
using CMS.Domain.Appointments.Entities;
using CMS.Domain.Auth.Enums;
using CMS.Domain.Auth.Entities;
using CMS.Domain.Clinic.Enums;
using CMS.Domain.Shared.Exceptions;
using CMS.Application.Clinic.Interfaces;
using CMS.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Appointments.Services
{
    public class TimeSlotService : ITimeSlotService
    {
        private readonly CmsDbContext _context;
        private readonly ILeaveRepository _leaveRepository;
        private readonly ITimeSlotRepository _timeSlotRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<TimeSlotService> _logger;

        public TimeSlotService(
            CmsDbContext context,
            ILeaveRepository leaveRepository,
            ITimeSlotRepository timeSlotRepository,
            IMapper mapper,
            ILogger<TimeSlotService> logger)
        {
            _context = context;
            _leaveRepository = leaveRepository;
            _timeSlotRepository = timeSlotRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<AvailableSlotsResponseDto> GetAvailableSlotsAsync(GetAvailableSlotsRequestDto request)
        {
            _logger.LogInformation("Generating slots for Doctor {DoctorId} on {Date}", request.DoctorId, request.Date.ToShortDateString());

            // 1. Validate inputs and booking window
            if (!await ValidateBookingWindowAsync(request.Date, request.UserRole))
                throw new ValidationException("Date is outside allowed booking window");

            // 2. Get doctor info from both tables
            var user = await _context.Users
                .Where(u => u.UserID == request.DoctorId && u.Role == RoleType.Doctor && u.IsActive && !u.IsDeleted)
                .FirstOrDefaultAsync();
                
            if (user == null)
                throw new NotFoundException("Doctor user not found");

            var doctorRecord = await _context.Doctors
                .FirstOrDefaultAsync(d => d.DoctorID == request.DoctorId);

            // 3. Check if date falls on doctor's working days
            int dotNetDay = (int)request.Date.DayOfWeek;
            var dayOfWeek = dotNetDay == 0 ? WorkingDays.Sunday : (WorkingDays)dotNetDay;
            
            List<WorkingDays> workingDays = doctorRecord?.WorkingDays?.ToList() ?? new List<WorkingDays>();
            
            if (!workingDays.Contains(dayOfWeek))
            {
                _logger.LogInformation("Doctor {DoctorId} does not work on {Day}", request.DoctorId, dayOfWeek);
                return new AvailableSlotsResponseDto
                {
                    Date = request.Date,
                    DoctorName = user.Name,
                    Specialization = doctorRecord?.Specialization ?? "General",
                    AvailableSlots = new List<TimeSlotDto>(),
                    TotalSlots = 0
                };
            }

            // 4. Build slot generation context
            var context = new SlotGenerationContext
            {
                Doctor = user, // For legacy fields if fallback is needed
                DoctorRecord = doctorRecord, // Pass the new table record
                RequestedDate = request.Date,
                ApprovedLeaves = await _leaveRepository.GetApprovedLeavesForDateAsync(request.DoctorId, request.Date),
                BookedSlots = await _timeSlotRepository.GetBookedSlotsAsync(request.DoctorId, request.Date)
            };

            // 5. Generate raw slots from schedule
            GenerateRawSlots(context);

            // 6. Apply leave rules
            ApplyLeaveRules(context);

            // 7. Subtract booked slots
            SubtractBookedSlots(context);

            // 8. Map to DTO and return
            var response = new AvailableSlotsResponseDto
            {
                Date = request.Date,
                DoctorName = user.Name,
                Specialization = doctorRecord?.Specialization ?? "General",
                AvailableSlots = context.GeneratedSlots.Select(slot => new TimeSlotDto
                {
                    StartTime = slot.StartTime,
                    EndTime = slot.EndTime,
                    DisplayTime = $"{slot.StartTime:hh\\:mm} - {slot.EndTime:hh\\:mm}"
                }).ToList(),
                TotalSlots = context.GeneratedSlots.Count
            };

            _logger.LogInformation("Generated {Count} available slots", response.TotalSlots);
            return response;
        }

        public async Task<bool> ValidateBookingWindowAsync(DateTime date, RoleType role)
        {
            var today = DateTime.Today;
            var maxDaysAhead = role == RoleType.Patient ? 30 : 90; // Patients: 30 days, Staff: 90 days
            
            return date.Date >= today && date.Date <= today.AddDays(maxDaysAhead);
        }

        private void GenerateRawSlots(SlotGenerationContext context)
        {
            var slots = new List<TimeSlot>();
            
            TimeSpan startTime = context.DoctorRecord?.StartTime ?? new TimeSpan(9, 0, 0);
            TimeSpan endTime = context.DoctorRecord?.EndTime ?? new TimeSpan(18, 0, 0);
            int slotDurationMin = context.DoctorRecord?.SlotDuration ?? 30;
            TimeSpan slotDuration = TimeSpan.FromMinutes(slotDurationMin);
            
            TimeSpan? breakStart = context.DoctorRecord?.BreakStartTime;
            TimeSpan? breakEnd = context.DoctorRecord?.BreakEndTime;

            var currentTime = startTime;

            while (currentTime.Add(slotDuration) <= endTime)
            {
                var slotEndTime = currentTime.Add(slotDuration);

                // Skip if overlaps with break time
                if (breakStart.HasValue && breakEnd.HasValue)
                {
                    if (!(slotEndTime <= breakStart || currentTime >= breakEnd))
                    {
                        currentTime = slotEndTime;
                        continue;
                    }
                }

                slots.Add(new TimeSlot
                {
                    SlotID = Guid.NewGuid(),
                    DoctorID = context.Doctor.UserID,
                    SlotDate = context.RequestedDate,
                    StartTime = currentTime,
                    EndTime = slotEndTime,
                    IsAvailable = true
                });

                currentTime = slotEndTime;
            }

            context.GeneratedSlots = slots;
        }

        private void ApplyLeaveRules(SlotGenerationContext context)
        {
            foreach (var leave in context.ApprovedLeaves)
            {
                if (leave.IsFullDay)
                {
                    // Full day leave - clear all slots
                    context.GeneratedSlots.Clear();
                    return;
                }

                // Partial day leave - remove overlapping slots
                var leaveStart = leave.StartDate.TimeOfDay;
                var leaveEnd = leave.EndDate.TimeOfDay;

                context.GeneratedSlots.RemoveAll(slot =>
                    !(slot.EndTime <= leaveStart || slot.StartTime >= leaveEnd));
            }
        }

        private void SubtractBookedSlots(SlotGenerationContext context)
        {
            context.GeneratedSlots.RemoveAll(generatedSlot =>
                context.BookedSlots.Any(bookedSlot =>
                    bookedSlot.StartTime == generatedSlot.StartTime &&
                    bookedSlot.EndTime == generatedSlot.EndTime));
        }
    }
}