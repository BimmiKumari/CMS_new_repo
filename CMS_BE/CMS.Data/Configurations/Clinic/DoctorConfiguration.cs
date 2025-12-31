using CMS.Domain.Clinic.Entities;
using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Clinic
{
    public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
    {
        public void Configure(EntityTypeBuilder<Doctor> builder)
        {
            builder.HasKey(d => d.DoctorID);

            // DoctorID is both PK and FK to User table
            builder.Property(d => d.DoctorID)
                .IsRequired();

            builder.Property(d => d.Specialization)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(d => d.Qualification)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(d => d.YearOfExperience)
                .IsRequired();

            builder.Property(d => d.StartTime)
                .IsRequired()
                .HasDefaultValue(new TimeSpan(9, 0, 0));

            builder.Property(d => d.EndTime)
                .IsRequired()
                .HasDefaultValue(new TimeSpan(18, 0, 0));

            builder.Property(d => d.SlotDuration)
                .IsRequired()
                .HasDefaultValue(30);

            builder.Property(d => d.BreakStartTime);

            builder.Property(d => d.BreakEndTime);

            builder.Property(d => d.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(d => d.DeletedAt);

            // WorkingDays array conversion
            builder.Property(d => d.WorkingDays)
                .IsRequired()
                .HasConversion(
                    v => string.Join(',', v.Select(e => e.ToString())),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                         .Select(e => Enum.Parse<CMS.Domain.Clinic.Enums.WorkingDays>(e))
                         .ToArray()
                )
                .Metadata.SetValueComparer(new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<CMS.Domain.Clinic.Enums.WorkingDays[]>(
                    (c1, c2) => c1.SequenceEqual(c2),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToArray()));

            // FK relationship - DoctorID references User.UserID
            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(d => d.DoctorID)
                .OnDelete(DeleteBehavior.NoAction);

            // Soft Delete Query Filter
            builder.HasQueryFilter(d => !d.IsDeleted);
        }
    }
}