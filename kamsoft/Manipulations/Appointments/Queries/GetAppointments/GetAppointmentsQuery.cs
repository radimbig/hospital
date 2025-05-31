using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Appointments.Queries
{
    public class GetAppointmentsQuery : IRequest<MediatorResult<List<Appointment>>>
    {
        public int Count { get; set; }
        public Guid TargetCredentialsId { get; set; }

        public GetAppointmentsQuery(int count, Guid targetCredentialsId)
        {
            Count = count;
            TargetCredentialsId = targetCredentialsId;
        }
    }
}
