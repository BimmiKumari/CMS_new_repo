using CMS.Application.Clinic.DTOs.Requests;
using CMS.Application.Clinic.DTOs.Responses;

namespace CMS.Application.Clinic.Interfaces
{
    public interface IDoctorService
    {
        Task<List<DoctorDto>> GetAllActiveDoctorsAsync();
        Task<DoctorDto?> GetDoctorProfileAsync(Guid doctorId);
        Task<bool> UpdateProfileAsync(Guid doctorId, DoctorProfileRequest request);
    }
}
