using CMS.Application.EMR.DTOs;
using CMS.Application.EMR.Interfaces;
using CMS.Data;
using CMS.Domain.Clinic.Entities;
using CMS.Domain.EMR.Entities;
using CMS.Domain.EMR.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CMS.Application.EMR.Services
{
    public class EncounterService : IEncounterService
    {
        private readonly IEncounterRepository _encounterRepository;
        private readonly IEMRRepository _emrRepository;
        private readonly CmsDbContext _context;
        private readonly ILogger<EncounterService> _logger;

        public EncounterService(
            IEncounterRepository encounterRepository,
            IEMRRepository emrRepository,
            CmsDbContext context,
            ILogger<EncounterService> logger)
        {
            _encounterRepository = encounterRepository;
            _emrRepository = emrRepository;
            _context = context;
            _logger = logger;
        }

        public async Task<EncounterDetailDto?> GetEncounterByIdAsync(Guid encounterId, Guid requestingUserId, string userRole)
        {
            var encounter = await _encounterRepository.GetByIdAsync(encounterId);
            if (encounter == null) return null;

            // Authorization check
            if (userRole == "Patient" && encounter.PatientID != requestingUserId)
            {
                throw new UnauthorizedAccessException("You can only view your own medical records");
            }

            return await MapToDetailDto(encounter);
        }

        public async Task<EncounterDetailDto> CreateEncounterAsync(CreateEncounterDto dto)
        {
            // Get or create EMR record for patient
            var emrRecord = await _emrRepository.GetByPatientIdAsync(dto.PatientID);
            if (emrRecord == null)
            {
                emrRecord = await _emrRepository.CreateAsync(new EMRRecord
                {
                    EMRRecordID = Guid.NewGuid(),
                    PatientID = dto.PatientID
                });
                _logger.LogInformation($"Created new EMR record {emrRecord.EMRRecordID} for patient {dto.PatientID}");
            }

            // Determine encounter type
            var encounterType = dto.EncounterType;
            if (dto.IsFollowUp)
            {
                encounterType = EncounterType.FollowUp;
            }

            var encounter = new PatientEncounter
            {
                EncounterID = Guid.NewGuid(),
                PatientID = dto.PatientID,
                DoctorID = dto.DoctorID,
                AppointmentID = dto.AppointmentID,
                EMRRecordID = emrRecord.EMRRecordID,
                EncounterType = encounterType,
                ChiefComplaint = dto.ChiefComplaint,
                ParentEncounterID = dto.PreviousEncounterID,
                EncounterDate = DateTime.UtcNow
            };

            var created = await _encounterRepository.CreateAsync(encounter);
            _logger.LogInformation($"Created encounter {created.EncounterID} for patient {dto.PatientID}");

            // Reload with includes
            var fullEncounter = await _encounterRepository.GetByIdAsync(created.EncounterID);
            return await MapToDetailDto(fullEncounter!);
        }

        public async Task<EncounterDetailDto> UpdateEncounterAsync(UpdateEncounterDto dto, Guid updatedBy, string userRole)
        {
            var encounter = await _encounterRepository.GetByIdAsync(dto.EncounterID);
            if (encounter == null)
                throw new Exception("Encounter not found");

            // Authorization check - only doctors and staff can edit
            if (userRole == "Patient")
            {
                throw new UnauthorizedAccessException("Patients cannot edit medical records");
            }

            // Update fields
            if (dto.ChiefComplaint != null)
                encounter.ChiefComplaint = dto.ChiefComplaint;
            if (dto.PresentIllnessHistory != null)
                encounter.PresentIllnessHistory = dto.PresentIllnessHistory;
            if (dto.ClinicalNotes != null)
                encounter.ClinicalNotes = dto.ClinicalNotes;
            if (dto.PhysicalExamination != null)
                encounter.PhysicalExamination = dto.PhysicalExamination;
            if (dto.AssessmentAndPlan != null)
                encounter.AssessmentAndPlan = dto.AssessmentAndPlan;

            encounter.UpdatedAt = DateTime.UtcNow;

            await _encounterRepository.UpdateAsync(encounter);
            _logger.LogInformation($"Updated encounter {encounter.EncounterID} by user {updatedBy}");

            var updated = await _encounterRepository.GetByIdAsync(encounter.EncounterID);
            return await MapToDetailDto(updated!);
        }

        public async Task<List<EncounterSummaryDto>> GetPatientEncountersAsync(Guid patientId)
        {
            var encounters = await _encounterRepository.GetByPatientIdAsync(patientId);
            var summaries = new List<EncounterSummaryDto>();

            foreach (var encounter in encounters)
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.DoctorID == encounter.DoctorID);

                var diagnoses = encounter.Diagnoses?
                    .Where(d => !d.IsDeleted)
                    .Select(d => d.DiagnosisName)
                    .ToList() ?? new List<string>();

                summaries.Add(new EncounterSummaryDto
                {
                    EncounterID = encounter.EncounterID,
                    EncounterDate = encounter.EncounterDate,
                    EncounterType = encounter.EncounterType,
                    DoctorName = doctor?.User != null ? $"Dr. {doctor.User.Name}" : "Unknown",
                    ChiefComplaint = encounter.ChiefComplaint,
                    Diagnoses = diagnoses
                });
            }

            return summaries;
        }

        // EMR Component Methods
        public async Task<VitalSignsDto> AddVitalSignsAsync(CreateVitalSignsDto dto)
        {
            var vitalSigns = new VitalSigns
            {
                VitalSignsID = Guid.NewGuid(),
                EncounterID = dto.EncounterID,
                Temperature = dto.Temperature,
                TemperatureUnit = dto.TemperatureUnit,
                SystolicBP = dto.SystolicBP,
                DiastolicBP = dto.DiastolicBP,
                HeartRate = dto.HeartRate,
                RespiratoryRate = dto.RespiratoryRate,
                OxygenSaturation = dto.OxygenSaturation,
                Height = dto.Height,
                Weight = dto.Weight,
                Notes = dto.Notes,
                RecordedBy = dto.RecordedBy,
                RecordedAt = DateTime.UtcNow
            };

            // Calculate BMI if height and weight are provided
            if (dto.Height.HasValue && dto.Weight.HasValue && dto.Height > 0)
            {
                var heightInMeters = dto.Height.Value / 100; // Convert cm to meters
                vitalSigns.BMI = Math.Round(dto.Weight.Value / (heightInMeters * heightInMeters), 2);
            }

            _context.VitalSigns.Add(vitalSigns);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(dto.RecordedBy);
            return new VitalSignsDto
            {
                VitalSignsID = vitalSigns.VitalSignsID,
                EncounterID = vitalSigns.EncounterID,
                Temperature = vitalSigns.Temperature,
                TemperatureUnit = vitalSigns.TemperatureUnit,
                SystolicBP = vitalSigns.SystolicBP,
                DiastolicBP = vitalSigns.DiastolicBP,
                HeartRate = vitalSigns.HeartRate,
                RespiratoryRate = vitalSigns.RespiratoryRate,
                OxygenSaturation = vitalSigns.OxygenSaturation,
                Height = vitalSigns.Height,
                Weight = vitalSigns.Weight,
                BMI = vitalSigns.BMI,
                Notes = vitalSigns.Notes,
                RecordedAt = vitalSigns.RecordedAt,
                RecordedByName = user?.Name ?? "Unknown"
            };
        }

        public async Task<DiagnosisDto> AddDiagnosisAsync(CreateDiagnosisDto dto)
        {
            var diagnosis = new Diagnosis
            {
                DiagnosisID = Guid.NewGuid(),
                EncounterID = dto.EncounterID,
                DiagnosisCode = dto.DiagnosisCode,
                DiagnosisName = dto.DiagnosisName,
                Description = dto.Description,
                Status = dto.Status,
                IsPrimary = dto.IsPrimary,
                DiagnosedBy = dto.DiagnosedBy,
                DiagnosedAt = DateTime.UtcNow
            };

            _context.Diagnoses.Add(diagnosis);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(dto.DiagnosedBy);
            return new DiagnosisDto
            {
                DiagnosisID = diagnosis.DiagnosisID,
                DiagnosisCode = diagnosis.DiagnosisCode,
                DiagnosisName = diagnosis.DiagnosisName,
                Description = diagnosis.Description,
                Status = diagnosis.Status,
                IsPrimary = diagnosis.IsPrimary,
                DiagnosedAt = diagnosis.DiagnosedAt,
                DiagnosedByName = user != null ? $"Dr. {user.Name}" : "Unknown"
            };
        }

        public async Task<PrescriptionDto> AddPrescriptionAsync(CreatePrescriptionDto dto)
        {
            _logger.LogInformation($"[PRESCRIPTION SERVICE] Processing {dto.Medicines?.Count ?? 0} medicines");
            
            foreach (var medicine in dto.Medicines)
            {
                _logger.LogInformation($"[PRESCRIPTION SERVICE] Raw medicine data: Name='{medicine.MedicineName}', Dosage='{medicine.Dosage}', Frequency='{medicine.Frequency}', Duration='{medicine.Duration}', Instructions='{medicine.Instructions}'");
                
                var frequency = ParseFrequency(medicine.Frequency);
                var dosage = ExtractDosageNumber(medicine.Dosage);
                var unit = ExtractDosageUnit(medicine.Dosage);
                
                _logger.LogInformation($"[PRESCRIPTION SERVICE] Parsed values: Dosage={dosage}, Unit='{unit}', Frequency={frequency}");
                
                var prescription = new Prescription
                {
                    PrescriptionID = Guid.NewGuid(),
                    EncounterID = dto.EncounterID,
                    DoctorID = dto.DoctorID,
                    MedicationName = string.IsNullOrEmpty(medicine.MedicineName) ? "Unknown Medicine" : medicine.MedicineName,
                    Dosage = dosage,
                    Unit = string.IsNullOrEmpty(unit) ? "mg" : unit,
                    Frequency = frequency,
                    Duration = string.IsNullOrEmpty(medicine.Duration) ? "Not specified" : medicine.Duration,
                    Notes = string.IsNullOrEmpty(dto.Notes) ? (string.IsNullOrEmpty(medicine.Instructions) ? "No notes" : medicine.Instructions) : dto.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                
                _logger.LogInformation($"[PRESCRIPTION SERVICE] Final prescription object: MedicationName='{prescription.MedicationName}', Dosage={prescription.Dosage}, Unit='{prescription.Unit}', Duration='{prescription.Duration}'");

                _context.Prescriptions.Add(prescription);
            }
            
            await _context.SaveChangesAsync();

            return new PrescriptionDto
            {
                PrescriptionID = Guid.NewGuid(),
                MedicationName = "Prescription saved",
                Dosage = dto.Medicines.Count,
                Unit = "medicines",
                Frequency = MedicationFrequency.OnceDaily,
                Duration = "",
                Notes = dto.Notes ?? "",
                CreatedAt = DateTime.UtcNow
            };
        }

        private MedicationFrequency ParseFrequency(string frequency)
        {
            return frequency?.ToLower() switch
            {
                "once daily" => MedicationFrequency.OnceDaily,
                "twice daily" => MedicationFrequency.TwiceDaily,
                "three times daily" => MedicationFrequency.ThreeTimesDaily,
                "four times daily" => MedicationFrequency.FourTimesDaily,
                "as needed" => MedicationFrequency.AsNeeded,
                _ => MedicationFrequency.OnceDaily
            };
        }

        private int ExtractDosageNumber(string dosage)
        {
            if (string.IsNullOrEmpty(dosage)) return 0;
            
            var numbers = System.Text.RegularExpressions.Regex.Match(dosage, @"\d+");
            return numbers.Success ? int.Parse(numbers.Value) : 0;
        }

        private string ExtractDosageUnit(string dosage)
        {
            if (string.IsNullOrEmpty(dosage)) return "";
            
            var unit = System.Text.RegularExpressions.Regex.Replace(dosage, @"\d+", "").Trim();
            return string.IsNullOrEmpty(unit) ? "mg" : unit;
        }

        public async Task<LabTestDto> AddLabTestAsync(CreateLabTestDto dto)
        {
            var labTest = new LabTest
            {
                LabTestID = Guid.NewGuid(),
                EncounterID = dto.EncounterID,
                TestName = dto.TestName,
                TestCode = dto.TestCode,
                TestCategory = dto.TestCategory,
                Instructions = dto.Instructions,
                OrderedBy = dto.OrderedBy,
                OrderedAt = DateTime.UtcNow,
                Status = LabTestStatus.Ordered
            };

            _context.LabTests.Add(labTest);
            await _context.SaveChangesAsync();

            return new LabTestDto
            {
                LabTestID = labTest.LabTestID,
                TestName = labTest.TestName,
                TestCode = labTest.TestCode,
                TestCategory = labTest.TestCategory,
                Status = labTest.Status,
                OrderedAt = labTest.OrderedAt
            };
        }

        public async Task<ObservationDto> AddObservationAsync(CreateObservationDto dto)
        {
            var observation = new Observation
            {
                ObservationID = Guid.NewGuid(),
                EncounterID = dto.EncounterID,
                ObservationName = dto.ObservationName,
                Value = dto.Value,
                Unit = dto.Unit,
                ReferenceRange = dto.ReferenceRange,
                StaffID = dto.StaffID,
                DateRecorded = DateTime.UtcNow
            };

            _context.Observations.Add(observation);
            await _context.SaveChangesAsync();

            return new ObservationDto
            {
                ObservationID = observation.ObservationID,
                ObservationName = observation.ObservationName,
                Value = observation.Value,
                Unit = observation.Unit,
                ReferenceRange = observation.ReferenceRange,
                DateRecorded = observation.DateRecorded
            };
        }

        public async Task<TreatmentPlanDto> AddTreatmentPlanAsync(CreateTreatmentPlanDto dto)
        {
            var treatmentPlan = new TreatmentPlan
            {
                TreatmentPlanID = Guid.NewGuid(),
                EncounterID = dto.EncounterID,
                PlanDescription = dto.PlanDescription,
                Goals = dto.Goals,
                Instructions = dto.Instructions,
                Precautions = dto.Precautions,
                DietaryAdvice = dto.DietaryAdvice,
                LifestyleModifications = dto.LifestyleModifications,
                FollowUpDate = dto.FollowUpDate,
                FollowUpInstructions = dto.FollowUpInstructions,
                CreatedBy = dto.CreatedBy
            };

            _context.TreatmentPlans.Add(treatmentPlan);
            await _context.SaveChangesAsync();

            return new TreatmentPlanDto
            {
                TreatmentPlanID = treatmentPlan.TreatmentPlanID,
                PlanDescription = treatmentPlan.PlanDescription,
                Goals = treatmentPlan.Goals,
                Instructions = treatmentPlan.Instructions,
                DietaryAdvice = treatmentPlan.DietaryAdvice,
                FollowUpDate = treatmentPlan.FollowUpDate,
                CreatedAt = treatmentPlan.CreatedAt
            };
        }

        public async Task<MedicalReportDto> AddMedicalReportAsync(CreateMedicalReportDto dto)
        {
            var medicalReport = new MedicalReport
            {
                ReportID = Guid.NewGuid(),
                EncounterID = dto.EncounterID,
                FileUrl = dto.FileUrl,
                ReportType = dto.ReportType,
                Findings = dto.Findings,
                UploadedBy = dto.UploadedBy,
                DateUploaded = DateTime.UtcNow
            };

            _context.MedicalReports.Add(medicalReport);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(dto.UploadedBy);
            return new MedicalReportDto
            {
                ReportID = medicalReport.ReportID,
                FileUrl = medicalReport.FileUrl,
                ReportType = medicalReport.ReportType,
                Findings = medicalReport.Findings,
                DateUploaded = medicalReport.DateUploaded,
                UploadedByName = user?.Name ?? "Unknown"
            };
        }

        private async Task<EncounterDetailDto> MapToDetailDto(PatientEncounter encounter)
        {
            var patient = await _context.Patients
                .Include(p => p.EMRRecord)
                .FirstOrDefaultAsync(p => p.patient_id == encounter.PatientID);
            
            var patientUser = await _context.Users.FindAsync(encounter.PatientID);
            
            var doctor = await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.DoctorID == encounter.DoctorID);

            var dto = new EncounterDetailDto
            {
                EncounterID = encounter.EncounterID,
                PatientID = encounter.PatientID,
                PatientName = patientUser?.Name ?? "Unknown",
                DoctorID = encounter.DoctorID,
                DoctorName = doctor?.User != null ? $"Dr. {doctor.User.Name}" : "Unknown",
                AppointmentID = encounter.AppointmentID,
                EncounterType = encounter.EncounterType,
                ChiefComplaint = encounter.ChiefComplaint,
                PresentIllnessHistory = encounter.PresentIllnessHistory,
                ClinicalNotes = encounter.ClinicalNotes,
                PhysicalExamination = encounter.PhysicalExamination,
                AssessmentAndPlan = encounter.AssessmentAndPlan,
                EncounterDate = encounter.EncounterDate
            };

            // Map vital signs
            if (encounter.VitalSigns != null)
            {
                foreach (var vs in encounter.VitalSigns.Where(v => !v.IsDeleted))
                {
                    var recordedByUser = await _context.Users.FindAsync(vs.RecordedBy);
                    dto.VitalSigns.Add(new VitalSignsDto
                    {
                        VitalSignsID = vs.VitalSignsID,
                        EncounterID = vs.EncounterID,
                        Temperature = vs.Temperature,
                        TemperatureUnit = vs.TemperatureUnit,
                        SystolicBP = vs.SystolicBP,
                        DiastolicBP = vs.DiastolicBP,
                        HeartRate = vs.HeartRate,
                        RespiratoryRate = vs.RespiratoryRate,
                        OxygenSaturation = vs.OxygenSaturation,
                        Height = vs.Height,
                        Weight = vs.Weight,
                        BMI = vs.BMI,
                        Notes = vs.Notes,
                        RecordedAt = vs.RecordedAt,
                        RecordedByName = recordedByUser?.Name ?? "Unknown"
                    });
                }
            }

            // Map diagnoses
            if (encounter.Diagnoses != null)
            {
                foreach (var d in encounter.Diagnoses.Where(d => !d.IsDeleted))
                {
                    var diagnosedByUser = await _context.Users.FindAsync(d.DiagnosedBy);
                    dto.Diagnoses.Add(new DiagnosisDto
                    {
                        DiagnosisID = d.DiagnosisID,
                        DiagnosisCode = d.DiagnosisCode,
                        DiagnosisName = d.DiagnosisName,
                        Description = d.Description,
                        Status = d.Status,
                        IsPrimary = d.IsPrimary,
                        DiagnosedAt = d.DiagnosedAt,
                        DiagnosedByName = diagnosedByUser != null ? $"Dr. {diagnosedByUser.Name}" : "Unknown"
                    });
                }
            }

            // Map prescriptions
            if (encounter.Prescriptions != null)
            {
                dto.Prescriptions = encounter.Prescriptions
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
                    }).ToList();
            }

            // Map lab tests
            if (encounter.LabTests != null)
            {
                dto.LabTests = encounter.LabTests
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
                    }).ToList();
            }

            // Map observations
            if (encounter.Observations != null)
            {
                dto.Observations = encounter.Observations
                    .Where(o => !o.IsDeleted)
                    .Select(o => new ObservationDto
                    {
                        ObservationID = o.ObservationID,
                        ObservationName = o.ObservationName,
                        Value = o.Value,
                        Unit = o.Unit,
                        ReferenceRange = o.ReferenceRange,
                        DateRecorded = o.DateRecorded
                    }).ToList();
            }

            // Map treatment plans
            if (encounter.TreatmentPlans != null)
            {
                dto.TreatmentPlans = encounter.TreatmentPlans
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
                    }).ToList();
            }

            // Map medical reports
            if (encounter.MedicalReports != null)
            {
                foreach (var mr in encounter.MedicalReports.Where(mr => !mr.IsDeleted))
                {
                    var uploadedByUser = await _context.Users.FindAsync(mr.UploadedBy);
                    dto.MedicalReports.Add(new MedicalReportDto
                    {
                        ReportID = mr.ReportID,
                        FileUrl = mr.FileUrl,
                        ReportType = mr.ReportType,
                        Findings = mr.Findings,
                        DateUploaded = mr.DateUploaded,
                        UploadedByName = uploadedByUser?.Name ?? "Unknown"
                    });
                }
            }

            return dto;
        }
    }
}
