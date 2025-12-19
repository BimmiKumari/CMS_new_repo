using CMS.Application.EMR.DTOs;
using CMS.Domain.EMR.Entities;

namespace CMS.Application.EMR.Interfaces
{
    public interface IEMRRepository
    {
        Task<EMRRecord?> GetByIdAsync(Guid emrRecordId);
        Task<EMRRecord?> GetByPatientIdAsync(Guid patientId);
        Task<EMRRecord?> GetByUserIdAsync(Guid userId); // New method for user-based lookup
        Task<EMRRecord> CreateAsync(EMRRecord emrRecord);
        Task<EMRRecord> UpdateAsync(EMRRecord emrRecord);
        Task<string> GenerateMedicalRecordNumberAsync();
    }

    public interface IEMRService
    {
        Task<EMRRecordDto?> GetEMRByPatientIdAsync(Guid patientId);
        Task<EMRRecordDto?> GetEMRByUserIdAsync(Guid userId); // New method for user-based lookup
        Task<EMRRecordDto> CreateEMRRecordAsync(CreateEMRRecordDto dto);
        Task<EMRRecordDto?> GetEMRByIdAsync(Guid emrRecordId);
    }
}
