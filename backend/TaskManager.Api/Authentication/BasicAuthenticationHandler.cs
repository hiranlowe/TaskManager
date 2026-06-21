using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;

namespace TaskManager.Api.Authentication;

public sealed class BasicAuthenticationHandler(
    IOptionsMonitor<BasicAuthenticationOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<BasicAuthenticationOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!this.Request.Headers.TryGetValue("Authorization", out var authorizationHeader))
        {
            return Task.FromResult(AuthenticateResult.Fail("Missing Authorization header."));
        }

        if (!AuthenticationHeaderValue.TryParse(authorizationHeader, out var headerValue) ||
            !BasicAuthenticationDefaults.AuthenticationScheme.Equals(headerValue.Scheme, StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrWhiteSpace(headerValue.Parameter))
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid Authorization header."));
        }

        string username;
        string password;

        try
        {
            var credentialsBytes = Convert.FromBase64String(headerValue.Parameter);
            var credentials = Encoding.UTF8.GetString(credentialsBytes);
            var parts = credentials.Split(':', 2);

            if (parts.Length != 2)
            {
                return Task.FromResult(AuthenticateResult.Fail("Invalid Basic auth payload."));
            }

            username = parts[0];
            password = parts[1];
        }
        catch
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid Base64 credentials."));
        }

        if (!string.Equals(username, this.Options.Username, StringComparison.Ordinal) ||
            !string.Equals(password, this.Options.Password, StringComparison.Ordinal))
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid username or password."));
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.AuthenticationMethod, BasicAuthenticationDefaults.AuthenticationScheme)
        };

        var identity = new ClaimsIdentity(claims, BasicAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, BasicAuthenticationDefaults.AuthenticationScheme);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        this.Response.Headers.WWWAuthenticate = "Basic realm=\"TaskManager\"";
        return base.HandleChallengeAsync(properties);
    }
}