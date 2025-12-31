using CMS.Domain.Appointments.Entities;
using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Appointments
{
    public class TimeSlotConfiguration : IEntityTypeConfiguration<TimeSlot>
    {
        public void Configure(EntityTypeBuilder<TimeSlot> builder)
        {
            builder.HasKey(ts => ts.SlotID);

            builder.Property(ts => ts.SlotID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(ts => ts.DoctorID)
                .IsRequired();

            builder.Property(ts => ts.SlotDate)
                .IsRequired();

            builder.Property(ts => ts.StartTime)
                .IsRequired();

            builder.Property(ts => ts.EndTime)
                .IsRequired();

            builder.Property(ts => ts.IsAvailable)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(ts => ts.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(ts => ts.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(ts => ts.DeletedAt);

            // FK relationship - DoctorID references User.UserID (Doctor)
            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(ts => ts.DoctorID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(ts => ts.DoctorID);
            builder.HasIndex(ts => ts.SlotDate);

            // Soft Delete Query Filter
            builder.HasQueryFilter(ts => !ts.IsDeleted);
        }
    }
}