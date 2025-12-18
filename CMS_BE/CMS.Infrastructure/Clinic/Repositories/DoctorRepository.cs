using CMS.Data;
using CMS.Domain.Auth.Entities;
using CMS.Domain.Clinic.Entities;
using CMS.Application.Clinic.Interfaces;
using CMS.Application.Clinic.DTOs.Responses;
using Microsoft.EntityFrameworkCore;
using CMS.Domain.Auth.Enums;

namespace CMS.Infrastructure.Clinic.Repositories
{
    public class DoctorRepository : IDoctorRepository
    {
        private readonly CmsDbContext _context;

        public DoctorRepository(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<Doctor?> GetDoctorByIdAsync(Guid doctorId)
        {
            return await _context.Doctors
                .FirstOrDefaultAsync(d => d.DoctorID == doctorId);
        }

        public async Task<bool> IsDoctorActiveAsync(Guid doctorId)
        {
            return await _context.Users
                .AnyAsync(u => u.UserID == doctorId && u.IsActive && !u.IsDeleted);
        }

        public async Task<List<Doctor>> GetAllActiveDoctorsAsync()
        {
            var activeDoctorIds = await _context.Users
                .Where(u => u.Role == RoleType.Doctor && u.IsActive && !u.IsDeleted)
                .Select(u => u.UserID)
                .ToListAsync();

            return await _context.Doctors
                .Where(d => activeDoctorIds.Contains(d.DoctorID))
                .ToListAsync();
        }

        public async Task<List<DoctorWithUserDto>> GetAllActiveDoctorsWithUserAsync()
        {
            return await (from d in _context.Doctors
                          join u in _context.Users on d.DoctorID equals u.UserID
                          where u.Role == RoleType.Doctor 
                             && u.IsActive 
                             && !u.IsDeleted
                          select new DoctorWithUserDto
                          {
                              DoctorID = d.DoctorID,
                              Name = u.Name,
                              Specialization = d.Specialization,
                               YearOfExperience = d.YearOfExperience
                          }).ToListAsync();
        }
        
        public async Task<Doctor> CreateAsync(Doctor doctor)
        {
            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();
            return doctor;
        }

        public async Task<Doctor> UpdateAsync(Doctor doctor)
        {
            _context.Doctors.Update(doctor);
            await _context.SaveChangesAsync();
            return doctor;
        }
    }
}