using CMS.Domain.EMR.Enums;

namespace CMS.Application.EMR.DTOs
{
    public class EMRRecordDto
    {
        public Guid EMRRecordID { get; set; }
        public Guid? user_id { get; set; } // Primary user reference
        public Guid? PatientID { get; set; } // Optional, for backward compatibility
        public string? MedicalRecordNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<EncounterSummaryDto> Encounters { get; set; } = new();
    }

    public class CreateEMRRecordDto
    {
        public Guid UserID { get; set; } // Primary user reference
        public Guid? PatientID { get; set; } // Optional, for backward compatibility
    }
}
