using CMS.Application.EMR.DTOs;
using CMS.Application.EMR.Interfaces;
using CMS.Data;
using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CMS.Application.EMR.Services
{
    public class EMRService : IEMRService
    {
        private readonly IEMRRepository _emrRepository;
        private readonly CmsDbContext _context;
        private readonly ILogger<EMRService> _logger;

        public EMRService(
            IEMRRepository emrRepository,
            CmsDbContext context,
            ILogger<EMRService> logger)
        {
            _emrRepository = emrRepository;
            _context = context;
            _logger = logger;
        }

        public async Task<EMRRecordDto?> GetEMRByPatientIdAsync(Guid patientId)
        {
            var emr = await _emrRepository.GetByPatientIdAsync(patientId);
            if (emr == null) return null;

            return await MapToDto(emr);
        }

        public async Task<EMRRecordDto?> GetEMRByIdAsync(Guid emrRecordId)
        {
            var emr = await _emrRepository.GetByIdAsync(emrRecordId);
            if (emr == null) return null;

            return await MapToDto(emr);
        }

        public async Task<EMRRecordDto> CreateEMRRecordAsync(CreateEMRRecordDto dto)
        {
            // Check if EMR already exists for this patient
            var existingEmr = await _emrRepository.GetByPatientIdAsync(dto.PatientID);
            if (existingEmr != null)
            {
                _logger.LogWarning($"EMR already exists for patient {dto.PatientID}");
                return await MapToDto(existingEmr);
            }

            var emrRecord = new EMRRecord
            {
                EMRRecordID = Guid.NewGuid(),
                PatientID = dto.PatientID,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var created = await _emrRepository.CreateAsync(emrRecord);
            _logger.LogInformation($"Created EMR record {created.EMRRecordID} for patient {dto.PatientID}");

            return await MapToDto(created);
        }

        private async Task<EMRRecordDto> MapToDto(EMRRecord emr)
        {
            var encounters = new List<EncounterSummaryDto>();

            if (emr.Encounters != null && emr.Encounters.Any())
            {
                foreach (var encounter in emr.Encounters.Where(e => !e.IsDeleted).OrderByDescending(e => e.EncounterDate))
                {
                    var doctor = await _context.Doctors
                        .Include(d => d.User)
                        .FirstOrDefaultAsync(d => d.DoctorID == encounter.DoctorID);

                    var diagnoses = encounter.Diagnoses?
                        .Where(d => !d.IsDeleted)
                        .Select(d => d.DiagnosisName)
                        .ToList() ?? new List<string>();

                    encounters.Add(new EncounterSummaryDto
                    {
                        EncounterID = encounter.EncounterID,
                        EncounterDate = encounter.EncounterDate,
                        EncounterType = encounter.EncounterType,
                        DoctorName = doctor?.User != null ? $"Dr. {doctor.User.Name}" : "Unknown",
                        ChiefComplaint = encounter.ChiefComplaint,
                        Diagnoses = diagnoses
                    });
                }
            }

            return new EMRRecordDto
            {
                EMRRecordID = emr.EMRRecordID,
                PatientID = emr.PatientID,
                MedicalRecordNumber = emr.MedicalRecordNumber,
                CreatedAt = emr.CreatedAt,
                UpdatedAt = emr.UpdatedAt,
                Encounters = encounters
            };
        }
    }
}
