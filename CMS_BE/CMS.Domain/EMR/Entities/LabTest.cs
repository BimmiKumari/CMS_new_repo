using System.ComponentModel.DataAnnotations;
using CMS.Domain.EMR.Enums;
using CMS.Domain.Clinic.Entities;

namespace CMS.Domain.EMR.Entities
{
    /// <summary>
    /// Stores lab test orders and results
    /// </summary>
    public class LabTest
    {
        [Key]
        public Guid LabTestID { get; set; }
        
        [Required]
        public Guid EncounterID { get; set; }
        
        [Required]
        public string TestName { get; set; } = string.Empty;
        
        public string? TestCode { get; set; } // LOINC or internal code
        
        public string? TestCategory { get; set; } // Blood, Urine, Imaging, etc.
        
        [Required]
        public LabTestStatus Status { get; set; } = LabTestStatus.Ordered;
        
        public string? Instructions { get; set; }
        
        public string? Results { get; set; } // JSON or text results
        
        public string? ResultsFileUrl { get; set; } // PDF/Image of results
        
        public string? Interpretation { get; set; }
        
        public bool IsAbnormal { get; set; } = false;
        
        [Required]
        public Guid OrderedBy { get; set; } // Doctor who ordered
        
        public Guid? PerformedBy { get; set; } // Lab technician
        
        public DateTime OrderedAt { get; set; } = DateTime.UtcNow;
        public DateTime? SampleCollectedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        
        // Navigation properties
        public PatientEncounter? Encounter { get; set; }
    }
}
