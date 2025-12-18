using CMS.Application.Appointments.DTOs.Requests;
using CMS.Application.Appointments.DTOs.Responses;

namespace CMS.Application.Appointments.Interfaces
{
    public interface IAppointmentService
    {
        Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentRequestDto request);
        Task<AppointmentDto?> GetAppointmentByIdAsync(Guid id);
        Task<IEnumerable<AppointmentDto>> GetDoctorAppointmentsAsync(Guid doctorId, DateTime startDate, DateTime endDate);
    }
}
