using CMS.Application.EMR.DTOs;
using CMS.Application.EMR.Interfaces;
using CMS.Application.Shared.DTOs;
using CMS.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
                var queueDate = date ?? DateTime.Now.Date;
                _logger.LogInformation($"[QUEUE] Getting queue for doctor {doctorId} on {queueDate:yyyy-MM-dd}");
                Console.WriteLine($"[QUEUE] Controller - DoctorId: {doctorId}, Date: {queueDate:yyyy-MM-dd}");
                
                var queue = await _queueService.GetDoctorQueueAsync(doctorId, queueDate);
                
                _logger.LogInformation($"[QUEUE] Found {queue.RegularPatients.Count} regular, {queue.FollowUpPatients.Count} follow-up patients");
                Console.WriteLine($"[QUEUE] Result - Regular: {queue.RegularPatients.Count}, FollowUp: {queue.FollowUpPatients.Count}, Emergency: {queue.EmergencyCases.Count}");
                
                return Ok(ApiResponse<DoctorQueueResponseDto>.SuccessResponse(queue, "Queue retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting queue for doctor {doctorId}");
                Console.WriteLine($"[QUEUE ERROR] {ex.Message}");
                Console.WriteLine($"[QUEUE ERROR] {ex.StackTrace}");
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

        /// <summary>
        /// Test endpoint to check raw queue data
        /// </summary>
        [HttpGet("test/{doctorId}")]
        public async Task<ActionResult> TestQueueData(Guid doctorId)
        {
            try
            {
                using var scope = HttpContext.RequestServices.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<CmsDbContext>();
                
                var today = DateTime.Now.Date;
                var tomorrow = today.AddDays(1);
                
                var rawQueues = await context.PatientQueues
                    .Where(q => q.DoctorID == doctorId && !q.IsDeleted)
                    .Select(q => new {
                        q.QueueID,
                        q.PatientID,
                        q.DoctorID,
                        q.AppointmentDate,
                        q.QueueStatus,
                        q.IsDeleted
                    })
                    .ToListAsync();
                
                return Ok(new {
                    doctorId,
                    searchDate = today.ToString("yyyy-MM-dd"),
                    totalQueues = rawQueues.Count,
                    todayQueues = rawQueues.Where(q => q.AppointmentDate.Date == today).Count(),
                    queues = rawQueues
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }




    }
}
