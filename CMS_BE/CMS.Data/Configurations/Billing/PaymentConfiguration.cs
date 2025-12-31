using CMS.Domain.Billing.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Billing
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.HasKey(p => p.PaymentID);

            builder.Property(p => p.PaymentID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(p => p.InvoiceID)
                .IsRequired();

            builder.Property(p => p.RazorpayOrderID)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.RazorpayPaymentID)
                .HasMaxLength(100);

            builder.Property(p => p.RazorpaySignature)
                .HasMaxLength(200);

            builder.Property(p => p.Amount)
                .IsRequired()
                .HasPrecision(18, 2);

            builder.Property(p => p.Currency)
                .IsRequired()
                .HasMaxLength(10)
                .HasDefaultValue("INR");

            builder.Property(p => p.Method)
                .HasMaxLength(50);

            builder.Property(p => p.BankCode)
                .HasMaxLength(50);

            builder.Property(p => p.VPA)
                .HasMaxLength(100);

            builder.Property(p => p.Description)
                .HasMaxLength(500);

            builder.Property(p => p.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(p => p.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(p => p.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(p => p.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(p => p.DeletedAt);

            // FK relationship - InvoiceID references Invoice.InvoiceID
            builder.HasOne<Invoice>()
                .WithMany()
                .HasForeignKey(p => p.InvoiceID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(p => p.InvoiceID);
            builder.HasIndex(p => p.RazorpayOrderID);
            builder.HasIndex(p => p.RazorpayPaymentID);

            // Soft Delete Query Filter
            builder.HasQueryFilter(p => !p.IsDeleted);
        }
    }
}