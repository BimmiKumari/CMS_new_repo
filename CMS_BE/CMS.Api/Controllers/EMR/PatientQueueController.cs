using CMS.Application.EMR.DTOs;
using CMS.Application.EMR.Interfaces;
using CMS.Application.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CMS.Api.Controllers.EMR
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PatientQueueController : ControllerBase
    {
        private readonly IPatientQueueService _queueService;
        private readonly ILogger<PatientQueueController> _logger;

        public PatientQueueController(
            IPatientQueueService queueService,
            ILogger<PatientQueueController> logger)
        {
            _queueService = queueService;
            _logger = logger;
        }

        /// <summary>
        /// Get patient queue for a specific doctor and date
        /// </summary>
        [HttpGet("doctor/{doctorId}")]
        [Authorize(Roles = "Doctor,Staff,Admin")]
        public async Task<ActionResult<ApiResponse<DoctorQueueResponseDto>>> GetDoctorQueue(
            Guid doctorId,
            [FromQuery] DateTime? date = null)
        {
            try
            {
                var queueDate = date ?? DateTime.UtcNow.Date;
                _logger.LogInformation($"Getting queue for doctor {doctorId} on {queueDate}");
                var queue = await _queueService.GetDoctorQueueAsync(doctorId, queueDate);
                _logger.LogInformation($"Found {queue.RegularPatients.Count} regular, {queue.FollowUpPatients.Count} follow-up patients");
                return Ok(ApiResponse<DoctorQueueResponseDto>.SuccessResponse(queue, "Queue retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting queue for doctor {doctorId}");
                return StatusCode(500, ApiResponse<DoctorQueueResponseDto>.ErrorResponse("An error occurred while retrieving the queue"));
            }
        }

        /// <summary>
        /// Add a patient to the queue (called after appointment booking and payment)
        /// </summary>
        [HttpPost("add/{appointmentId}")]
        [Authorize(Roles = "Staff,Admin,Patient")]
        public async Task<ActionResult<QueuePatientDto>> AddToQueue(Guid appointmentId)
        {
            try
            {
                var queueEntry = await _queueService.AddToQueueAsync(appointmentId);
                return Ok(queueEntry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error adding appointment {appointmentId} to queue");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Update queue status (e.g., Waiting -> InProgress -> Completed)
        /// </summary>
        [HttpPut("status")]
        [Authorize(Roles = "Doctor,Staff,Admin")]
        public async Task<ActionResult<QueuePatientDto>> UpdateQueueStatus(
            [FromBody] UpdateQueueStatusDto dto)
        {
            try
            {
                var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? throw new UnauthorizedAccessException("User ID not found"));

                var updated = await _queueService.UpdateQueueStatusAsync(dto, userId);
                return Ok(updated);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating queue status for {dto.QueueID}");
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Remove a patient from the queue
        /// </summary>
        [HttpDelete("{queueId}")]
        [Authorize(Roles = "Doctor,Staff,Admin")]
        public async Task<ActionResult> RemoveFromQueue(Guid queueId)
        {
            try
            {
                var result = await _queueService.RemoveFromQueueAsync(queueId);
                if (!result)
                    return NotFound(new { message = "Queue entry not found" });

                return Ok(new { message = "Patient removed from queue successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error removing queue entry {queueId}");
                return StatusCode(500, new { message = "An error occurred while removing from queue" });
            }
        }
    }
}
