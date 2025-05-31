namespace kamsoft.Infrastructure.Middlewares
{
    public class DisableRegisterApiMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string? _disableRegistration;

        public DisableRegisterApiMiddleware(RequestDelegate next, IConfiguration config)
        {
            _next = next;
            
            // Alternatively:
             _disableRegistration = Environment.GetEnvironmentVariable("DISABLE_REGISTRATION");
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (!string.IsNullOrEmpty(_disableRegistration) &&
                _disableRegistration.Equals("true", StringComparison.OrdinalIgnoreCase) &&
                context.Request.Path.StartsWithSegments("/api/auth/register", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                await context.Response.WriteAsync("Registration is currently disabled.");
                return;
            }

            await _next(context);
        }
    }

}