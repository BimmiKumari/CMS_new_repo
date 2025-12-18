using CMS.Application.EMR.DTOs;
using CMS.Domain.Clinic.Entities;

namespace CMS.Application.EMR.Interfaces
{
    public interface IPatientQueueRepository
    {
        Task<PatientQueue?> GetByIdAsync(Guid queueId);
        Task<List<PatientQueue>> GetQueueByDoctorAsync(Guid doctorId, DateTime date);
        Task<PatientQueue> CreateAsync(PatientQueue queue);
        Task<PatientQueue> UpdateAsync(PatientQueue queue);
        Task<bool> DeleteAsync(Guid queueId);
        Task<int> GetNextQueuePositionAsync(Guid doctorId, DateTime date, bool isFollowUp);
    }

    public interface IPatientQueueService
    {
        Task<DoctorQueueResponseDto> GetDoctorQueueAsync(Guid doctorId, DateTime date);
        Task<QueuePatientDto> AddToQueueAsync(Guid appointmentId);
        Task<QueuePatientDto> UpdateQueueStatusAsync(UpdateQueueStatusDto dto, Guid updatedBy);
        Task<bool> RemoveFromQueueAsync(Guid queueId);
    }
}
