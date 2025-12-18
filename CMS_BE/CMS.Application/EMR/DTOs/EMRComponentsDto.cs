using CMS.Domain.EMR.Enums;

namespace CMS.Application.EMR.DTOs
{
    public class VitalSignsDto
    {
        public Guid VitalSignsID { get; set; }
        public Guid EncounterID { get; set; }
        public decimal? Temperature { get; set; }
        public string? TemperatureUnit { get; set; }
        public int? SystolicBP { get; set; }
        public int? DiastolicBP { get; set; }
        public int? HeartRate { get; set; }
        public int? RespiratoryRate { get; set; }
        public decimal? OxygenSaturation { get; set; }
        public decimal? Height { get; set; }
        public decimal? Weight { get; set; }
        public decimal? BMI { get; set; }
        public string? Notes { get; set; }
        public DateTime RecordedAt { get; set; }
        public string RecordedByName { get; set; } = string.Empty;
    }

    public class CreateVitalSignsDto
    {
        public Guid EncounterID { get; set; }
        public decimal? Temperature { get; set; }
        public string? TemperatureUnit { get; set; } = "C";
        public int? SystolicBP { get; set; }
        public int? DiastolicBP { get; set; }
        public int? HeartRate { get; set; }
        public int? RespiratoryRate { get; set; }
        public decimal? OxygenSaturation { get; set; }
        public decimal? Height { get; set; }
        public decimal? Weight { get; set; }
        public string? Notes { get; set; }
        public Guid RecordedBy { get; set; }
    }

    public class DiagnosisDto
    {
        public Guid DiagnosisID { get; set; }
        public string DiagnosisCode { get; set; } = string.Empty;
        public string DiagnosisName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DiagnosisStatus Status { get; set; }
        public bool IsPrimary { get; set; }
        public DateTime DiagnosedAt { get; set; }
        public string DiagnosedByName { get; set; } = string.Empty;
    }

    public class CreateDiagnosisDto
    {
        public Guid EncounterID { get; set; }
        public string DiagnosisCode { get; set; } = string.Empty;
        public string DiagnosisName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DiagnosisStatus Status { get; set; }
        public bool IsPrimary { get; set; }
        public Guid DiagnosedBy { get; set; }
    }

    public class PrescriptionDto
    {
        public Guid PrescriptionID { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public int Dosage { get; set; }
        public string Unit { get; set; } = string.Empty;
        public MedicationFrequency Frequency { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePrescriptionDto
    {
        public Guid EncounterID { get; set; }
        public Guid DoctorID { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public int Dosage { get; set; }
        public string Unit { get; set; } = string.Empty;
        public MedicationFrequency Frequency { get; set; }
        public string Duration { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }

    public class LabTestDto
    {
        public Guid LabTestID { get; set; }
        public string TestName { get; set; } = string.Empty;
        public string? TestCode { get; set; }
        public string? TestCategory { get; set; }
        public LabTestStatus Status { get; set; }
        public string? Results { get; set; }
        public string? ResultsFileUrl { get; set; }
        public bool IsAbnormal { get; set; }
        public DateTime OrderedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public class CreateLabTestDto
    {
        public Guid EncounterID { get; set; }
        public string TestName { get; set; } = string.Empty;
        public string? TestCode { get; set; }
        public string? TestCategory { get; set; }
        public string? Instructions { get; set; }
        public Guid OrderedBy { get; set; }
    }

    public class ObservationDto
    {
        public Guid ObservationID { get; set; }
        public string ObservationName { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public string? ReferenceRange { get; set; }
        public DateTime DateRecorded { get; set; }
    }

    public class CreateObservationDto
    {
        public Guid EncounterID { get; set; }
        public string ObservationName { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public string? ReferenceRange { get; set; }
        public Guid StaffID { get; set; }
    }

    public class TreatmentPlanDto
    {
        public Guid TreatmentPlanID { get; set; }
        public string PlanDescription { get; set; } = string.Empty;
        public string? Goals { get; set; }
        public string? Instructions { get; set; }
        public string? DietaryAdvice { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateTreatmentPlanDto
    {
        public Guid EncounterID { get; set; }
        public string PlanDescription { get; set; } = string.Empty;
        public string? Goals { get; set; }
        public string? Instructions { get; set; }
        public string? Precautions { get; set; }
        public string? DietaryAdvice { get; set; }
        public string? LifestyleModifications { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string? FollowUpInstructions { get; set; }
        public Guid CreatedBy { get; set; }
    }

    public class MedicalReportDto
    {
        public Guid ReportID { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public ReportType ReportType { get; set; }
        public string Findings { get; set; } = string.Empty;
        public DateTime DateUploaded { get; set; }
        public string UploadedByName { get; set; } = string.Empty;
    }

    public class CreateMedicalReportDto
    {
        public Guid EncounterID { get; set; }
        public string FileUrl { get; set; } = string.Empty;
        public ReportType ReportType { get; set; }
        public string Findings { get; set; } = string.Empty;
        public Guid UploadedBy { get; set; }
    }
}
