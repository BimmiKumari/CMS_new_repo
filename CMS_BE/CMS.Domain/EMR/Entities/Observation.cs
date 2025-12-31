using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    public class Observation
    {
        public Guid ObservationID { get; set; }
        public Guid EMRRecordID { get; set; }
        public Guid EncounterID { get; set; }
        public string ObservationName { get; set; } = string.Empty;
        public string ReferenceRange { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string Unit { get; set; } = string.Empty;
        public DateTime DateRecorded { get; set; }
        public Guid StaffID { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Navigation Properties
        public EMRRecord? EMRRecord { get; set; }
        public PatientEncounter? Encounter { get; set; }
    }
}
