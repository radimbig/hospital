using AutoMapper;
using kamsoft.Models.Views;

namespace kamsoft.Models.MaperProfiles
{
    public class AppointmentToVMAppointment : Profile
    {
        public AppointmentToVMAppointment() {

            // Appointment → AppointmentVM
            CreateMap<Appointment, AppointmentVM>();
        }
    }
}
