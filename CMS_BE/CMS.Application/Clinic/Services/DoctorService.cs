using CMS.Application.Clinic.DTOs.Requests;
using CMS.Application.Clinic.DTOs.Responses;
using CMS.Application.Clinic.Interfaces;
using CMS.Data;
using CMS.Domain.Auth.Enums;
using CMS.Domain.Clinic.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CMS.Application.Clinic.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly CmsDbContext _context;
        private readonly ILogger<DoctorService> _logger;

        public DoctorService(
            CmsDbContext context,
            ILogger<DoctorService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<DoctorDto>> GetAllActiveDoctorsAsync()
        {
            _logger.LogInformation("Fetching all active doctors");

            // Join with Doctors table to get up-to-date profile info
            var doctors = await (from u in _context.Users
                                 join d in _context.Doctors on u.UserID equals d.DoctorID into dj
                                 from d in dj.DefaultIfEmpty()
                                 where u.Role == RoleType.Doctor && u.IsActive && !u.IsDeleted
                                 select new DoctorDto
                                 {
                                     Id = u.UserID,
                                     Name = u.Name,
                                     Email = u.Email,
                                     PhoneNumber = u.PhoneNumber,
                                     Specialization = d != null ? d.Specialization : "General",
                                     Qualification = d != null ? d.Qualification : "N/A",
                                     YearOfExperience = d != null ? d.YearOfExperience : 0,
                                     ProfilePictureURL = u.ProfilePictureURL,
                                     StartTime = d != null ? d.StartTime : new TimeSpan(9, 0, 0),
                                     EndTime = d != null ? d.EndTime : new TimeSpan(17, 0, 0),
                                     SlotDuration = d != null ? d.SlotDuration : 30,
                                     BreakStartTime = d != null ? d.BreakStartTime : null,
                                     BreakEndTime = d != null ? d.BreakEndTime : null
                                 }).ToListAsync();

            return doctors;
        }

        public async Task<DoctorDto?> GetDoctorProfileAsync(Guid doctorId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == doctorId && !u.IsDeleted);
            if (user == null) return null;

            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.DoctorID == doctorId);

            return new DoctorDto
            {
                Id = user.UserID,
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Specialization = doctor?.Specialization ?? string.Empty,
                Qualification = doctor?.Qualification ?? string.Empty,
                YearOfExperience = doctor?.YearOfExperience ?? 0,
                ProfilePictureURL = user.ProfilePictureURL,
                StartTime = doctor?.StartTime ?? new TimeSpan(9,0,0),
                EndTime = doctor?.EndTime ?? new TimeSpan(17,0,0),
                SlotDuration = doctor?.SlotDuration ?? 30,
                BreakStartTime = doctor?.BreakStartTime,
                BreakEndTime = doctor?.BreakEndTime
            };
        }

        public async Task<bool> UpdateProfileAsync(Guid doctorId, DoctorProfileRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == doctorId);
            if (user == null) return false;

            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.DoctorID == doctorId);
            bool isNew = false;
            if (doctor == null)
            {
                doctor = new Doctor { DoctorID = doctorId };
                isNew = true;
            }

            doctor.Specialization = request.Specialization;
            doctor.Qualification = request.Qualification;
            doctor.YearOfExperience = request.YearOfExperience;
            doctor.WorkingDays = request.WorkingDays;
            doctor.StartTime = TimeSpan.Parse(request.StartTime);
            doctor.EndTime = TimeSpan.Parse(request.EndTime);
            doctor.SlotDuration = request.SlotDuration;
            
            if (!string.IsNullOrEmpty(request.BreakStartTime))
                doctor.BreakStartTime = TimeSpan.Parse(request.BreakStartTime);
            
            if (!string.IsNullOrEmpty(request.BreakEndTime))
                doctor.BreakEndTime = TimeSpan.Parse(request.BreakEndTime);

            if (isNew)
                _context.Doctors.Add(doctor);
            else
                _context.Doctors.Update(doctor);

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
