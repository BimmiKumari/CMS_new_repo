using CMS.Domain.Appointments.Entities;
using CMS.Domain.Auth.Entities;
using CMS.Domain.Clinic.Entities;
using CMS.Domain.EMR.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CMS.Data.Configurations.Clinic
{
    public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
    {
        public void Configure(EntityTypeBuilder<Doctor> builder)
        {
            // Primary Key (also FK to User)
            builder.HasKey(d => d.DoctorID);

            // One-to-One relationship with User
            builder.HasOne(d => d.User)
                .WithOne()
                .HasForeignKey<Doctor>(d => d.DoctorID)
                .OnDelete(DeleteBehavior.NoAction);

            // Properties
            builder.Property(d => d.Specialization)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(d => d.Qualification)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(d => d.YearOfExperience)
                .IsRequired();

            builder.Property(d => d.StartTime)
                .HasDefaultValue(new TimeSpan(9, 0, 0));

            builder.Property(d => d.EndTime)
                .HasDefaultValue(new TimeSpan(18, 0, 0));

            builder.Property(d => d.SlotDuration)
                .HasDefaultValue(30);

            builder.Property(d => d.IsDeleted)
                .HasDefaultValue(false);

            // Value Converter and Comparer for WorkingDays array
            builder.Property(d => d.WorkingDays)
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

            // Soft Delete Query Filter
            builder.HasQueryFilter(d => !d.IsDeleted);
        }
    }

    public class LeaveConfiguration : IEntityTypeConfiguration<Leave>
    {
        public void Configure(EntityTypeBuilder<Leave> builder)
        {
            // Primary Key
            builder.HasKey(l => l.LeaveID);

            // Foreign Key to User
            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(l => l.UserID)
                .OnDelete(DeleteBehavior.NoAction);

            // Properties
            builder.Property(l => l.Reason)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(l => l.IsFullDay)
                .HasDefaultValue(true);

            builder.Property(l => l.IsDeleted)
                .HasDefaultValue(false);

            // Soft Delete Query Filter
            builder.HasQueryFilter(l => !l.IsDeleted);
        }
    }
}