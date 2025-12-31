using System.Text.Json.Serialization;
using CMS.Domain.Billing.Enums;

namespace CMS.Domain.Billing.Entities
{
    public class Payment
    {
        public Guid PaymentID { get; set; }
        public Guid InvoiceID { get; set; }
        [JsonPropertyName("razorpay_order_id")]
        public string RazorpayOrderID { get; set; }
        [JsonPropertyName("razorpay_payment_id")]
        public string RazorpayPaymentID { get; set; }
        [JsonPropertyName("razorpay_signature")]
        public string RazorpaySignature { get; set; }
        [JsonPropertyName("amount")]
        public decimal Amount { get; set; }
        [JsonPropertyName("currency")]
        public string Currency { get; set; } = "INR";
        [JsonPropertyName("method")]
        public string Method { get; set; } = string.Empty;
        [JsonPropertyName("bank")]
        public string BankCode { get; set; } = string.Empty;
        [JsonPropertyName("vpa")]
        public string VPA { get; set; } = string.Empty;
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
        public PaymentStatusType Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}