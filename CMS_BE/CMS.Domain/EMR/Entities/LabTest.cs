using CMS.Domain.EMR.Enums;
using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    public class LabTest
    {
        public Guid LabTestID { get; set; }
        public Guid EMRRecordID { get; set; }
        public Guid EncounterID { get; set; }
        public string TestName { get; set; } = string.Empty;
        public string? TestCode { get; set; }
        public string? TestCategory { get; set; }
        public LabTestStatus Status { get; set; }
        public string? Instructions { get; set; }
        public string? Results { get; set; }
        public string? ResultsFileUrl { get; set; }
        public string? Interpretation { get; set; }
        public bool IsAbnormal { get; set; }
        public Guid OrderedBy { get; set; }
        public Guid? PerformedBy { get; set; }
        public DateTime OrderedAt { get; set; }
        public DateTime? SampleCollectedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Navigation Properties
        public EMRRecord? EMRRecord { get; set; }
        public PatientEncounter? Encounter { get; set; }
    }
}
