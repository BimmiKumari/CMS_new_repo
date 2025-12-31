using CMS.Domain.Auth.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Auth
{
    public class TokenConfiguration : IEntityTypeConfiguration<Token>
    {
        public void Configure(EntityTypeBuilder<Token> builder)
        {
            builder.HasKey(t => t.TokenID);

            builder.Property(t => t.TokenID)
                .HasDefaultValueSql("NEWID()");

            builder.Property(t => t.UserID)
                .IsRequired();

            builder.Property(t => t.AccessToken)
                .HasMaxLength(1000);

            builder.Property(t => t.ExpiresIn)
                .IsRequired();

            builder.Property(t => t.RefreshToken)
                .HasMaxLength(1000);

            builder.Property(t => t.RefreshTokenExpiresIn);

            builder.Property(t => t.Scope)
                .HasMaxLength(255);

            builder.Property(t => t.TokenType)
                .HasMaxLength(100);

            builder.Property(t => t.GeneratedOn)
                .IsRequired();

            builder.Property(t => t.AccessTokenExpiresOn)
                .IsRequired();

            builder.Property(t => t.RefreshTokenExpiresOn);

            builder.Property(t => t.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(t => t.DeletedAt);

            // FK relationship with NoAction delete behavior
            builder.HasOne<User>()
                .WithMany()
                .HasForeignKey(t => t.UserID)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasIndex(t => t.UserID);

            // Soft Delete Query Filter
            builder.HasQueryFilter(t => !t.IsDeleted);
        }
    }
}