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
            try
            {
                Console.WriteLine($"[APPOINTMENT] Creating appointment: PatientID={request.PatientID}, DoctorID={request.DoctorID}, Type={request.AppointmentType}");
                Console.WriteLine($"[APPOINTMENT] Date={request.AppointmentDate:yyyy-MM-dd}, StartTime={request.StartTime}, EndTime={request.EndTime}");
                
                // Convert time strings to TimeSpan
                TimeSpan startTimeSpan, endTimeSpan;
                if (!TimeSpan.TryParse(request.StartTime, out startTimeSpan))
                {
                    throw new ArgumentException($"Invalid start time format: {request.StartTime}");
                }
                if (!TimeSpan.TryParse(request.EndTime, out endTimeSpan))
                {
                    throw new ArgumentException($"Invalid end time format: {request.EndTime}");
                }
                
                // Find the actual patient record by user_id
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.user_id == request.PatientID);
                if (patient == null)
                {
                    // Create a new patient record if it doesn't exist
                    var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == request.PatientID);
                    if (user == null)
                    {
                        throw new InvalidOperationException($"No user found for ID: {request.PatientID}");
                    }
                    
                    patient = new Patient
                    {
                        patient_id = Guid.NewGuid(),
                        user_id = request.PatientID,
                        date_of_birth = DateOnly.FromDateTime(DateTime.Now.AddYears(-30)), // Default age
                        sex = 'U', // Unknown
                        country = "Unknown",
                        pincode = "000000",
                        city = "Unknown",
                        state = "Unknown",
                        blood_group = "Unknown",
                        consulted_before = false,
                        seeking_followup = false
                    };
                    
                    _context.Patients.Add(patient);
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"[PATIENT] Created new patient record: {patient.patient_id} for user: {request.PatientID}");
                }
                
                var appointment = new Appointment
                {
                    AppointmentID = Guid.NewGuid(),
                    PatientID = patient.patient_id, // Use actual patient_id
                    user_id = request.PatientID, // Store user_id for easier querying
                    DoctorID = request.DoctorID,
                    AppointmentDate = request.AppointmentDate,
                    StartTime = startTimeSpan,
                    EndTime = endTimeSpan,
                    AppointmentType = request.AppointmentType,
                    ReasonForVisit = request.ReasonForVisit,
                    Status = AppointmentStatus.Scheduled, // Set to Scheduled instead of Pending
                    CreatedBy = null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[APPOINTMENT] Appointment created successfully: {appointment.AppointmentID}");

                return await MapToDto(appointment);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[APPOINTMENT ERROR] Failed to create appointment: {ex.Message}");
                Console.WriteLine($"[APPOINTMENT ERROR] Stack trace: {ex.StackTrace}");
                throw;
            }
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

        public async Task<IEnumerable<AppointmentDto>> GetPatientAppointmentsAsync(Guid patientId)
        {
            Console.WriteLine($"[SERVICE DEBUG] GetPatientAppointmentsAsync called with patientId: {patientId}");
            
            // Try to find appointments by PatientID first, then by user_id as fallback
            var appointments = await _context.Appointments
                .Where(a => (a.PatientID == patientId || a.user_id == patientId) && !a.IsDeleted)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync();
            
            Console.WriteLine($"[SERVICE DEBUG] Found {appointments.Count} appointments");
            foreach (var apt in appointments)
            {
                Console.WriteLine($"[SERVICE DEBUG] Appointment: ID={apt.AppointmentID}, PatientID={apt.PatientID}, user_id={apt.user_id}, Date={apt.AppointmentDate:yyyy-MM-dd}, Status={apt.Status}");
            }
            
            var dtos = new List<AppointmentDto>();
            foreach (var app in appointments)
            {
                dtos.Add(await MapToDto(app));
            }
            
            Console.WriteLine($"[SERVICE DEBUG] Returning {dtos.Count} appointment DTOs");
            return dtos;
        }

        public async Task<AppointmentDto?> UpdateAppointmentStatusAsync(Guid appointmentId, int status)
        {
            Console.WriteLine($"[SERVICE DEBUG] UpdateAppointmentStatusAsync called with appointmentId: {appointmentId}, status: {status}");
            
            var appointment = await _context.Appointments.FirstOrDefaultAsync(a => a.AppointmentID == appointmentId);
            if (appointment == null) 
            {
                Console.WriteLine($"[SERVICE DEBUG] Appointment not found: {appointmentId}");
                return null;
            }

            Console.WriteLine($"[SERVICE DEBUG] Found appointment: {appointment.AppointmentID}, current status: {appointment.Status}");
            
            appointment.Status = (AppointmentStatus)status;
            appointment.UpdatedAt = DateTime.UtcNow;
            
            Console.WriteLine($"[SERVICE DEBUG] Updated appointment status to: {appointment.Status}");
            
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"[SERVICE DEBUG] Changes saved successfully");
            
            return await MapToDto(appointment);
        }

        private async Task<AppointmentDto> MapToDto(Appointment appointment)
        {
            // Use user_id to find the patient user, not PatientID
            var patient = await _context.Users.FindAsync(appointment.user_id ?? appointment.PatientID);
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
                StartTime = appointment.StartTime.ToString(@"hh\:mm"),
                EndTime = appointment.EndTime.ToString(@"hh\:mm"),
                Status = appointment.Status,
                AppointmentType = appointment.AppointmentType,
                ReasonForVisit = appointment.ReasonForVisit,
                CreatedAt = appointment.CreatedAt
            };
        }
    }
}
