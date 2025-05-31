using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;

namespace kamsoft.Manipulations.Appointments.Queries
{
    public class GetAppointmentsByLoginQuery : IRequest<MediatorResult<List<Appointment>>>
    {
        public string DoctorLogin;
        public int count;
        public GetAppointmentsByLoginQuery(string doctorLogin, int count)
        {
            DoctorLogin = doctorLogin;
            this.count = count;
        }

    }
}
