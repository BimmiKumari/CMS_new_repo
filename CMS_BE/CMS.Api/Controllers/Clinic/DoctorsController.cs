using CMS.Application.Clinic.DTOs.Requests;
using CMS.Application.Clinic.DTOs.Responses;
using CMS.Application.Clinic.Interfaces;
using CMS.Application.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CMS.Api.Controllers.Clinic
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly IDoctorService _doctorService;
        private readonly ILogger<DoctorsController> _logger;

        public DoctorsController(IDoctorService doctorService, ILogger<DoctorsController> logger)
        {
            _doctorService = doctorService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<DoctorDto>>>> GetAllActiveDoctors()
        {
            try
            {
                var doctors = await _doctorService.GetAllActiveDoctorsAsync();
                return Ok(ApiResponse<List<DoctorDto>>.SuccessResponse(doctors, $"Found {doctors.Count} active doctors"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching active doctors");
                return StatusCode(500, ApiResponse<List<DoctorDto>>.ErrorResponse("An error occurred while fetching doctors"));
            }
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<DoctorDto>>> GetProfile()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized(ApiResponse<DoctorDto>.ErrorResponse("User not found"));

                var doctorId = Guid.Parse(userIdClaim.Value);
                var profile = await _doctorService.GetDoctorProfileAsync(doctorId);
                
                if (profile == null) return NotFound(ApiResponse<DoctorDto>.ErrorResponse("Doctor profile not found"));
                
                return Ok(ApiResponse<DoctorDto>.SuccessResponse(profile, "Profile retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching doctor profile");
                return StatusCode(500, ApiResponse<DoctorDto>.ErrorResponse("An error occurred while fetching profile"));
            }
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> UpdateProfile([FromBody] DoctorProfileRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) return Unauthorized(ApiResponse<bool>.ErrorResponse("User not found"));

                var doctorId = Guid.Parse(userIdClaim.Value);
                var result = await _doctorService.UpdateProfileAsync(doctorId, request);
                
                if (!result) return BadRequest(ApiResponse<bool>.ErrorResponse("Failed to update profile"));
                
                return Ok(ApiResponse<bool>.SuccessResponse(true, "Profile updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating doctor profile");
                return StatusCode(500, ApiResponse<bool>.ErrorResponse("An error occurred while updating profile"));
            }
        }
    }
}
