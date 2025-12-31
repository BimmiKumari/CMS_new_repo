using CMS.Domain.Clinic.Entities;
using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Clinic
{
    public class LeaveConfiguration : IEntityTypeConfiguration<Leave>
    {
        public void Configure(EntityTypeBuilder<Leave> builder)
        {
            builder.HasKey(l => l.LeaveID);

            builder.Property(l => l.LeaveID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(l => l.UserID)
                .IsRequired();

            builder.Property(l => l.StartDate)
                .IsRequired();

            builder.Property(l => l.EndDate)
                .IsRequired();

            builder.Property(l => l.Reason)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(l => l.Status)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(l => l.LeaveApplied)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(l => l.IsFullDay)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(l => l.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(l => l.DeletedAt);

            // FK relationship - UserID references User.UserID (Staff)
            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(l => l.UserID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(l => l.UserID);
            builder.HasIndex(l => l.StartDate);
            builder.HasIndex(l => l.Status);

            // Soft Delete Query Filter
            builder.HasQueryFilter(l => !l.IsDeleted);
        }
    }
}