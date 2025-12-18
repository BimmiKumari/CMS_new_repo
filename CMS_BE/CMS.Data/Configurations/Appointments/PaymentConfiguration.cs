using CMS.Domain.Appointments.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Appointments
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.ToTable("Payments");

            builder.HasKey(p => p.payment_id);

            builder.Property(p => p.payment_id)
                  .HasColumnName("payment_id")
                  .HasDefaultValueSql("NEWSEQUENTIALID()")
                  .ValueGeneratedOnAdd();

            builder.HasOne(p => p.Patient)
                  .WithMany()
                  .HasForeignKey(p => p.patient_id)
                  .OnDelete(DeleteBehavior.SetNull);
                  
            builder.Property(p => p.amount)
                  .HasColumnType("decimal(18,2)");
                  
            builder.Property(p => p.original_amount)
                  .HasColumnType("decimal(18,2)");
                  
            builder.Property(p => p.discount_amount)
                  .HasColumnType("decimal(18,2)");
        }
    }
}
