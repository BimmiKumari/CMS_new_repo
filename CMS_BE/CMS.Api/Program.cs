using Serilog;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using CMS.Data;
using CMS.Infrastructure.Notifications.Repositories;
using CMS.Infrastructure.Notifications.NotificationServices;
using CMS.Application.Notifications.Interfaces;
using CMS.Application.Notifications.Services;
using CMS.Domain.NotificationModels.Configuration;
using CMS.Data.Seeders;
using CMS.Application.Shared.Configuration;
using CMS.Application.Auth.Interfaces;
using CMS.Application.Auth.Services;
using CMS.Application.Auth.DTOs.Mapping;
using CMS.Infrastructure.Auth.Repositories;
using CMS.Infrastructure.Auth.Services;
using DotNetEnv;
using CMS.Application.Appointments.Interfaces;
using CMS.Infrastructure.Appointments.Repositories;

// Load environment variables
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog (only config from appsettings.json)
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Host.UseSerilog();

// Database Configuration
var connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING")
    ?? throw new InvalidOperationException("CONNECTION_STRING environment variable is required");

builder.Services.AddDbContext<CmsDbContext>(options =>
    options.UseSqlServer(connectionString));

// JWT Configuration
var jwtSecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
    ?? throw new InvalidOperationException("JWT_SECRET_KEY environment variable is required");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
    ?? throw new InvalidOperationException("JWT_ISSUER environment variable is required");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
    ?? throw new InvalidOperationException("JWT_AUDIENCE environment variable is required");
var jwtAccessTokenExpiryMinutes = Environment.GetEnvironmentVariable("JWT_ACCESS_TOKEN_EXPIRATION_MINUTES")
    ?? throw new InvalidOperationException("JWT_ACCESS_TOKEN_EXPIRATION_MINUTES environment variable is required");
var refreshTokenExpirationDays = Environment.GetEnvironmentVariable("JWT_REFRESH_TOKEN_EXPIRATION_DAYS")
    ?? throw new InvalidOperationException("JWT_REFRESH_TOKEN_EXPIRATION_DAYS environment variable is required");

builder.Services.Configure<JwtSettings>(options =>
{
    options.SecretKey = jwtSecretKey;
    options.Issuer = jwtIssuer;
    options.Audience = jwtAudience;
    options.AccessTokenExpirationMinutes = int.Parse(jwtAccessTokenExpiryMinutes ?? "60");
    options.RefreshTokenExpirationDays = int.Parse(refreshTokenExpirationDays ?? "7");
});

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// External Service Configurations
builder.Services.Configure<SendGridConfig>(options =>
{
    options.ApiKey = Environment.GetEnvironmentVariable("SENDGRID_API_KEY")
        ?? throw new InvalidOperationException("SENDGRID_API_KEY environment variable is required");
    options.FromEmail = Environment.GetEnvironmentVariable("SENDGRID_FROM_EMAIL")
        ?? throw new InvalidOperationException("SENDGRID_FROM_EMAIL environment variable is required");
    options.FromName = Environment.GetEnvironmentVariable("SENDGRID_FROM_NAME") ?? "CMS";
});

builder.Services.Configure<TwilioConfig>(options =>
{
    options.AccountSid = Environment.GetEnvironmentVariable("TWILIO_ACCOUNT_SID")
        ?? throw new InvalidOperationException("TWILIO_ACCOUNT_SID environment variable is required");
    options.AuthToken = Environment.GetEnvironmentVariable("TWILIO_AUTH_TOKEN")
        ?? throw new InvalidOperationException("TWILIO_AUTH_TOKEN environment variable is required");
    options.FromNumber = Environment.GetEnvironmentVariable("TWILIO_FROM_NUMBER")
        ?? throw new InvalidOperationException("TWILIO_FROM_NUMBER environment variable is required");
});

// AutoMapper
builder.Services.AddAutoMapper(typeof(AuthMappingProfile));

// Auth Services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEmailService, CMS.Infrastructure.Auth.Services.SendGridEmailService>();
builder.Services.AddScoped<IVerificationCodeRepository, CMS.Infrastructure.Auth.Repositories.VerificationCodeRepository>();
builder.Services.AddScoped<IInvitationRepository, CMS.Infrastructure.Auth.Repositories.InvitationRepository>();
builder.Services.AddScoped<IJwtService, CMS.Infrastructure.Auth.Services.JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Clinic Services
builder.Services.AddScoped<CMS.Application.Clinic.Interfaces.IDoctorRepository, CMS.Infrastructure.Clinic.Repositories.DoctorRepository>();
builder.Services.AddScoped<CMS.Application.Clinic.Interfaces.ILeaveRepository, CMS.Infrastructure.Clinic.Repositories.LeaveRepository>();
builder.Services.AddScoped<CMS.Application.Clinic.Interfaces.IDoctorService, CMS.Application.Clinic.Services.DoctorService>();

// Appointment Services
builder.Services.AddScoped<CMS.Application.Appointments.Interfaces.ITimeSlotRepository, CMS.Infrastructure.Appointments.Repositories.TimeSlotRepository>();
builder.Services.AddScoped<CMS.Application.Appointments.Interfaces.ITimeSlotService, CMS.Application.Appointments.Services.TimeSlotService>();
builder.Services.AddScoped<IAppointmentService, CMS.Application.Appointments.Services.AppointmentService>();
builder.Services.AddScoped<CMS.Application.IPatient, CMS.Infrastructure.PatientRepository>();
builder.Services.AddScoped<CMS.Application.PatientService>();
builder.Services.AddScoped<CMS.Services.BillPdfService>();

// EMR Services
builder.Services.AddScoped<CMS.Application.EMR.Interfaces.IEMRRepository, CMS.Infrastructure.EMR.Repositories.EMRRepository>();
builder.Services.AddScoped<CMS.Application.EMR.Interfaces.IEncounterRepository, CMS.Infrastructure.EMR.Repositories.EncounterRepository>();
builder.Services.AddScoped<CMS.Application.EMR.Interfaces.IPatientQueueRepository, CMS.Infrastructure.EMR.Repositories.PatientQueueRepository>();
builder.Services.AddScoped<CMS.Application.EMR.Interfaces.IEMRService, CMS.Application.EMR.Services.EMRService>();
builder.Services.AddScoped<CMS.Application.EMR.Interfaces.IEncounterService, CMS.Application.EMR.Services.EncounterService>();
builder.Services.AddScoped<CMS.Application.EMR.Interfaces.IPatientQueueService, CMS.Application.EMR.Services.PatientQueueService>();

// Notification Services
builder.Services.AddScoped<INotificationTemplateRepository, NotificationTemplateRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationQueueRepository, NotificationQueueRepository>();
builder.Services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>();
builder.Services.AddScoped<INotificationTemplateService, NotificationTemplateService>();
builder.Services.AddScoped<INotificationPreferenceService, NotificationPreferenceService>();
builder.Services.AddScoped<INotificationScheduler, NotificationScheduler>();
builder.Services.AddScoped<INotificationSender, CMS.Infrastructure.Notifications.NotificationServices.NotificationSender>();
builder.Services.AddScoped<CMS.Application.Notifications.Services.INotificationSender, CMS.Infrastructure.Notifications.NotificationServices.NotificationSender>();
builder.Services.AddScoped<CMS.Infrastructure.Notifications.NotificationServices.SendGridEmailService>();
builder.Services.AddScoped<CMS.Infrastructure.Notifications.NotificationServices.TwilioSmsService>();

builder.Services.AddScoped<ITemplateNotificationService>(sp =>
{
    var templateService = sp.GetRequiredService<INotificationTemplateService>();
    var emailService = sp.GetRequiredService<CMS.Infrastructure.Notifications.NotificationServices.SendGridEmailService>();
    var smsService = sp.GetRequiredService<CMS.Infrastructure.Notifications.NotificationServices.TwilioSmsService>();
    var logger = sp.GetRequiredService<ILogger<CMS.Infrastructure.Notifications.NotificationServices.NotificationService>>();

    return new CMS.Infrastructure.Notifications.NotificationServices.NotificationService(
        templateService, emailService, smsService, logger);
});

// Core Services
builder.Services.AddDistributedMemoryCache();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString | JsonNumberHandling.WriteAsString;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();

// Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CMS API",
        Version = "v1",
        Description = "Clinic Management System API"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS
var allowedOrigins = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS")?.Split(',')
    ?? throw new InvalidOperationException("CORS_ALLOWED_ORIGINS environment variable is required");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Development Tools
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware Pipeline
app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseMiddleware<CMS.Api.Middleware.RequestCorrelationMiddleware>();
app.UseMiddleware<CMS.Api.Middleware.GlobalExceptionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Database Migration and Seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<CmsDbContext>();

        Log.Information("Applying database migrations...");
        await context.Database.MigrateAsync();
        Log.Information("Database migrations applied successfully");

        Log.Information("Starting database seeding...");
        await DatabaseSeeder.SeedAsync(context);
        Log.Information("Database seeding completed successfully");
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Application failed to start due to database initialization error");
        throw;
    }
}

Log.Information("CMS API started successfully");
app.Run();