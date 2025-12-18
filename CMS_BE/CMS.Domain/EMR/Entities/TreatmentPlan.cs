using System.ComponentModel.DataAnnotations;
using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    /// <summary>
    /// Stores treatment plan for a patient encounter
    /// </summary>
    public class TreatmentPlan
    {
        [Key]
        public Guid TreatmentPlanID { get; set; }
        
        [Required]
        public Guid EncounterID { get; set; }
        
        [Required]
        public string PlanDescription { get; set; } = string.Empty;
        
        public string? Goals { get; set; }
        
        public string? Instructions { get; set; }
        
        public string? Precautions { get; set; }
        
        public string? DietaryAdvice { get; set; }
        
        public string? LifestyleModifications { get; set; }
        
        public DateTime? FollowUpDate { get; set; }
        
        public string? FollowUpInstructions { get; set; }
        
        [Required]
        public Guid CreatedBy { get; set; } // Doctor who created the plan
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        
        // Navigation properties
        public PatientEncounter? Encounter { get; set; }
    }
}
