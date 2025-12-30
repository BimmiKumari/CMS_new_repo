using CMS.Data;
using CMS.Domain.Appointments.Entities;
using CMS.Application.Appointments.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.Appointments.Repositories
{
    public class TimeSlotRepository : ITimeSlotRepository
    {
        private readonly CmsDbContext _context;

        public TimeSlotRepository(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<List<TimeSlot>> GetBookedSlotsAsync(Guid doctorId, DateTime date)
        {
            // Get booked slots from Appointments table instead of TimeSlots table
            var bookedAppointments = await _context.Appointments
                .Where(a => a.DoctorID == doctorId 
                          && a.AppointmentDate.Date == date.Date 
                          && !a.IsDeleted
                          && a.Status != CMS.Domain.Appointments.Enums.AppointmentStatus.Cancelled)
                .ToListAsync();

            // Convert appointments to TimeSlot format for compatibility
            return bookedAppointments.Select(a => new TimeSlot
            {
                SlotID = Guid.NewGuid(),
                DoctorID = a.DoctorID,
                SlotDate = a.AppointmentDate,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                IsAvailable = false
            }).ToList();
        }

        public async Task<TimeSlot> CreateTimeSlotAsync(TimeSlot slot)
        {
            _context.TimeSlots.Add(slot);
            await _context.SaveChangesAsync();
            return slot;
        }
    }
}