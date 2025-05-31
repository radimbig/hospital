using kamsoft.Database;
using kamsoft.Models;
using kamsoft.Patterms;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace kamsoft.Manipulations.Appointments.Commands
{
    public class AddAppointmentCommandHandler : IRequestHandler<AddAppointmentCommand, MediatorResult<Appointment>>
    {
        private readonly HospitalContext ctx;
        public AddAppointmentCommandHandler(HospitalContext ctx)
        {
               this.ctx = ctx;
        }
        public async Task<MediatorResult<Appointment>> Handle(AddAppointmentCommand request, CancellationToken cancellationToken)
        {
            var appointment = new Appointment
            {
                PatientId = request.PatientId,
                DoctorId = request.DoctorId,
                Slot = request.Slot
            };
            bool isSlotFree = !await ctx.Appointments.AnyAsync(
                a => a.Slot.Start < request.Slot.End &&
                a.Slot.End > request.Slot.Start &&
                a.DoctorId == request.DoctorId,
                cancellationToken);
            if(!isSlotFree)
            {
                return MediatorResult<Appointment>.Failure("The selected time slot is not available for the doctor.");
            }
            ctx.Appointments.Add(appointment);
            await ctx.SaveChangesAsync(cancellationToken);
            return MediatorResult<Appointment>.Success(appointment);
        }
    }
}
