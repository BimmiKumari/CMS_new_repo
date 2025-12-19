using CMS.Domain.EMR.Enums;

namespace CMS.Application.EMR.DTOs
{
    public class EMRRecordDto
    {
        public Guid EMRRecordID { get; set; }
        public Guid? user_id { get; set; } // Primary user reference
        public Guid? PatientID { get; set; } // Optional, for backward compatibility
        public string? MedicalRecordNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<EncounterSummaryDto> Encounters { get; set; } = new();
    }

    public class EncounterSummaryDto
    {
        public Guid EncounterID { get; set; }
        public Guid AppointmentID { get; set; }
        public DateTime EncounterDate { get; set; }
        public EncounterType EncounterType { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string? ChiefComplaint { get; set; }
        public string? ClinicalNotes { get; set; }
        public List<DiagnosisDto> Diagnoses { get; set; } = new();
        public List<LabTestDto> LabTests { get; set; } = new();
        public List<ObservationDto> Observations { get; set; } = new();
        public List<PrescriptionDto> Prescriptions { get; set; } = new();
        public List<TreatmentPlanDto> TreatmentPlans { get; set; } = new();
        public List<VitalSignsDto> VitalSigns { get; set; } = new();
    }

    public class CreateEMRRecordDto
    {
        public Guid UserID { get; set; } // Primary user reference
        public Guid? PatientID { get; set; } // Optional, for backward compatibility
    }
}
