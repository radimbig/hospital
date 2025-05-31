using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Appointments.Commands
{
    public class DeleteAppointmentCommand : IRequest<MediatorResult<Appointment>>
    {
        public Guid AppointmentId { get; set; }

        public DeleteAppointmentCommand(Guid appointmentId)
        {
            AppointmentId = appointmentId;
        }
    }
}
