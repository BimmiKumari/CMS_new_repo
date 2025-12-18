using CMS.Application.Appointments.DTOs.Requests;
using CMS.Application.Appointments.DTOs.Responses;
using CMS.Application.Appointments.Interfaces;
using CMS.Application.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CMS.Api.Controllers.Appointments
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly ILogger<AppointmentsController> _logger;

        public AppointmentsController(IAppointmentService appointmentService, ILogger<AppointmentsController> logger)
        {
            _appointmentService = appointmentService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<AppointmentDto>>> CreateAppointment([FromBody] CreateAppointmentRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ApiResponse<AppointmentDto>.ErrorResponse("Invalid request"));

                var result = await _appointmentService.CreateAppointmentAsync(request);
                return Ok(ApiResponse<AppointmentDto>.SuccessResponse(result, "Appointment booked successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating appointment");
                return StatusCode(500, ApiResponse<AppointmentDto>.ErrorResponse("An error occurred while booking appointment"));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<AppointmentDto>>> GetAppointment(Guid id)
        {
            try
            {
                var result = await _appointmentService.GetAppointmentByIdAsync(id);
                if (result == null) return NotFound(ApiResponse<AppointmentDto>.ErrorResponse("Appointment not found"));
                return Ok(ApiResponse<AppointmentDto>.SuccessResponse(result, "Appointment retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching appointment {Id}", id);
                return StatusCode(500, ApiResponse<AppointmentDto>.ErrorResponse("An error occurred"));
            }
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<ActionResult<ApiResponse<IEnumerable<AppointmentDto>>>> GetDoctorAppointments(
            Guid doctorId, 
            [FromQuery] DateTime? startDate, 
            [FromQuery] DateTime? endDate)
        {
            try
            {
                var start = startDate ?? DateTime.Today;
                var end = endDate ?? DateTime.Today.AddDays(7);
                var result = await _appointmentService.GetDoctorAppointmentsAsync(doctorId, start, end);
                return Ok(ApiResponse<IEnumerable<AppointmentDto>>.SuccessResponse(result, "Appointments retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching doctor appointments");
                return StatusCode(500, ApiResponse<IEnumerable<AppointmentDto>>.ErrorResponse("An error occurred"));
            }
        }
        
        [HttpGet("test/all")]
        public async Task<IActionResult> GetAllAppointments()
        {
            try
            {
                var appointments = await _appointmentService.GetDoctorAppointmentsAsync(Guid.Empty, DateTime.MinValue, DateTime.MaxValue);
                return Ok(new { 
                    success = true, 
                    count = appointments.Count(), 
                    appointments = appointments.Take(20) 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all appointments");
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
            }
        }
    }
}
