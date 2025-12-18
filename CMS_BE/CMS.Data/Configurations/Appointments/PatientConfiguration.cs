using CMS.Domain.Appointments.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CMS.Data.Configurations.Appointments
{
    public class PatientConfiguration : IEntityTypeConfiguration<Patient>
    {
        public void Configure(EntityTypeBuilder<Patient> builder)
        {
            builder.ToTable("Patients");
            
            builder.HasKey(p => p.patient_id);

            builder.Property(p => p.patient_id)
                  .HasColumnName("patient_id")
                  .HasDefaultValueSql("NEWSEQUENTIALID()") 
                  .ValueGeneratedOnAdd();
                  
            builder.Property(p => p.blood_group)
                  .IsRequired()
                  .HasMaxLength(10);
                  
            builder.Property(p => p.country)
                  .HasMaxLength(100);
                  
            builder.Property(p => p.city)
                  .HasMaxLength(100);
                  
            builder.Property(p => p.state)
                  .HasMaxLength(100);
                  
            builder.Property(p => p.pincode)
                  .HasMaxLength(20);
        }
    }
}
