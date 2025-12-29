using CMS.Application.Auth.Interfaces;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading.Tasks;

namespace CMS.Infrastructure.Auth.Services
{
    public class SendGridEmailService : IEmailService
    {
        private readonly string _apiKey;
        private readonly string _fromEmail;
        private readonly string _fromName;

        public SendGridEmailService(IConfiguration configuration)
        {
            _apiKey = Environment.GetEnvironmentVariable("SENDGRID_API_KEY") 
                ?? configuration["SENDGRID_API_KEY"] 
                ?? configuration["SendGrid:ApiKey"]
                ?? string.Empty;
            _fromEmail = Environment.GetEnvironmentVariable("SENDGRID_FROM_EMAIL") 
                ?? configuration["SENDGRID_FROM_EMAIL"]
                ?? configuration["SendGrid:FromEmail"]
                ?? "no-reply@yourdomain.com";
            _fromName = Environment.GetEnvironmentVariable("SENDGRID_FROM_NAME") 
                ?? configuration["SENDGRID_FROM_NAME"]
                ?? configuration["SendGrid:FromName"]
                ?? "CMS";
                
            // Log configuration for debugging
            Console.WriteLine($"[SendGridEmailService] API Key configured: {!string.IsNullOrEmpty(_apiKey)}");
            Console.WriteLine($"[SendGridEmailService] From Email: {_fromEmail}");
            Console.WriteLine($"[SendGridEmailService] From Name: {_fromName}");
        }

        public async Task SendEmailAsync(string toEmail, string subject, string plainTextContent, string? htmlContent = null)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                Console.WriteLine($"[EMAIL SERVICE] SendGrid API key not configured. Would send email:");
                Console.WriteLine($"To: {toEmail}");
                Console.WriteLine($"Subject: {subject}");
                Console.WriteLine($"Content: {plainTextContent}");
                return;
            }

            try
            {
                var client = new SendGridClient(_apiKey);
                var from = new EmailAddress(_fromEmail, _fromName);
                var to = new EmailAddress(toEmail);
                var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
                var response = await client.SendEmailAsync(msg);
                
                Console.WriteLine($"[EMAIL SERVICE] SendGrid response: {response.StatusCode}");
                
                if (response.StatusCode == System.Net.HttpStatusCode.Accepted)
                {
                    Console.WriteLine($"[EMAIL SERVICE] Email sent successfully to {toEmail}");
                }
                else
                {
                    var body = await response.Body.ReadAsStringAsync();
                    Console.WriteLine($"[EMAIL SERVICE] SendGrid error: {body}");
                    
                    // If SendGrid fails (like credits exceeded), log the content for development
                    Console.WriteLine($"[EMAIL SERVICE] FALLBACK - Email content for {toEmail}:");
                    Console.WriteLine($"Subject: {subject}");
                    Console.WriteLine($"Content: {plainTextContent}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL SERVICE] Exception sending email: {ex.Message}");
                Console.WriteLine($"[EMAIL SERVICE] FALLBACK - Email content for {toEmail}:");
                Console.WriteLine($"Subject: {subject}");
                Console.WriteLine($"Content: {plainTextContent}");
            }
        }
    }
}
