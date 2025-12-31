using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    public class TreatmentPlan
    {
        public Guid TreatmentPlanID { get; set; }
        public Guid EMRRecordID { get; set; }
        public Guid EncounterID { get; set; }
        public string PlanDescription { get; set; } = string.Empty;
        public string? Goals { get; set; }
        public string? Instructions { get; set; }
        public string? Precautions { get; set; }
        public string? DietaryAdvice { get; set; }
        public string? LifestyleModifications { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public string? FollowUpInstructions { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        
        // Navigation Properties
        public EMRRecord? EMRRecord { get; set; }
        public PatientEncounter? Encounter { get; set; }
    }
}
