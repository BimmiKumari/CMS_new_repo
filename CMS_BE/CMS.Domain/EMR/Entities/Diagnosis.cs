using System.ComponentModel.DataAnnotations;
using CMS.Domain.EMR.Enums;
using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    /// <summary>
    /// Stores diagnosis information for a patient encounter
    /// </summary>
    public class Diagnosis
    {
        [Key]
        public Guid DiagnosisID { get; set; }
        
        [Required]
        public Guid EncounterID { get; set; }
        
        [Required]
        public string DiagnosisCode { get; set; } = string.Empty; // ICD-10 code
        
        [Required]
        public string DiagnosisName { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public DiagnosisStatus Status { get; set; } = DiagnosisStatus.Provisional;
        
        public bool IsPrimary { get; set; } = false; // Primary vs secondary diagnosis
        
        [Required]
        public Guid DiagnosedBy { get; set; } // Doctor who made the diagnosis
        
        public DateTime DiagnosedAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        
        // Navigation properties
        public PatientEncounter? Encounter { get; set; }
    }
}
