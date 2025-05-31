using AutoMapper;
using kamsoft.Models.Views;

namespace kamsoft.Models.MaperProfiles
{
    public class PersonToVMProfile : Profile
    {
        public PersonToVMProfile()
        {
            CreateMap<Person, PersonVM.Simple>()
                .Include<Person.WithPeselAndRole, PersonVM.Simple>()
                .Include<Person.WithRole, PersonVM.Simple>()
                .Include<Person.WithPesel, PersonVM.Simple>()
                .Include<Person.Simple, PersonVM.Simple>();

            CreateMap<Person.WithPeselAndRole, PersonVM.Simple>();
            CreateMap<Person.WithRole, PersonVM.Simple>();
            CreateMap<Person.WithPesel, PersonVM.Simple>();
            CreateMap<Person.Simple, PersonVM.Simple>();

            CreateMap<Person.WithPeselAndRole, PersonVM.WithPesel>();
            CreateMap<Person.WithRole, PersonVM.WithPesel>();
            CreateMap<Person.WithPesel, PersonVM.WithPesel>();
            CreateMap<Person.Simple, PersonVM.WithPesel>();

            


            CreateMap<Person.WithRole, PersonVM.WithRole>()
            .IncludeBase<Person.WithRole, PersonVM.Simple>()
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role));

            CreateMap<Person.WithPeselAndRole, PersonVM.WithRole>()
                .IncludeBase<Person.WithPeselAndRole, PersonVM.Simple>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role));

            // Slot → Slot (або SlotDto якщо буде)
            CreateMap<Slot, Slot>();


        }
    }
}
