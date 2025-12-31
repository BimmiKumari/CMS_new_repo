using CMS.Domain.Auth.Entities;
using CMS.Domain.Auth.Enums;
using Microsoft.EntityFrameworkCore;

namespace CMS.Data.Seeders
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(CmsDbContext context)
        {
            // Check if admin user already exists
            if (await context.Users.AnyAsync(u => u.Role == RoleType.Admin))
                return;

            // Create default admin user
            var adminUser = new User
            {
                UserID = Guid.NewGuid(),
                Name = "System Administrator",
                Email = "admin@cms.com",
                PhoneNumber = "1234567890",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                Role = RoleType.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
    }
}