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

        public async Task<EMRRecordDto?> GetEMRByUserIdAsync(Guid userId)
        {
            var emr = await _emrRepository.GetByUserIdAsync(userId);
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
            // Check if EMR already exists for this user
            var existingEmr = await _emrRepository.GetByUserIdAsync(dto.UserID);
            if (existingEmr != null)
            {
                _logger.LogWarning($"EMR already exists for user {dto.UserID}");
                return await MapToDto(existingEmr);
            }

            var emrRecord = new EMRRecord
            {
                EMRRecordID = Guid.NewGuid(),
                user_id = dto.UserID,
                PatientID = dto.PatientID, // Optional, for backward compatibility
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var created = await _emrRepository.CreateAsync(emrRecord);
            _logger.LogInformation($"Created EMR record {created.EMRRecordID} for user {dto.UserID}");

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
                        .Select(d => new DiagnosisDto
                        {
                            DiagnosisID = d.DiagnosisID,
                            DiagnosisCode = d.DiagnosisCode,
                            DiagnosisName = d.DiagnosisName,
                            Description = d.Description,
                            Status = d.Status,
                            IsPrimary = d.IsPrimary,
                            DiagnosedAt = d.DiagnosedAt
                        })
                        .ToList() ?? new List<DiagnosisDto>();

                    var labTests = encounter.LabTests?
                        .Where(lt => !lt.IsDeleted)
                        .Select(lt => new LabTestDto
                        {
                            LabTestID = lt.LabTestID,
                            TestName = lt.TestName,
                            TestCode = lt.TestCode,
                            TestCategory = lt.TestCategory,
                            Status = lt.Status,
                            Results = lt.Results,
                            ResultsFileUrl = lt.ResultsFileUrl,
                            IsAbnormal = lt.IsAbnormal,
                            OrderedAt = lt.OrderedAt,
                            CompletedAt = lt.CompletedAt
                        }).ToList() ?? new List<LabTestDto>();

                    var observations = encounter.Observations?
                        .Where(o => !o.IsDeleted)
                        .Select(o => new ObservationDto
                        {
                            ObservationID = o.ObservationID,
                            ObservationName = o.ObservationName,
                            Value = o.Value,
                            Unit = o.Unit,
                            ReferenceRange = o.ReferenceRange,
                            DateRecorded = o.DateRecorded
                        }).ToList() ?? new List<ObservationDto>();

                    var prescriptions = encounter.Prescriptions?
                        .Where(p => !p.IsDeleted)
                        .Select(p => new PrescriptionDto
                        {
                            PrescriptionID = p.PrescriptionID,
                            MedicationName = p.MedicationName,
                            Dosage = p.Dosage,
                            Unit = p.Unit,
                            Frequency = p.Frequency,
                            Duration = p.Duration,
                            Notes = p.Notes,
                            CreatedAt = p.CreatedAt
                        }).ToList() ?? new List<PrescriptionDto>();

                    var treatmentPlans = encounter.TreatmentPlans?
                        .Where(tp => !tp.IsDeleted)
                        .Select(tp => new TreatmentPlanDto
                        {
                            TreatmentPlanID = tp.TreatmentPlanID,
                            PlanDescription = tp.PlanDescription,
                            Goals = tp.Goals,
                            Instructions = tp.Instructions,
                            DietaryAdvice = tp.DietaryAdvice,
                            FollowUpDate = tp.FollowUpDate,
                            CreatedAt = tp.CreatedAt
                        }).ToList() ?? new List<TreatmentPlanDto>();

                    var vitalSigns = encounter.VitalSigns?
                        .Where(v => !v.IsDeleted)
                        .Select(v => new VitalSignsDto
                        {
                            VitalSignsID = v.VitalSignsID,
                            EncounterID = v.EncounterID,
                            Temperature = v.Temperature,
                            TemperatureUnit = v.TemperatureUnit,
                            SystolicBP = v.SystolicBP,
                            DiastolicBP = v.DiastolicBP,
                            HeartRate = v.HeartRate,
                            RespiratoryRate = v.RespiratoryRate,
                            OxygenSaturation = v.OxygenSaturation,
                            Height = v.Height,
                            Weight = v.Weight,
                            BMI = v.BMI,
                            Notes = v.Notes,
                            RecordedAt = v.RecordedAt
                        }).ToList() ?? new List<VitalSignsDto>();

                    encounters.Add(new EncounterSummaryDto
                    {
                        EncounterID = encounter.EncounterID,
                        EncounterDate = encounter.EncounterDate,
                        EncounterType = encounter.EncounterType,
                        DoctorName = doctor?.User != null ? $"Dr. {doctor.User.Name}" : "Unknown",
                        ChiefComplaint = encounter.ChiefComplaint,
                        ClinicalNotes = encounter.ClinicalNotes,
                        Diagnoses = diagnoses,
                        LabTests = labTests,
                        Observations = observations,
                        Prescriptions = prescriptions,
                        TreatmentPlans = treatmentPlans,
                        VitalSigns = vitalSigns
                    });
                }
            }

            return new EMRRecordDto
            {
                EMRRecordID = emr.EMRRecordID,
                user_id = emr.user_id,
                PatientID = emr.PatientID,
                MedicalRecordNumber = emr.MedicalRecordNumber,
                CreatedAt = emr.CreatedAt,
                UpdatedAt = emr.UpdatedAt,
                Encounters = encounters
            };
        }
    }
}
