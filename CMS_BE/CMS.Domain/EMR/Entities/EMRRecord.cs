using System.ComponentModel.DataAnnotations;
using CMS.Domain.Appointments.Entities;
using CMS.Domain.Clinic.Entities;
using CMS.Domain.Auth.Entities;

namespace CMS.Domain.EMR.Entities
{
    /// <summary>
    /// Main EMR record that aggregates all medical information for a patient
    /// </summary>
    public class EMRRecord
    {
        [Key]
        public Guid EMRRecordID { get; set; }
        
        // Nullable for migration - existing records may not have user_id
        // TODO: Make required after data migration
        public Guid? user_id { get; set; } // Primary link - one EMR per user
        
        public Guid? PatientID { get; set; } // Keep for backward compatibility, nullable
        
        public string? MedicalRecordNumber { get; set; } // Unique MRN for the patient
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        
        // Navigation properties
        public User? User { get; set; }
        public Patient? Patient { get; set; }
        public ICollection<PatientEncounter>? Encounters { get; set; }
    }
}
