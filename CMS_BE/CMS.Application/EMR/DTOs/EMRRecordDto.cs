using CMS.Domain.EMR.Enums;

namespace CMS.Application.EMR.DTOs
{
    public class EMRRecordDto
    {
        public Guid EMRRecordID { get; set; }
        public Guid PatientID { get; set; }
        public string? MedicalRecordNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<EncounterSummaryDto> Encounters { get; set; } = new();
    }

    public class EncounterSummaryDto
    {
        public Guid EncounterID { get; set; }
        public DateTime EncounterDate { get; set; }
        public EncounterType EncounterType { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string? ChiefComplaint { get; set; }
        public List<string> Diagnoses { get; set; } = new();
    }

    public class CreateEMRRecordDto
    {
        public Guid PatientID { get; set; }
    }
}
