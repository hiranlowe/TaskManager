# Task Manager

Full-stack task management app.

- Backend: ASP.NET Core Web API in `backend/`
- Frontend: Angular app in `frontend/task-manager-ui/`

## Quick Start

Default local URLs:

- API: `https://localhost:7111`
- UI: `https://localhost:4200`

Backend:

```powershell
Set-Location .\backend
dotnet restore .\TaskManager.slnx
dotnet run --project .\TaskManager.Api\TaskManager.Api.csproj --launch-profile https
```

If needed, trust the local HTTPS certificate once:

```powershell
dotnet dev-certs https --trust
```

Frontend:

```powershell
Set-Location .\frontend\task-manager-ui
npm install
npm run start
```

Note: running `npm run start` from the repository root fails because there is no root `package.json`.

For local HTTPS UI certificate setup (one-time on a machine):

```powershell
dotnet dev-certs https --trust
Set-Location .\frontend\task-manager-ui
if (!(Test-Path .cert)) { New-Item -ItemType Directory .cert | Out-Null }
dotnet dev-certs https --export-path .cert\localhost.pem --format Pem --no-password
```

## Login

Default local credentials:

- Username: `admin`
- Password: `admin123`

## Frontend API URL

Change the backend URL in `frontend/task-manager-ui/public/app-config.json`:

```json
{
  "apiBaseUrl": "https://localhost:7111"
}
```

## Database

SQL Server backup included:

- `database/TaskManagerDb.bak`

After restoring the database, make sure `backend/TaskManager.Api/appsettings.json` points to `TaskManagerDb`.

## Docs

- Backend: `backend/README.md`
- Frontend: `frontend/task-manager-ui/README.md`

## Current Structure

Backend projects in `backend/TaskManager.slnx`:

- `TaskManager.Api`
- `TaskManager.Application`
- `TaskManager.Domain`
- `TaskManager.Infrastructure`
- `TaskManager.Application.Tests`
