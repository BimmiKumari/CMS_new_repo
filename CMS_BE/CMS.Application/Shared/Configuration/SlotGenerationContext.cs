using CMS.Domain.Appointments.Entities;
using CMS.Domain.Auth.Entities;
using CMS.Domain.Clinic.Entities;

namespace CMS.Application.Shared.Configuration
{
    public class SlotGenerationContext
    {
        public User Doctor { get; set; } = null!; // Doctor is now a User with Role = Doctor
        public Doctor? DoctorRecord { get; set; }
        public DateTime RequestedDate { get; set; }
        public List<Leave> ApprovedLeaves { get; set; } = new();
        public List<TimeSlot> BookedSlots { get; set; } = new();
        public List<TimeSlot> GeneratedSlots { get; set; } = new();
    }
}