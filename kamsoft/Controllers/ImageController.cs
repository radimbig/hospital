using kamsoft.Manipulations.Persons.Queries;
using kamsoft.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace kamsoft.Controllers
{


    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Doctor,Patient")]
    public class ImageController : Controller
    {

        private readonly IAzureImageService _imageService;
        private readonly IMediator _mediator;


        public ImageController(IAzureImageService imageService, IMediator mediator)
        {
            _imageService = imageService ?? throw new ArgumentNullException(nameof(imageService));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }


        [HttpGet("{personId}")]
        public async Task<IResult> GetImage(Guid personId)
        {
            var image = await _imageService.GetAsync(personId);
            if (image == null)
                return Results.NotFound();

            return Results.File(image.Content, image.ContentType, image.FileName);
        }

        [HttpPost]
        public async Task<IResult> AddImageToMyPerson([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return Results.BadRequest("File cannot be null or empty.");
            }
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Results.Unauthorized(); // Or return a specific error
            }
            Guid authorizedUserId;
            if (!Guid.TryParse(userIdClaim.Value, out authorizedUserId))
            {
                // Handle case where the claim value is not a valid Guid
                return Results.Unauthorized();
            }

            var person = await _mediator.Send(new GetPersonByCredentialsQuery(authorizedUserId));
            if(!person.IsSuccess)
                return Results.NotFound("Person not found.");
            Guid personId = person.Result.Id;

            await _imageService.AddImage(personId, file);

            return Results.Ok("Image uploaded successfully.");
        }

    }
}
