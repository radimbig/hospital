using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.Appointments.Queries
{
    public class GetAppointmentsQueryHandler : IRequestHandler<GetAppointmentsQuery, MediatorResult<List<Appointment>>>
    {
        private readonly HospitalContext ctx;

        public GetAppointmentsQueryHandler(HospitalContext context)
        {
            this.ctx = context;
        }
        public async Task<MediatorResult<List<Appointment>>> Handle(GetAppointmentsQuery request, CancellationToken cancellationToken)
        {
            var asker = ctx.Credentials.Include(c => c.Person)
                .FirstOrDefault(c => c.Id == request.TargetCredentialsId);
            if (asker == null)
            {
                return MediatorResult<List<Appointment>>.Failure("Credentials not found");
            }

            PersonRole? role = null;
            switch (asker.Person)
            {
                case Person.WithPeselAndRole ppr:
                    role = ppr.Role;
                    break;
                case Person.WithRole pr:
                    role = pr.Role;
                    break;
                default:
                    return MediatorResult<List<Appointment>>.Failure("Person must have role to get appoinments");
            }
            List<Appointment> appointments;
            if (role == PersonRole.Doctor)
            {
                appointments = await ctx.Appointments.Include(a=>a.Patient).Where(a
                    => a.DoctorId == asker.Person.Id && a.Slot.Start >= DateTime.Now)
                    .OrderBy(a => a.Slot.Start)
                    .Take(request.Count)
                    .ToListAsync();
            }
            else
            {
                appointments = await ctx.Appointments.Include(a=>a.Doctor).Where(a
                    => a.PatientId == asker.Person.Id && a.Slot.Start >= DateTime.Now)
                    .OrderBy(a => a.Slot.Start)
                    .Take(request.Count)
                    .ToListAsync();
            }
            return MediatorResult<List<Appointment>>.Success(appointments);
        }
    }
}
