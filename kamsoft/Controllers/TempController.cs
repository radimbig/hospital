using kamsoft.Models;
using kamsoft.Patterms;
using Microsoft.AspNetCore.Mvc;

namespace kamsoft.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TempController : Controller
    {
        private readonly IRepository _storageRepository;
        public TempController(IRepository storage)
        {
            _storageRepository = storage;
        }

        [HttpGet("get/{id}")]
        public async Task<IResult> Get(Guid id)
        {
            var person = await _storageRepository.Get<Person>(id);
            return Results.Ok(person);
        }

        [HttpPost("create")]
        public async Task<IResult> Create(PersonRequest req)
        {
            var mapper = new PersonRequestMapper();
            var person = mapper.Map(req);
            await _storageRepository.Save(person);
            return Results.Ok(person);
        }
    }
}
