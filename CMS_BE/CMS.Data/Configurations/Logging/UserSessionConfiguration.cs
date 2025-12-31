using CMS.Domain.Logging.Entities;
using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Logging
{
    public class UserSessionConfiguration : IEntityTypeConfiguration<UserSession>
    {
        public void Configure(EntityTypeBuilder<UserSession> builder)
        {
            builder.HasKey(s => s.SessionID);

            builder.Property(s => s.SessionID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(s => s.UserID)
                .IsRequired();

            builder.Property(s => s.SessionToken)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(s => s.DeviceInfo)
                .HasMaxLength(500);

            builder.Property(s => s.IPAddress)
                .HasMaxLength(50);

            builder.Property(s => s.UserAgent)
                .HasMaxLength(1000);

            builder.Property(s => s.LoginTimestamp)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(s => s.LastActivityTimestamp)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(s => s.ExpiryTimestamp)
                .IsRequired();

            builder.Property(s => s.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(s => s.LogoutTimestamp);

            builder.Property(s => s.LogoutReason)
                .HasMaxLength(200);

            builder.Property(s => s.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(s => s.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // FK relationship - UserID references User.UserID
            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(s => s.UserID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(s => s.UserID);
            builder.HasIndex(s => s.SessionToken);
            builder.HasIndex(s => s.IsActive);
            builder.HasIndex(s => s.ExpiryTimestamp);
        }
    }
}