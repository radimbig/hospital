using System;
using kamsoft.Models;

namespace kamsoft.Patterms
{
    public class Builder
    {
        private Guid _id;
        private string _name = string.Empty;
        private string _surname = string.Empty;
        private string _pesel = string.Empty;

        public Builder AddId(Guid id)
        {
            _id = id;
            return this;
        }

        public Builder AddName(string name)
        {
            _name = name;
            return this;
        }

        public Builder AddSurname(string surname)
        {
            _surname = surname;
            return this;
        }

        public Builder AddPesel(string pesel)
        {
            _pesel = pesel;
            return this;
        }

        public Person Build()
        {
            var tempSimple = new Person.Simple(_id, _name, _surname);
            var tempWithPesel = new Person.WithPesel(_id, _name, _surname, _pesel);

            var validator = new Strategy();
            if (validator.IsValid(tempWithPesel))
            {
                return tempWithPesel;
            }
            if (validator.IsValid(tempSimple))
            {
                return tempSimple;
            }
            throw new ArgumentException("Invalid person data");
        }
    }
} 