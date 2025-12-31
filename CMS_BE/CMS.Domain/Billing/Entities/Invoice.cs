using CMS.Domain.Billing.Enums;

namespace CMS.Domain.Billing.Entities
{
    public class Invoice
    {
        public Guid InvoiceID { get; set; }
        public Guid EncounterID { get; set; }
        public string RazorpayOrderID { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string Description { get; set; }
        public string Currency { get; set; } = "INR";
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal BalanceAmount { get; set; }
        public BillStatusType BillStatus { get; set; }
        public PaymentStatusType PaymentStatus { get; set; }
        public DateTime? PaymentDate { get; set; }
        public PaymentMethodTypes? PaymentMethod { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}