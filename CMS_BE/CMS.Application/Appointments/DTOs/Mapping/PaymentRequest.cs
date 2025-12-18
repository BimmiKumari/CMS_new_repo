namespace CMS.Models
{
    public class PaymentRequest
    {
        public decimal Amount { get; set; }
        public decimal OriginalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public bool IsFollowup { get; set; }
        public string Currency { get; set; } = "INR";
        public string PatientId { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        // Appointment booking details
        public string? DoctorId { get; set; }
        public string? SlotId { get; set; }
        public string? StartTime { get; set; } // Time string like "09:00 AM"
        public string? EndTime { get; set; }
        public string? AppointmentDate { get; set; }
        public string? ReasonForVisit { get; set; }
        
        // Helper properties to convert strings to GUIDs
        public Guid? DoctorIdGuid => string.IsNullOrEmpty(DoctorId) ? null : Guid.TryParse(DoctorId, out var guid) ? guid : null;
        public Guid? SlotIdGuid => string.IsNullOrEmpty(SlotId) ? null : Guid.TryParse(SlotId, out var guid) ? guid : null;
    }

    public class PaymentResponse
    {
        public string OrderId { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class PaymentVerification
    {
        public string razorpayOrderId { get; set; } = string.Empty;
        public string razorpayPaymentId { get; set; } = string.Empty;
        public string razorpaySignature { get; set; } = string.Empty;
        
        // Optional: Pass appointment details again to be stateless/robust
        public string? PatientId { get; set; }
        public string? DoctorId { get; set; }
        public string? AppointmentDate { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public string? ReasonForVisit { get; set; }
        public bool IsFollowup { get; set; }
        
        // Helper
        public Guid? DoctorIdGuid => string.IsNullOrEmpty(DoctorId) ? null : Guid.TryParse(DoctorId, out var guid) ? guid : null;
    }
}