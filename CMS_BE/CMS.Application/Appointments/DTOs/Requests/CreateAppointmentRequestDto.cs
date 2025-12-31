using CMS.Domain.Appointments.Enums;
using System.ComponentModel.DataAnnotations;

namespace CMS.Application.Appointments.DTOs.Requests
{
    public class CreateAppointmentRequestDto
    {
        [Required]
        public Guid PatientID { get; set; }
        
        public Guid? user_id { get; set; } // User ID for linking to user
        
        [Required]
        public Guid DoctorID { get; set; }
        
        [Required]
        public DateTime AppointmentDate { get; set; }
        
        [Required]
        public string StartTime { get; set; } = string.Empty; // Accept as string for conversion
        
        [Required]
        public string EndTime { get; set; } = string.Empty; // Accept as string for conversion
        
        [Required]
        public AppointmentType AppointmentType { get; set; }
        
        [Required]
        public string ReasonForVisit { get; set; } = string.Empty;
    }
}
