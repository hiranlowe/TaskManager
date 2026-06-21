using Microsoft.AspNetCore.Authentication;

namespace TaskManager.Api.Authentication;

public sealed class BasicAuthenticationOptions : AuthenticationSchemeOptions
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}