using Microsoft.EntityFrameworkCore;
using kamsoft.Models;

namespace kamsoft.Database
{
    public class HospitalContext : DbContext
    {
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Credentials> Credentials { get; set; }

        public HospitalContext(DbContextOptions<HospitalContext> options) : base(options)
        {
            //Database.EnsureCreated();
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure Person hierarchy (TPH - Table Per Hierarchy)
            // EF Core will automatically configure TPH for the Person hierarchy
            // You can optionally configure the discriminator column name and values here if needed:
            modelBuilder.Entity<Person>()
                .ToTable("persons") // Specify the table name for the Person hierarchy
                .HasDiscriminator<string>("PersonType")
                .HasValue<Person.Simple>("Simple")
                .HasValue<Person.WithPesel>("WithPesel")
                .HasValue<Person.WithRole>("WithRole")
                .HasValue<Person.WithPeselAndRole>("WithPeselAndRole");
            modelBuilder.Entity<Person.WithPeselAndRole>()
                .Property(p => p.Role)
                .HasDefaultValue(PersonRole.Patient);
            modelBuilder.Entity<Person.WithPeselAndRole>()
                .Property(p => p.Pesel)
                .IsRequired()
                .HasMaxLength(11); // Assuming PESEL is always 11 characters long
            modelBuilder.Entity<Person.WithPeselAndRole>()
                .HasIndex(p => p.Pesel)
                .IsUnique(); // Ensure unique PESEL for WithPeselAndRole


            modelBuilder.Entity<Person.WithRole>()
                .Property(x=>x.Role)
                .HasDefaultValue(PersonRole.Patient);

            modelBuilder.Entity<Person.WithPesel>()
                .Property(p => p.Pesel)
                .IsRequired()
                .HasMaxLength(11); // Assuming PESEL is always 11 characters long
            modelBuilder.Entity<Person.WithPesel>()
                .HasIndex(p => p.Pesel)
                .IsUnique(); // Ensure unique PESEL for WithPeselAndRole
            


            // Configure relationship Appointment -> Patient
            modelBuilder.Entity<Appointment>()
                .ToTable("appointments") // Specify the table name for Appointments
                .HasOne(a => a.Patient) // Appointment has one Patient
                .WithMany() // Patient can have many Appointments (no navigation property on Person)
                .HasForeignKey(a => a.PatientId); // Use PatientId as the foreign key

            // Configure relationship Appointment -> Doctor
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Doctor) // Appointment has one Doctor
                .WithMany() // Doctor can have many Appointments (no navigation property on Person)
                .HasForeignKey(a => a.DoctorId); // Use DoctorId as the foreign key

            // Configure Slot as an Owned Entity Type within Appointment
            // This maps the properties of Slot directly into the Appointment table
            modelBuilder.Entity<Appointment>()
                .OwnsOne(a => a.Slot);

            modelBuilder.Entity<Credentials>()
                .ToTable("credentials") // Specify the table name for Credentials
                .HasOne(c => c.Person)
                .WithOne()
                .HasForeignKey<Credentials>(c => c.PersonId);
            modelBuilder.Entity<Credentials>()
                .HasIndex(c => c.Login)
                .IsUnique();


            base.OnModelCreating(modelBuilder);
        }
    }
}
