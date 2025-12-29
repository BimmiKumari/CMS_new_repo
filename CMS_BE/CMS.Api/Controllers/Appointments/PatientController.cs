using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CMS.Application;
using CMS.Domain.Appointments.Entities;


namespace CMS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly CMS.Application.PatientService _patientService;
        public PatientController(CMS.Application.PatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpGet("by-user/{userId}")]
        public async Task<IActionResult> GetPatientByUserId(Guid userId)
        {
            try
            {
                var patients = await _patientService.GetAllPatients();
                var patient = patients.FirstOrDefault(p => p.user_id == userId);
                
                if (patient == null)
                {
                    return NotFound(new { success = false, message = "Patient record not found for this user" });
                }
                
                return Ok(new { success = true, data = patient });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error retrieving patient", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetPatients()
        {
            var patients = await _patientService.GetAllPatients();
            return Ok(patients);
        }

        [HttpPost]
        public async Task<IActionResult> AddPatient([FromBody] Patient patient)
        {
            try
            {
                var newPatient = await _patientService.CreatePatient(patient);
                return Ok(new { message = "Patient created successfully", patient = newPatient });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating patient", error = ex.Message });
            }
        }
    }
}
