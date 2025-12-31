using CMS.Domain.Auth.Entities;
using CMS.Domain.Auth.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Auth
{
    public class InvitationConfiguration : IEntityTypeConfiguration<Invitation>
    {
        public void Configure(EntityTypeBuilder<Invitation> builder)
        {
            builder.HasKey(i => i.InvitationID);

            builder.Property(i => i.InvitationID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(i => i.UserID)
                .IsRequired();

            builder.Property(i => i.Email)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(i => i.Role)
                .IsRequired()
                .HasConversion<int>();

            builder.Property(i => i.Token)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(i => i.ExpiresAt)
                .IsRequired();

            builder.Property(i => i.IsAccepted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(i => i.InvitedBy)
                .IsRequired();

            builder.Property(i => i.CreatedAt)
                .IsRequired();

            builder.Property(i => i.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(i => i.DeletedAt);

            // FK relationship with NoAction delete behavior
            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(i => i.UserID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(i => i.UserID);
            builder.HasIndex(i => i.Email);

            // Soft Delete Query Filter
            builder.HasQueryFilter(i => !i.IsDeleted);
        }
    }
}