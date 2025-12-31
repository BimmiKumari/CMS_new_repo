using CMS.Domain.EMR.Enums;
using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    public class MedicalReport
    {
        public Guid ReportID { get; set; }
        public Guid EMRRecordID { get; set; }
        public Guid EncounterID { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public ReportType ReportType { get; set; }
        public string Findings { get; set; } = string.Empty;
        public Guid UploadedBy { get; set; }
        public DateTime DateUploaded { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Navigation Properties
        public EMRRecord? EMRRecord { get; set; }
        public PatientEncounter? Encounter { get; set; }
    }
}
