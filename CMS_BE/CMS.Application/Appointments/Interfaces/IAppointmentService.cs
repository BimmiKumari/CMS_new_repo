using CMS.Application.Appointments.DTOs.Requests;
using CMS.Application.Appointments.DTOs.Responses;
using CMS.Domain.Appointments.Enums;

namespace CMS.Application.Appointments.Interfaces
{
    public interface IAppointmentService
    {
        Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentRequestDto request);
        Task<AppointmentDto?> GetAppointmentByIdAsync(Guid id);
        Task<IEnumerable<AppointmentDto>> GetDoctorAppointmentsAsync(Guid doctorId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<AppointmentDto>> GetPatientAppointmentsAsync(Guid patientId);
        Task<AppointmentDto?> UpdateAppointmentStatusAsync(Guid appointmentId, int status);
        Task<bool> DeleteAppointmentAsync(Guid appointmentId);
    }
}
