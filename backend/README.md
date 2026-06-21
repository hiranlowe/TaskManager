# Task Manager Backend

ASP.NET Core Web API for the Task Manager app.

## Projects

- `TaskManager.Api` - API host and authentication
- `TaskManager.Application` - service layer and DTOs
- `TaskManager.Domain` - domain entities
- `TaskManager.Infrastructure` - EF Core and repositories
- `TaskManager.Application.Tests` - backend unit tests

## Prerequisites

- .NET SDK 10.x
- SQL Server

## Config

Main file:

- `TaskManager.Api/appsettings.json`

Important settings:

- `ConnectionStrings:DefaultConnection`
- `BasicAuthentication:Username`
- `BasicAuthentication:Password`

Default local login:

- Username: `admin`
- Password: `admin123`

## Run

From `backend/`:

```powershell
dotnet restore .\TaskManager.slnx
dotnet run --project .\TaskManager.Api\TaskManager.Api.csproj --launch-profile https
```

Default API URL:

- `https://localhost:7111`

If needed, trust the local HTTPS certificate once:

```powershell
dotnet dev-certs https --trust
```

## Swagger

- `https://localhost:7111/swagger`

## Tests

```powershell
dotnet test .\TaskManager.slnx
```

Service-layer unit tests live in `TaskManager.Application.Tests`.

## Database

On startup, the API applies migrations and seeds starter data.

To reset your local database:

```powershell
dotnet ef database drop --project .\TaskManager.Infrastructure\TaskManager.Infrastructure.csproj --startup-project .\TaskManager.Api\TaskManager.Api.csproj --force
dotnet run --project .\TaskManager.Api\TaskManager.Api.csproj --launch-profile https
```

## Notes

- CORS allows `http://localhost:4200`
- API base route: `https://localhost:7111/api/tasks`
- Keep the frontend `app-config.json` URL aligned with the backend URL
