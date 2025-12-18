using CMS.Application.EMR.DTOs;
using CMS.Application.EMR.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CMS.Api.Controllers.EMR
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EMRController : ControllerBase
    {
        private readonly IEMRService _emrService;
        private readonly ILogger<EMRController> _logger;

        public EMRController(
            IEMRService emrService,
            ILogger<EMRController> logger)
        {
            _emrService = emrService;
            _logger = logger;
        }

        /// <summary>
        /// Get EMR record by patient ID
        /// </summary>
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<EMRRecordDto>> GetEMRByPatientId(Guid patientId)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? throw new UnauthorizedAccessException("User ID not found"));
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "Patient";

                // Patients can only view their own EMR
                if (userRole == "Patient" && userId != patientId)
                {
                    return Forbid();
                }

                var emr = await _emrService.GetEMRByPatientIdAsync(patientId);
                if (emr == null)
                    return NotFound(new { message = "EMR record not found for this patient" });

                return Ok(emr);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving EMR for patient {patientId}");
                return StatusCode(500, new { message = "An error occurred while retrieving the EMR" });
            }
        }

        /// <summary>
        /// Get EMR record by EMR ID
        /// </summary>
        [HttpGet("{emrRecordId}")]
        [Authorize(Roles = "Doctor,Staff,Admin")]
        public async Task<ActionResult<EMRRecordDto>> GetEMRById(Guid emrRecordId)
        {
            try
            {
                var emr = await _emrService.GetEMRByIdAsync(emrRecordId);
                if (emr == null)
                    return NotFound(new { message = "EMR record not found" });

                return Ok(emr);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving EMR {emrRecordId}");
                return StatusCode(500, new { message = "An error occurred while retrieving the EMR" });
            }
        }

        /// <summary>
        /// Create a new EMR record for a patient
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Doctor,Staff,Admin")]
        public async Task<ActionResult<EMRRecordDto>> CreateEMRRecord(
            [FromBody] CreateEMRRecordDto dto)
        {
            try
            {
                var emr = await _emrService.CreateEMRRecordAsync(dto);
                return CreatedAtAction(nameof(GetEMRById), new { emrRecordId = emr.EMRRecordID }, emr);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating EMR for patient {dto.PatientID}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
