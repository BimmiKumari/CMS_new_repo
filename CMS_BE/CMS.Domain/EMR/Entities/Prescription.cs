using CMS.Domain.Clinic.Entities;
using CMS.Domain.EMR.Enums;

namespace CMS.Domain.EMR.Entities
{
    public class Prescription
    {
        public Guid PrescriptionID { get; set; }
        public Guid EMRRecordID { get; set; }
        public Guid EncounterID { get; set; }
        public Guid DoctorID { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public int Dosage { get; set; }
        public string Unit { get; set; } = string.Empty;
        public MedicationFrequency Frequency { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Navigation Properties
        public EMRRecord? EMRRecord { get; set; }
        public PatientEncounter? Encounter { get; set; }
    }
}
