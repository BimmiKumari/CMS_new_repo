using CMS.Application.EMR.Interfaces;
using CMS.Data;
using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.EMR.Repositories
{
    public class EMRRepository : IEMRRepository
    {
        private readonly CmsDbContext _context;

        public EMRRepository(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<EMRRecord?> GetByIdAsync(Guid emrRecordId)
        {
            return await _context.EMRRecords
                .Include(e => e.Patient)
                .Include(e => e.Encounters)
                .FirstOrDefaultAsync(e => e.EMRRecordID == emrRecordId && !e.IsDeleted);
        }

        public async Task<EMRRecord?> GetByPatientIdAsync(Guid patientId)
        {
            // First, try to find the patient to see if they have a user_id
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.patient_id == patientId);

            if (patient != null && patient.user_id.HasValue)
            {
                // If patient has a user_id, find EMR by user_id
                return await GetByUserIdAsync(patient.user_id.Value);
            }

            // Fallback to finding by PatientID (for legacy records or if user_id is missing)
            return await _context.EMRRecords
                .Include(e => e.Patient)
                .Include(e => e.Encounters)
                    .ThenInclude(enc => enc.Diagnoses)
                .FirstOrDefaultAsync(e => e.PatientID == patientId && !e.IsDeleted);
        }

        public async Task<EMRRecord?> GetByUserIdAsync(Guid userId)
        {
            return await _context.EMRRecords
                .Include(e => e.User)
                .Include(e => e.Patient)
                .Include(e => e.Encounters)
                    .ThenInclude(enc => enc.Diagnoses)
                .FirstOrDefaultAsync(e => e.user_id == userId && !e.IsDeleted);
        }

        public async Task<EMRRecord> CreateAsync(EMRRecord emrRecord)
        {
            emrRecord.CreatedAt = DateTime.UtcNow;
            emrRecord.UpdatedAt = DateTime.UtcNow;
            emrRecord.MedicalRecordNumber = await GenerateMedicalRecordNumberAsync();
            
            _context.EMRRecords.Add(emrRecord);
            await _context.SaveChangesAsync();
            
            return emrRecord;
        }

        public async Task<EMRRecord> UpdateAsync(EMRRecord emrRecord)
        {
            emrRecord.UpdatedAt = DateTime.UtcNow;
            
            _context.EMRRecords.Update(emrRecord);
            await _context.SaveChangesAsync();
            
            return emrRecord;
        }

        public async Task<string> GenerateMedicalRecordNumberAsync()
        {
            // Generate MRN in format: MRN-YYYYMMDD-XXXX
            var today = DateTime.UtcNow;
            var datePrefix = today.ToString("yyyyMMdd");
            
            var todayRecords = await _context.EMRRecords
                .Where(e => e.MedicalRecordNumber != null && e.MedicalRecordNumber.StartsWith($"MRN-{datePrefix}"))
                .CountAsync();
            
            var sequence = (todayRecords + 1).ToString("D4");
            
            return $"MRN-{datePrefix}-{sequence}";
        }
    }
}
