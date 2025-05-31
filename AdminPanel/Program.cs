using kamsoft.Database;
using kamsoft.Models;
using Microsoft.EntityFrameworkCore;
namespace AdminPanel
{
    internal class Program
    {
        static void Main(string[] args)
        {
            string connectionString;

            using(var reader = new StreamReader("connectionString.txt"))
            {
                connectionString = reader.ReadLine();
                if(connectionString == null)
                {
                    throw new Exception("Connection string is missing in connectionString.txt");
                }
            }
            
            
                // Ensure database is created
            string? tempConsoleInput;
            Guid personId = Guid.Empty;

            Console.WriteLine("Please write id of person you want change role");
            tempConsoleInput = Console.ReadLine();
            if(!Guid.TryParse(tempConsoleInput, out personId))
            {
                throw new ArgumentException("Invalid person ID format. Please provide a valid GUID.");
            }
            Console.WriteLine("Please write new role for person (0:Doctor, 1:Patient, 2:Admin) as number:");
            int numberOfRole;
            tempConsoleInput = Console.ReadLine();
            if(tempConsoleInput == null)
            {
                throw new ArgumentException("Role input cannot be null. Please provide a valid role.");
            }
            numberOfRole = int.Parse(tempConsoleInput);
            if (!Enum.IsDefined(typeof(PersonRole), numberOfRole)){
                throw new ArgumentOutOfRangeException("Invalid role number. Please provide a valid role number (0:Doctor, 1:Patient, 2:Admin).");
            }
            PersonRole newRole = (PersonRole)numberOfRole;

            //connection to db
            var options = new DbContextOptionsBuilder<HospitalContext>()
                .UseMySQL(connectionString)
                .Options;
            using (var ctx = new HospitalContext(options))
            {
                if (ctx.Database.CanConnect())
                {
                    Console.WriteLine("Database already exists and is connected.");
                }
                else
                {
                    throw new Exception("Database connection failed. Please check your connection string.");
                }
                var target = ctx.Persons.FirstOrDefault(p => p.Id == personId);
                if(target == null)
                {
                    throw new Exception($"Person with ID {personId} not found in the database.");
                }
                switch (target)
                {
                    case Person.WithPeselAndRole ppr:
                        ppr.Role = newRole;
                        ctx.Persons.Update(ppr);
                        break;
                    case Person.WithRole pr:
                        pr.Role = newRole;
                        ctx.Persons.Update(pr);
                        break;
                    case Person.WithPesel pp:
                        Person.WithPeselAndRole copy = new Person.WithPeselAndRole(pp.Id, pp.Name, pp.Surname, pp.Pesel, newRole);
                        ctx.Persons.Remove(pp);
                        ctx.Persons.Add(copy);
                        break;
                    case Person.Simple ps:
                        throw new InvalidOperationException("Person with no pessel cannot have a role assigned. Please provide a person with a PESEL or role.");
                }
                ctx.SaveChanges();
                Console.WriteLine($"New role is{newRole.ToString()} for person with id:{target.Id}");
            }
        }
    }
}
