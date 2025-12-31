using CMS.Domain.Billing.Entities;
using CMS.Domain.Clinic.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Billing
{
    public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
    {
        public void Configure(EntityTypeBuilder<Invoice> builder)
        {
            builder.HasKey(i => i.InvoiceID);

            builder.Property(i => i.InvoiceID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(i => i.EncounterID)
                .IsRequired();

            builder.Property(i => i.RazorpayOrderID)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(i => i.InvoiceDate)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(i => i.Description)
                .HasMaxLength(1000);

            builder.Property(i => i.Currency)
                .IsRequired()
                .HasMaxLength(10)
                .HasDefaultValue("INR");

            builder.Property(i => i.TotalAmount)
                .IsRequired()
                .HasPrecision(18, 2);

            builder.Property(i => i.DiscountAmount)
                .HasPrecision(18, 2)
                .HasDefaultValue(0);

            builder.Property(i => i.PaidAmount)
                .HasPrecision(18, 2)
                .HasDefaultValue(0);

            builder.Property(i => i.BalanceAmount)
                .HasPrecision(18, 2);

            builder.Property(i => i.BillStatus)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(i => i.PaymentStatus)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(i => i.PaymentDate);

            builder.Property(i => i.PaymentMethod)
                .HasConversion<int>();

            builder.Property(i => i.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(i => i.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(i => i.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(i => i.DeletedAt);

            // FK relationship - EncounterID references PatientEncounter.EncounterID
            builder.HasOne<PatientEncounter>()
                .WithMany()
                .HasForeignKey(i => i.EncounterID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(i => i.EncounterID);
            builder.HasIndex(i => i.RazorpayOrderID);

            // Soft Delete Query Filter
            builder.HasQueryFilter(i => !i.IsDeleted);
        }
    }
}