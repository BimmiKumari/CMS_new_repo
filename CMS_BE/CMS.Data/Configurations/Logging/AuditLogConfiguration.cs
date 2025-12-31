using CMS.Domain.Logging.Entities;
using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Logging
{
    public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
    {
        public void Configure(EntityTypeBuilder<AuditLog> builder)
        {
            builder.HasKey(a => a.AuditID);

            builder.Property(a => a.AuditID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(a => a.UserID)
                .IsRequired();

            builder.Property(a => a.Action)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(a => a.RecordID)
                .IsRequired();

            builder.Property(a => a.IsSuccess)
                .IsRequired();

            builder.Property(a => a.ErrorMessage)
                .HasMaxLength(1000);

            builder.Property(a => a.CorrelationId)
                .HasMaxLength(100);

            builder.Property(a => a.IPAddress)
                .HasMaxLength(50);

            builder.Property(a => a.ActionTimestamp)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // FK relationship - UserID references User.UserID
            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(a => a.UserID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(a => a.UserID);
            builder.HasIndex(a => a.ActionTimestamp);
            builder.HasIndex(a => a.Action);
        }
    }
}