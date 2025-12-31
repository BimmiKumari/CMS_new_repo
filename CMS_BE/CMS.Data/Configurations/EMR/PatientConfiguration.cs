using CMS.Domain.EMR.Entities;
using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.EMR
{
    public class PatientConfiguration : IEntityTypeConfiguration<Patient>
    {
        public void Configure(EntityTypeBuilder<Patient> builder)
        {
            builder.HasKey(p => p.PatientID);

            builder.Property(p => p.PatientID)
                .IsRequired();

            builder.Property(p => p.DOB)
                .IsRequired();

            builder.Property(p => p.Sex)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(p => p.Country)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.State)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.Address)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(p => p.Pincode)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(p => p.MaritalStatus)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(p => p.BloodGroup)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(p => p.Allergies)
                .HasMaxLength(1000);

            builder.Property(p => p.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(p => p.DeletedAt);

            // FK relationship - PatientID references User.UserID
            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(p => p.PatientID)
                .OnDelete(DeleteBehavior.NoAction);

            // Soft Delete Query Filter
            builder.HasQueryFilter(p => !p.IsDeleted);
        }
    }
}