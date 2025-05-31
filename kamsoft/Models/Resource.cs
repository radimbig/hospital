namespace kamsoft.Models
{
    public abstract class BasicResource;
    public class Resource<T>(T data) where T : BasicResource;

    public class Slot : BasicResource
    {
        public Slot() { }
        public Slot(DateTime Start, DateTime End)
        {
            this.Start = Start;
            this.End = End;
        }

        public DateTime Start { get; set; }
        public DateTime End { get; set; }

    }
    public class Appointment : BasicResource
    {
        public Guid Id { get; set; }

        public Slot Slot { get; set; }

        public Person Patient { get; set; }
        public Person Doctor { get; set; }

        public Guid? PatientId { get; set; }
        public Guid? DoctorId { get; set; }

        public Appointment() { }

        public Appointment(Guid id, Slot slot, Person patient, Person doctor)
        {
            Id = id;
            Slot = slot;
            Patient = patient;
            Doctor = doctor;
        }
    }

    public class Visit(Guid Id, Slot Slot, Person Patient) : BasicResource;

}
