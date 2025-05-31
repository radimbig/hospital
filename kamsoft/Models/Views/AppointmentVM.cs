namespace kamsoft.Models.Views
{
    public class AppointmentVM
    {
        public Guid Id { get; set; }
        public Slot? Slot { get; set; }
        
        public PersonVM.Simple? Patient { get; set; }

        public PersonVM.Simple? Doctor { get; set; }

    }
}
