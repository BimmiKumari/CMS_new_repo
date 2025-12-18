using CMS.Application.EMR.Interfaces;
using CMS.Data;
using CMS.Domain.Clinic.Entities;
using Microsoft.EntityFrameworkCore;

namespace CMS.Infrastructure.EMR.Repositories
{
    public class EncounterRepository : IEncounterRepository
    {
        private readonly CmsDbContext _context;

        public EncounterRepository(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<PatientEncounter?> GetByIdAsync(Guid encounterId)
        {
            return await _context.PatientEncounters
                .Include(e => e.Patient)
                .Include(e => e.Doctor)
                .Include(e => e.Appointment)
                .Include(e => e.VitalSigns)
                .Include(e => e.Diagnoses)
                .Include(e => e.Prescriptions)
                .Include(e => e.LabTests)
                .Include(e => e.Observations)
                .Include(e => e.TreatmentPlans)
                .Include(e => e.MedicalReports)
                .FirstOrDefaultAsync(e => e.EncounterID == encounterId && !e.IsDeleted);
        }

        public async Task<PatientEncounter?> GetByAppointmentIdAsync(Guid appointmentId)
        {
            return await _context.PatientEncounters
                .Include(e => e.Patient)
                .Include(e => e.Doctor)
                .FirstOrDefaultAsync(e => e.AppointmentID == appointmentId && !e.IsDeleted);
        }

        public async Task<List<PatientEncounter>> GetByPatientIdAsync(Guid patientId)
        {
            return await _context.PatientEncounters
                .Include(e => e.Doctor)
                .Include(e => e.Diagnoses)
                .Where(e => e.PatientID == patientId && !e.IsDeleted)
                .OrderByDescending(e => e.EncounterDate)
                .ToListAsync();
        }

        public async Task<PatientEncounter?> GetLatestEncounterByPatientIdAsync(Guid patientId)
        {
            return await _context.PatientEncounters
                .Include(e => e.Doctor)
                .Include(e => e.VitalSigns)
                .Include(e => e.Diagnoses)
                .Include(e => e.Prescriptions)
                .Where(e => e.PatientID == patientId && !e.IsDeleted)
                .OrderByDescending(e => e.EncounterDate)
                .FirstOrDefaultAsync();
        }

        public async Task<PatientEncounter> CreateAsync(PatientEncounter encounter)
        {
            encounter.CreatedAt = DateTime.UtcNow;
            encounter.UpdatedAt = DateTime.UtcNow;
            encounter.EncounterDate = DateTime.UtcNow;
            
            _context.PatientEncounters.Add(encounter);
            await _context.SaveChangesAsync();
            
            return encounter;
        }

        public async Task<PatientEncounter> UpdateAsync(PatientEncounter encounter)
        {
            encounter.UpdatedAt = DateTime.UtcNow;
            
            _context.PatientEncounters.Update(encounter);
            await _context.SaveChangesAsync();
            
            return encounter;
        }

        public async Task<bool> DeleteAsync(Guid encounterId)
        {
            var encounter = await _context.PatientEncounters.FindAsync(encounterId);
            if (encounter == null) return false;

            encounter.IsDeleted = true;
            encounter.DeletedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
