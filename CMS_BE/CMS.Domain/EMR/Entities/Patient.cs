using CMS.Domain.EMR.Enums;

namespace CMS.Domain.EMR.Entities
{
    public class Patient
    {
        public Guid PatientID { get; set; }
        public DateOnly DOB { get; set; }
        public SexType Sex { get; set; }
        public string Country { get; set; }
        public string State { get; set; }
        public string Address { get; set; }
        public string Pincode { get; set; }
        public MaritalStatusTypes MaritalStatus { get; set; }
        public BloodGroupType BloodGroup { get; set; }
        public string Allergies { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}