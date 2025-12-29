using CMS.Application.EMR.DTOs;
using CMS.Domain.Clinic.Entities;

namespace CMS.Application.EMR.Interfaces
{
    public interface IEncounterRepository
    {
        Task<PatientEncounter?> GetByIdAsync(Guid encounterId);
        Task<PatientEncounter?> GetByAppointmentIdAsync(Guid appointmentId);
        Task<List<PatientEncounter>> GetByPatientIdAsync(Guid patientId);
        Task<PatientEncounter?> GetLatestEncounterByPatientIdAsync(Guid patientId);
        Task<PatientEncounter> CreateAsync(PatientEncounter encounter);
        Task<PatientEncounter> UpdateAsync(PatientEncounter encounter);
        Task<bool> DeleteAsync(Guid encounterId);
    }

    public interface IEncounterService
    {
        Task<EncounterDetailDto?> GetEncounterByIdAsync(Guid encounterId, Guid requestingUserId, string userRole);
        Task<EncounterDetailDto> CreateEncounterAsync(CreateEncounterDto dto);
        Task<EncounterDetailDto> UpdateEncounterAsync(UpdateEncounterDto dto, Guid updatedBy, string userRole);
        Task<List<EncounterSummaryDto>> GetPatientEncountersAsync(Guid patientId);
        Task<List<EncounterSummaryDto>> GetUserEncountersAsync(Guid userId);
        
        // EMR Component methods
        Task<VitalSignsDto> AddVitalSignsAsync(CreateVitalSignsDto dto);
        Task<DiagnosisDto> AddDiagnosisAsync(CreateDiagnosisDto dto);
        Task<PrescriptionDto> AddPrescriptionAsync(CreatePrescriptionDto dto);
        Task<LabTestDto> AddLabTestAsync(CreateLabTestDto dto);
        Task<ObservationDto> AddObservationAsync(CreateObservationDto dto);
        Task<TreatmentPlanDto> AddTreatmentPlanAsync(CreateTreatmentPlanDto dto);
        Task<MedicalReportDto> AddMedicalReportAsync(CreateMedicalReportDto dto);
    }
}
