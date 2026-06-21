# Task Manager Frontend

Angular frontend for the Task Manager app.

## Prerequisites

- Node.js 20+
- npm 10+
- Backend API running at `https://localhost:7111`

## Run

From `frontend/task-manager-ui/`:

```bash
npm install
npm run start
```

Default UI URL:

- `https://localhost:4200`

If this is the first run on a machine, trust and export a local development certificate:

```powershell
dotnet dev-certs https --trust
if (!(Test-Path .cert)) { New-Item -ItemType Directory .cert | Out-Null }
dotnet dev-certs https --export-path .cert/localhost.pem --format Pem --no-password
```

## Build

```bash
npm run build
```

## Tests

```bash
npm test
```

## API Configuration

Set the backend URL in `public/app-config.json`:

```json
{
  "apiBaseUrl": "https://localhost:7111"
}
```

The app loads this file at runtime, so you can change the API URL without rebuilding.

## Login

The app uses Basic Authentication.

- Wrong credentials show an error on the login page
- Press `Enter` in the login form to sign in
- Successful login stores a token in `localStorage`
- Logout clears the token and returns to the login page

## Troubleshooting

If login or task loading fails:

1. Make sure the backend is running on `https://localhost:7111`
2. Start the frontend from `frontend/task-manager-ui` (not repository root)
3. Trust/export the local HTTPS certificate as shown above
4. Check `public/app-config.json`
5. Confirm credentials in `backend/TaskManager.Api/appsettings.json` (`admin` / `admin123` by default)
