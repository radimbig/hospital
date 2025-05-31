using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.Appointments.Queries
{
    public class GetAppointmentsByLoginQueryHandler : IRequestHandler<GetAppointmentsByLoginQuery, MediatorResult<List<Appointment>>>
    {
        private readonly HospitalContext ctx;

        public GetAppointmentsByLoginQueryHandler(HospitalContext ctx)
        {
            this.ctx = ctx;
        }
        public async Task<MediatorResult<List<Appointment>>> Handle(GetAppointmentsByLoginQuery request, CancellationToken cancellationToken)
        {

            var cred = await ctx.Credentials.Include(x=>x.Person).FirstOrDefaultAsync(x => x.Login == request.DoctorLogin);
            if(cred == null)
                return MediatorResult<List<Appointment>>.Failure("No credentials for provided login");
            if (cred.Person == null)
                return MediatorResult<List<Appointment>>.Failure("No doctor for provided login");
            var appointments = await ctx.Appointments
                .Include(x=>x.Patient)
                .Where(x=>x.DoctorId == cred.PersonId && x.Slot.Start >= DateTime.Now)
                .OrderBy(a => a.Slot.Start)
                .Take(request.count)
                .ToListAsync();

            return MediatorResult<List<Appointment>>.Success(appointments);
        }
    }
}
