using CMS.Application.Appointments.DTOs.Requests;
using CMS.Application.Appointments.DTOs.Responses;
using CMS.Application.Appointments.Interfaces;
using CMS.Data;
using CMS.Domain.Appointments.Entities;
using CMS.Domain.Appointments.Enums;
using CMS.Domain.Clinic.Entities;
using CMS.Domain.Clinic.Enums;
using Microsoft.EntityFrameworkCore;

namespace CMS.Application.Appointments.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly CmsDbContext _context;

        public AppointmentService(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentRequestDto request)
        {
            var appointment = new Appointment
            {
                AppointmentID = Guid.NewGuid(),
                PatientID = request.PatientID,
                DoctorID = request.DoctorID,
                AppointmentDate = request.AppointmentDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                AppointmentType = request.AppointmentType,
                ReasonForVisit = request.ReasonForVisit,
                Status = AppointmentStatus.Pending,
                CreatedBy = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            // Auto-add follow-up appointments to queue
            if (request.AppointmentType == AppointmentType.FollowUp)
            {
                try
                {
                    Console.WriteLine($"[FOLLOWUP] Creating queue entry for appointment {appointment.AppointmentID}");
                    
                    var patient = await _context.Patients.FirstOrDefaultAsync(p => p.patient_id == request.PatientID);
                    if (patient != null)
                    {
                        var queuePosition = await GetNextQueuePositionAsync(request.DoctorID, request.AppointmentDate, true);
                        
                        var queue = new PatientQueue
                        {
                            QueueID = Guid.NewGuid(),
                            AppointmentID = appointment.AppointmentID,
                            PatientID = request.PatientID,
                            DoctorID = request.DoctorID,
                            QueueZone = AppointmentType.FollowUp,
                            QueuePosition = queuePosition,
                            QueueStatus = QueueStatusType.Waiting,
                            AppointmentTimeSlot = request.StartTime,
                            AppointmentDate = request.AppointmentDate,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        
                        Console.WriteLine($"[FOLLOWUP] Queue entry: QueueID={queue.QueueID}, PatientID={queue.PatientID}, Date={queue.AppointmentDate:yyyy-MM-dd}");
                        
                        _context.PatientQueues.Add(queue);
                        await _context.SaveChangesAsync();
                        
                        Console.WriteLine($"[FOLLOWUP] Queue entry created successfully");
                    }
                    else
                    {
                        Console.WriteLine($"[FOLLOWUP ERROR] Patient not found for ID: {request.PatientID}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[FOLLOWUP ERROR] Failed to create queue entry: {ex.Message}");
                    Console.WriteLine($"[FOLLOWUP ERROR] Stack trace: {ex.StackTrace}");
                }
            }

            return await MapToDto(appointment);
        }
        
        private async Task<int> GetNextQueuePositionAsync(Guid doctorId, DateTime date, bool isFollowUp)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);

            var queueZone = isFollowUp 
                ? AppointmentType.FollowUp 
                : AppointmentType.Consultation;

            var maxPosition = await _context.PatientQueues
                .Where(q => q.DoctorID == doctorId 
                    && q.AppointmentDate >= startOfDay 
                    && q.AppointmentDate < endOfDay
                    && q.QueueZone == queueZone
                    && !q.IsDeleted)
                .MaxAsync(q => (int?)q.QueuePosition) ?? 0;

            return maxPosition + 1;
        }
        


        public async Task<AppointmentDto?> GetAppointmentByIdAsync(Guid id)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentID == id);

            if (appointment == null) return null;

            return await MapToDto(appointment);
        }

        public async Task<IEnumerable<AppointmentDto>> GetDoctorAppointmentsAsync(Guid doctorId, DateTime startDate, DateTime endDate)
        {
            IQueryable<Appointment> query = _context.Appointments;
            
            // If doctorId is not empty, filter by doctor
            if (doctorId != Guid.Empty)
            {
                query = query.Where(a => a.DoctorID == doctorId && !a.IsDeleted);
            }
            else
            {
                // For test endpoint, get all appointments including soft deleted
                query = query.IgnoreQueryFilters();
            }
            
            var appointments = await query.ToListAsync();
            
            var dtos = new List<AppointmentDto>();
            foreach (var app in appointments)
            {
                dtos.Add(await MapToDto(app));
            }
            return dtos;
        }

        private async Task<AppointmentDto> MapToDto(Appointment appointment)
        {
            var patient = await _context.Users.FindAsync(appointment.PatientID);
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorID == appointment.DoctorID);

            return new AppointmentDto
            {
                AppointmentID = appointment.AppointmentID,
                PatientID = appointment.PatientID,
                PatientName = patient?.Name ?? "Unknown",
                DoctorID = appointment.DoctorID,
                DoctorName = doctor?.User?.Name ?? "Unknown",
                AppointmentDate = appointment.AppointmentDate,
                StartTime = appointment.StartTime,
                EndTime = appointment.EndTime,
                Status = appointment.Status,
                AppointmentType = appointment.AppointmentType,
                ReasonForVisit = appointment.ReasonForVisit,
                CreatedAt = appointment.CreatedAt
            };
        }
    }
}
