using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Appointments.Queries
{
    public class GetAppointmentQuery : IRequest<MediatorResult<Appointment>> 
    {
        public Guid AppointmentId{ get; set; }

        public GetAppointmentQuery(Guid id)
        {
            AppointmentId = id;
        }
    }
}
