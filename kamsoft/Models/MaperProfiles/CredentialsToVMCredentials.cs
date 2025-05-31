using AutoMapper;
using kamsoft.Models.Views;

namespace kamsoft.Models.MaperProfiles
{
    public class CredentialsToVMCredentials : Profile
    {
        public CredentialsToVMCredentials() 
        {
            CreateMap<Credentials, CredentialsVM>();


            CreateMap<Credentials, CredentialsVM.WithPerson>()
            .ForMember(dest => dest.Person, opt => opt.MapFrom(src => src.Person));
        }
    }
}
