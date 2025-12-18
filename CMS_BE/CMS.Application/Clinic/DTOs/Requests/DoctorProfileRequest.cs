using CMS.Domain.Clinic.Enums;
using System.ComponentModel.DataAnnotations;

namespace CMS.Application.Clinic.DTOs.Requests
{
    public class DoctorProfileRequest
    {
        [Required]
        public string Specialization { get; set; } = string.Empty;
        
        [Required]
        public string Qualification { get; set; } = string.Empty;
        
        [Required]
        [Range(0, 70)]
        public int YearOfExperience { get; set; }
        
        [Required]
        public WorkingDays[] WorkingDays { get; set; } = Array.Empty<WorkingDays>();
        
        [Required]
        public string StartTime { get; set; } = "09:00:00";
        
        [Required]
        public string EndTime { get; set; } = "17:00:00";
        
        [Required]
        public int SlotDuration { get; set; } = 30;
        
        public string? BreakStartTime { get; set; }
        public string? BreakEndTime { get; set; }
    }
}
