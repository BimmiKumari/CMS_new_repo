using CMS.Domain.EMR.Enums;
using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    public class Diagnosis
    {
        public Guid DiagnosisID { get; set; }
        public Guid EMRRecordID { get; set; }
        public Guid EncounterID { get; set; }
        public string DiagnosisCode { get; set; } = string.Empty;
        public string DiagnosisName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DiagnosisStatus Status { get; set; }
        public bool IsPrimary { get; set; }
        public Guid DiagnosedBy { get; set; }
        public DateTime DiagnosedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Navigation Properties
        public EMRRecord? EMRRecord { get; set; }
        public PatientEncounter? Encounter { get; set; }
    }
}
