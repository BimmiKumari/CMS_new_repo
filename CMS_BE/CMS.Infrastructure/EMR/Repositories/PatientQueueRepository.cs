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
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(30); // Extended to 30 days to catch follow-ups

            var result = await _context.PatientQueues
                .Include(q => q.Appointment)
                .Include(q => q.Patient)
                .Include(q => q.Doctor)
                .Where(q => q.DoctorID == doctorId 
                    && q.AppointmentDate.Date >= startOfDay 
                    && q.AppointmentDate.Date < endOfDay
                    && !q.IsDeleted)
                .OrderBy(q => q.AppointmentDate)
                .ThenBy(q => q.QueueZone)
                .ThenBy(q => q.AppointmentTimeSlot)
                .ThenBy(q => q.QueuePosition)
                .ToListAsync();

            // Debug logging
            Console.WriteLine($"[DEBUG] GetQueueByDoctorAsync - DoctorId: {doctorId}, Date: {date:yyyy-MM-dd}");
            Console.WriteLine($"[DEBUG] Date range: {startOfDay:yyyy-MM-dd HH:mm:ss} to {endOfDay:yyyy-MM-dd HH:mm:ss} (30 days)");
            Console.WriteLine($"[DEBUG] Found {result.Count} queue entries");
            
            foreach (var q in result)
            {
                Console.WriteLine($"[DEBUG] Queue: {q.QueueID}, Patient: {q.PatientID}, AppointmentDate: {q.AppointmentDate:yyyy-MM-dd HH:mm:ss}, Zone: {q.QueueZone}");
            }

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
