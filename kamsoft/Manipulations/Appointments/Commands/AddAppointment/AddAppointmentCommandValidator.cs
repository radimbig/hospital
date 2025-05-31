using FluentValidation;
using kamsoft.Manipulations.Appointments.Commands;

namespace kamsoft.Manipulations.Appointments
{
    public class AddAppointmentCommandValidator : AbstractValidator<AddAppointmentCommand>
    {
        public AddAppointmentCommandValidator() 
        {
            RuleFor(x => x.Slot.Start).GreaterThan(DateTime.Now).WithMessage("You cannot create appointments to the past");

            RuleFor(x => x.Slot.Start).LessThan(x => x.Slot.End).WithMessage("Invalid time slot: Start time must be before end time.");

        }
    }
}
