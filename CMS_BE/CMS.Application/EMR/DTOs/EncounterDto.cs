using CMS.Domain.EMR.Enums;

namespace CMS.Application.EMR.DTOs
{
    public class EncounterDetailDto
    {
        public Guid EncounterID { get; set; }
        public Guid PatientID { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public Guid DoctorID { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public Guid AppointmentID { get; set; }
        public EncounterType EncounterType { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? PresentIllnessHistory { get; set; }
        public string? ClinicalNotes { get; set; }
        public string? PhysicalExamination { get; set; }
        public string? AssessmentAndPlan { get; set; }
        public DateTime EncounterDate { get; set; }
        
        public List<VitalSignsDto> VitalSigns { get; set; } = new();
        public List<DiagnosisDto> Diagnoses { get; set; } = new();
        public List<PrescriptionDto> Prescriptions { get; set; } = new();
        public List<LabTestDto> LabTests { get; set; } = new();
        public List<ObservationDto> Observations { get; set; } = new();
        public List<TreatmentPlanDto> TreatmentPlans { get; set; } = new();
        public List<MedicalReportDto> MedicalReports { get; set; } = new();
    }

    public class CreateEncounterDto
    {
        public Guid PatientID { get; set; }
        public Guid DoctorID { get; set; }
        public Guid AppointmentID { get; set; }
        public EncounterType EncounterType { get; set; }
        public string? ChiefComplaint { get; set; }
        public bool IsFollowUp { get; set; }
        public Guid? PreviousEncounterID { get; set; }
    }

    public class UpdateEncounterDto
    {
        public Guid EncounterID { get; set; }
        public string? ChiefComplaint { get; set; }
        public string? PresentIllnessHistory { get; set; }
        public string? ClinicalNotes { get; set; }
        public string? PhysicalExamination { get; set; }
        public string? AssessmentAndPlan { get; set; }
    }
}
