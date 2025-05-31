using FluentValidation;
using kamsoft.Models;

namespace kamsoft.Manipulations.Persons.Commands
{
    public class AddPersonCommandValidator : AbstractValidator<AddPersonCommand>
    {
        public AddPersonCommandValidator()
        {
            RuleFor(x => x.Person).NotNull().WithMessage("Person cannot be null.");
            RuleFor(x => x.Credentials).NotNull().WithMessage("Credentials cannot be null.");

            // Используем SetInheritanceValidator для обработки наследования
            // Регистрируем валидатор для Person.WithPeselAndRole
            RuleFor(x => x.Person).Must(p =>
            {
                if(p is Person.WithPesel ps)
                {
                    return ps.Pesel.Length == 11;
                }
                if (p is Person.WithPeselAndRole psr)
                {
                    return psr.Pesel.Length == 11;
                }
                return true;
            }).WithMessage("Pessel must be exactly 11");
        }
    }
}
