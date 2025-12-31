using CMS.Application.EMR.Interfaces;
using CMS.Data;
using CMS.Domain.Clinic.Entities;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.EMR.Repositories
{
    public class PatientQueueRepository : IPatientQueueRepository
    {
        private readonly CmsDbContext _context;

        public PatientQueueRepository(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<PatientQueue?> GetByIdAsync(Guid queueId)
        {
            return await _context.PatientQueues
                .Include(q => q.Appointment)
                .Include(q => q.Patient)
                .Include(q => q.Doctor)
                .FirstOrDefaultAsync(q => q.QueueID == queueId && !q.IsDeleted);
        }

        public async Task<List<PatientQueue>> GetQueueByDoctorAsync(Guid doctorId, DateTime date)
        {
            var today = DateTime.Now.Date;
            var futureDate = today.AddDays(30);

            var result = await _context.PatientQueues
                .Include(q => q.Appointment)
                .Include(q => q.Patient)
                .Include(q => q.Doctor)
                .Where(q => q.DoctorID == doctorId 
                    && q.AppointmentDate.Date >= today
                    && q.AppointmentDate.Date <= futureDate
                    && !q.IsDeleted
                    && q.QueueStatus != CMS.Domain.Clinic.Enums.QueueStatusType.Completed)
                .OrderBy(q => q.AppointmentDate)
                .ThenBy(q => q.QueueZone)
                .ThenBy(q => q.AppointmentTimeSlot)
                .ThenBy(q => q.QueuePosition)
                .ToListAsync();

            Console.WriteLine($"[DEBUG] GetQueueByDoctorAsync - DoctorId: {doctorId}");
            Console.WriteLine($"[DEBUG] Looking for appointments from: {today:yyyy-MM-dd} to {futureDate:yyyy-MM-dd}");
            Console.WriteLine($"[DEBUG] Found {result.Count} queue entries (excluding completed)");
            
            // Check if there are any appointments at all for this doctor
            var totalAppointments = await _context.Appointments
                .Where(a => a.DoctorID == doctorId)
                .CountAsync();
            Console.WriteLine($"[DEBUG] Total appointments for doctor: {totalAppointments}");
            
            // Check if there are any queue entries at all for this doctor
            var totalQueues = await _context.PatientQueues
                .Where(q => q.DoctorID == doctorId && !q.IsDeleted)
                .CountAsync();
            Console.WriteLine($"[DEBUG] Total queue entries for doctor: {totalQueues}");
            
            return result;
        }

        public async Task<PatientQueue> CreateAsync(PatientQueue queue)
        {
            queue.CreatedAt = DateTime.UtcNow;
            queue.UpdatedAt = DateTime.UtcNow;
            
            _context.PatientQueues.Add(queue);
            await _context.SaveChangesAsync();
            
            return queue;
        }

        public async Task<PatientQueue> UpdateAsync(PatientQueue queue)
        {
            queue.UpdatedAt = DateTime.UtcNow;
            
            _context.PatientQueues.Update(queue);
            await _context.SaveChangesAsync();
            
            return queue;
        }

        public async Task<bool> DeleteAsync(Guid queueId)
        {
            var queue = await _context.PatientQueues.FindAsync(queueId);
            if (queue == null) return false;

            queue.IsDeleted = true;
            queue.DeletedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetNextQueuePositionAsync(Guid doctorId, DateTime date, bool isFollowUp)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);

            var queueZone = isFollowUp 
                ? CMS.Domain.Appointments.Enums.AppointmentType.FollowUp 
                : CMS.Domain.Appointments.Enums.AppointmentType.Consultation;

            var maxPosition = await _context.PatientQueues
                .Where(q => q.DoctorID == doctorId 
                    && q.AppointmentDate >= startOfDay 
                    && q.AppointmentDate < endOfDay
                    && q.QueueZone == queueZone
                    && !q.IsDeleted)
                .MaxAsync(q => (int?)q.QueuePosition) ?? 0;

            return maxPosition + 1;
        }
    }
}
