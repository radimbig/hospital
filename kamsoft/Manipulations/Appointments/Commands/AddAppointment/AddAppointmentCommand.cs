using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Appointments.Commands
{
    public class AddAppointmentCommand : IRequest<MediatorResult<Appointment>>
    {
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public Slot Slot { get; set; }
        public AddAppointmentCommand(Guid patientId, Guid doctorId, Slot slot)
        {
            PatientId = patientId;
            DoctorId = doctorId;
            Slot = slot;
        }
    }
}
