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
            // First, try to find the patient to see if they have a user_id
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.patient_id == patientId);

            if (patient != null && patient.user_id.HasValue)
            {
                // If patient has a user_id, find all encounters for that user via EMRRecord
                var emr = await _context.EMRRecords
                    .Include(e => e.Encounters)
                        .ThenInclude(enc => enc.Doctor)
                    .Include(e => e.Encounters)
                        .ThenInclude(enc => enc.Diagnoses)
                    .Include(e => e.Encounters)
                        .ThenInclude(enc => enc.LabTests)
                    .Include(e => e.Encounters)
                        .ThenInclude(enc => enc.Observations)
                    .Include(e => e.Encounters)
                        .ThenInclude(enc => enc.Prescriptions)
                    .Include(e => e.Encounters)
                        .ThenInclude(enc => enc.TreatmentPlans)
                    .Include(e => e.Encounters)
                        .ThenInclude(enc => enc.VitalSigns)
                    .FirstOrDefaultAsync(e => e.user_id == patient.user_id.Value && !e.IsDeleted);

                if (emr != null && emr.Encounters != null)
                {
                    return emr.Encounters
                        .Where(e => !e.IsDeleted)
                        .OrderByDescending(e => e.EncounterDate)
                        .ToList();
                }
            }

            // Fallback to finding by PatientID
            return await _context.PatientEncounters
                .Include(e => e.Doctor)
                .Include(e => e.Diagnoses)
                .Include(e => e.LabTests)
                .Include(e => e.Observations)
                .Include(e => e.Prescriptions)
                .Include(e => e.TreatmentPlans)
                .Include(e => e.VitalSigns)
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
                .Include(e => e.LabTests)
                .Include(e => e.Observations)
                .Include(e => e.TreatmentPlans)
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
