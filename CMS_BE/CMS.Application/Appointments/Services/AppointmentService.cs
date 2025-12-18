using CMS.Application.Appointments.DTOs.Requests;
using CMS.Application.Appointments.DTOs.Responses;
using CMS.Application.Appointments.Interfaces;
using CMS.Data;
using CMS.Domain.Appointments.Entities;
using CMS.Domain.Appointments.Enums;
using Microsoft.EntityFrameworkCore;

namespace CMS.Application.Appointments.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly CmsDbContext _context;

        public AppointmentService(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentRequestDto request)
        {
            var appointment = new Appointment
            {
                AppointmentID = Guid.NewGuid(),
                PatientID = request.PatientID,
                DoctorID = request.DoctorID,
                AppointmentDate = request.AppointmentDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                AppointmentType = request.AppointmentType,
                ReasonForVisit = request.ReasonForVisit,
                Status = AppointmentStatus.Pending,
                CreatedBy = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return await MapToDto(appointment);
        }

        public async Task<AppointmentDto?> GetAppointmentByIdAsync(Guid id)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentID == id);

            if (appointment == null) return null;

            return await MapToDto(appointment);
        }

        public async Task<IEnumerable<AppointmentDto>> GetDoctorAppointmentsAsync(Guid doctorId, DateTime startDate, DateTime endDate)
        {
            IQueryable<Appointment> query = _context.Appointments;
            
            // If doctorId is not empty, filter by doctor
            if (doctorId != Guid.Empty)
            {
                query = query.Where(a => a.DoctorID == doctorId && !a.IsDeleted);
            }
            else
            {
                // For test endpoint, get all appointments including soft deleted
                query = query.IgnoreQueryFilters();
            }
            
            var appointments = await query.ToListAsync();
            
            var dtos = new List<AppointmentDto>();
            foreach (var app in appointments)
            {
                dtos.Add(await MapToDto(app));
            }
            return dtos;
        }

        private async Task<AppointmentDto> MapToDto(Appointment appointment)
        {
            var patient = await _context.Users.FindAsync(appointment.PatientID);
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorID == appointment.DoctorID);

            return new AppointmentDto
            {
                AppointmentID = appointment.AppointmentID,
                PatientID = appointment.PatientID,
                PatientName = patient?.Name ?? "Unknown",
                DoctorID = appointment.DoctorID,
                DoctorName = doctor?.User?.Name ?? "Unknown",
                AppointmentDate = appointment.AppointmentDate,
                StartTime = appointment.StartTime,
                EndTime = appointment.EndTime,
                Status = appointment.Status,
                AppointmentType = appointment.AppointmentType,
                ReasonForVisit = appointment.ReasonForVisit,
                CreatedAt = appointment.CreatedAt
            };
        }
    }
}
