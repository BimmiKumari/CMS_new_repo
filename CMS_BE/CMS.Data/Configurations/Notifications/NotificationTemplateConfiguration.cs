using CMS.Domain.NotificationModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Notifications
{
    public class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
    {
        public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Name)
                .HasMaxLength(100)
                .IsRequired();

            builder.Property(e => e.Subject)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(e => e.Body)
                .IsRequired();

            builder.Property(e => e.Type)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.ChannelType)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.Variables)
                .HasMaxLength(2000);

            builder.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(e => e.UpdatedAt);

            builder.Property(e => e.CreatedBy)
                .HasMaxLength(100);

            builder.Property(e => e.UpdatedBy)
                .HasMaxLength(100);

            builder.Property(e => e.Category)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(e => e.Description)
                .HasMaxLength(500);

            builder.HasIndex(e => e.Type);
            builder.HasIndex(e => e.ChannelType);
            builder.HasIndex(e => e.Category);
            builder.HasIndex(e => e.IsActive);
        }
    }
}