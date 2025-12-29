using CMS.Application.EMR.DTOs;
using CMS.Application.EMR.Interfaces;
using CMS.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace CMS.Api.Controllers.EMR
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EncounterController : ControllerBase
    {
        private readonly IEncounterService _encounterService;
        private readonly ILogger<EncounterController> _logger;
        private readonly CmsDbContext _context;

        public EncounterController(
            IEncounterService encounterService,
            ILogger<EncounterController> logger,
            CmsDbContext context)
        {
            _encounterService = encounterService;
            _logger = logger;
            _context = context;
        }

        /// <summary>
        /// Get encounter details by ID
        /// </summary>
        [HttpGet("{encounterId}")]
        public async Task<ActionResult<EncounterDetailDto>> GetEncounterById(Guid encounterId)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? throw new UnauthorizedAccessException("User ID not found"));
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "Patient";

                var encounter = await _encounterService.GetEncounterByIdAsync(encounterId, userId, userRole);
                if (encounter == null)
                    return NotFound(new { message = "Encounter not found" });

                return Ok(encounter);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving encounter {encounterId}");
                return StatusCode(500, new { message = "An error occurred while retrieving the encounter" });
            }
        }

        [HttpGet("debug/user/{userId}")]
        public async Task<ActionResult> DebugUserData(Guid userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                var patients = await _context.Patients.Where(p => p.user_id == userId).ToListAsync();
                var allEncounters = new List<object>();
                
                foreach (var patient in patients)
                {
                    var encounters = await _context.PatientEncounters
                        .Where(e => e.PatientID == patient.patient_id)
                        .Select(e => new {
                            e.EncounterID,
                            e.PatientID,
                            e.DoctorID,
                            e.EncounterDate,
                            e.ChiefComplaint,
                            DiagnosesCount = e.Diagnoses.Count(),
                            PrescriptionsCount = e.Prescriptions.Count()
                        })
                        .ToListAsync();
                    allEncounters.AddRange(encounters);
                }
                
                return Ok(new {
                    success = true,
                    data = new {
                        user = user?.Name,
                        userId = userId,
                        patientsCount = patients.Count,
                        patients = patients.Select(p => new { p.patient_id, p.user_id }),
                        encountersCount = allEncounters.Count,
                        encounters = allEncounters
                    }
                });
            }
            catch (Exception ex)
            {
                return Ok(new { success = false, error = ex.Message });
            }
        }

        /// <summary>
        /// Get all encounters for a user (finds patient by user ID first)
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<EncounterSummaryDto>>> GetUserEncounters(Guid userId)
        {
            try
            {
                var encounters = await _encounterService.GetUserEncountersAsync(userId);
                return Ok(new { success = true, data = encounters, message = "" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving encounters for user {userId}");
                return Ok(new { success = true, data = new List<object>(), message = "No encounters found" });
            }
        }

        /// <summary>
        /// Get all encounters for a patient
        /// </summary>
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<EncounterSummaryDto>>> GetPatientEncounters(Guid patientId)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? throw new UnauthorizedAccessException("User ID not found"));
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "Patient";

                // Patients can only view their own encounters
                if (userRole == "Patient" && userId != patientId)
                {
                    return Forbid();
                }

                var encounters = await _encounterService.GetPatientEncountersAsync(patientId);
                return Ok(encounters);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving encounters for patient {patientId}");
                // Temporary: return exception details to aid local debugging
                return StatusCode(500, new { message = ex.Message, detail = ex.ToString() });
            }
        }

        /// <summary>
        /// Create a new encounter (automatically called after appointment booking and payment)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Doctor,Staff,Admin")]
        public async Task<ActionResult<EncounterDetailDto>> CreateEncounter(
            [FromBody] CreateEncounterDto dto)
        {
            try
            {
                var encounter = await _encounterService.CreateEncounterAsync(dto);
                return CreatedAtAction(nameof(GetEncounterById), new { encounterId = encounter.EncounterID }, encounter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating encounter for patient {dto.PatientID}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update encounter details
        /// </summary>
        [HttpPut]
        [Authorize(Roles = "Doctor,Staff,Admin")]
        public async Task<ActionResult<EncounterDetailDto>> UpdateEncounter(
            [FromBody] UpdateEncounterDto dto)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? throw new UnauthorizedAccessException("User ID not found"));
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

                var encounter = await _encounterService.UpdateEncounterAsync(dto, userId, userRole);
                return Ok(encounter);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating encounter {dto.EncounterID}");
                return BadRequest(new { message = ex.Message });
            }
        }

        // EMR Component Endpoints

        /// <summary>
        /// Add vital signs to an encounter
        /// </summary>
        [HttpPost("vitals")]
        [Authorize(Roles = "Doctor,Staff,Admin")]
        public async Task<ActionResult<VitalSignsDto>> AddVitalSigns(
            [FromBody] CreateVitalSignsDto dto)
        {
            try
            {
                var vitalSigns = await _encounterService.AddVitalSignsAsync(dto);
                return Ok(vitalSigns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding vital signs");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Add diagnosis to an encounter
        /// </summary>
        [HttpPost("diagnosis")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<ActionResult<DiagnosisDto>> AddDiagnosis(
            [FromBody] CreateDiagnosisDto dto)
        {
            try
            {
                var diagnosis = await _encounterService.AddDiagnosisAsync(dto);
                return Ok(diagnosis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding diagnosis");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Add prescription to an encounter
        /// </summary>
        [HttpPost("prescription")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<ActionResult<PrescriptionDto>> AddPrescription(
            [FromBody] CreatePrescriptionDto dto)
        {
            try
            {
                Console.WriteLine($"[PRESCRIPTION DEBUG] EncounterID: {dto.EncounterID}");
                Console.WriteLine($"[PRESCRIPTION DEBUG] Notes: '{dto.Notes}'");
                Console.WriteLine($"[PRESCRIPTION DEBUG] Medicines count: {dto.Medicines?.Count ?? 0}");
                
                if (dto.Medicines != null && dto.Medicines.Count > 0)
                {
                    for (int i = 0; i < dto.Medicines.Count; i++)
                    {
                        var med = dto.Medicines[i];
                        Console.WriteLine($"[PRESCRIPTION DEBUG] Medicine {i}: Name='{med.MedicineName}', Dosage='{med.Dosage}', Frequency='{med.Frequency}', Duration='{med.Duration}'");
                    }
                }
                else
                {
                    Console.WriteLine("[PRESCRIPTION DEBUG] No medicines received!");
                }
                
                var prescription = await _encounterService.AddPrescriptionAsync(dto);
                return Ok(prescription);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding prescription: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Add lab test order to an encounter
        /// </summary>
        [HttpPost("labtest")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<ActionResult<LabTestDto>> AddLabTest(
            [FromBody] CreateLabTestDto dto)
        {
            try
            {
                var labTest = await _encounterService.AddLabTestAsync(dto);
                return Ok(labTest);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding lab test");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Add observation to an encounter
        /// </summary>
        [HttpPost("observation")]
        [Authorize(Roles = "Doctor,Staff,Admin")]
        public async Task<ActionResult<ObservationDto>> AddObservation(
            [FromBody] CreateObservationDto dto)
        {
            try
            {
                var observation = await _encounterService.AddObservationAsync(dto);
                return Ok(observation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding observation");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Add treatment plan to an encounter
        /// </summary>
        [HttpPost("treatmentplan")]
        [Authorize(Roles = "Doctor,Admin")]
        public async Task<ActionResult<TreatmentPlanDto>> AddTreatmentPlan(
            [FromBody] CreateTreatmentPlanDto dto)
        {
            try
            {
                var treatmentPlan = await _encounterService.AddTreatmentPlanAsync(dto);
                return Ok(treatmentPlan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding treatment plan");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Add medical report to an encounter
        /// </summary>
        [HttpPost("medicalreport")]
        [Authorize(Roles = "Doctor,Staff,Admin")]
        public async Task<ActionResult<MedicalReportDto>> AddMedicalReport(
            [FromBody] CreateMedicalReportDto dto)
        {
            try
            {
                var medicalReport = await _encounterService.AddMedicalReportAsync(dto);
                return Ok(medicalReport);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding medical report");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
