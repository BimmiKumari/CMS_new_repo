using CMS.Domain.NotificationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Notifications
{
    public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
    {
        public void Configure(EntityTypeBuilder<NotificationPreference> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.UserId)
                .IsRequired();

            builder.Property(e => e.Type)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.ChannelType)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.IsEnabled)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(e => e.IsRequired)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(e => e.CustomSettings)
                .HasMaxLength(2000);

            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(e => e.UpdatedAt);

            builder.Property(e => e.UserRole)
                .IsRequired()
                .HasConversion<int>();

            builder.HasIndex(e => e.UserId);
            builder.HasIndex(e => e.Type);
            builder.HasIndex(e => e.ChannelType);
            builder.HasIndex(e => e.UserRole);
        }
    }
}