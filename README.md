# Task Manager

Full-stack task management app.

- Backend: ASP.NET Core Web API in `backend/`
- Frontend: Angular app in `frontend/task-manager-ui/`

## Quick Start

Default local URLs:

- API: `https://localhost:7111`
- UI: `http://localhost:4200`

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
npm start
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
