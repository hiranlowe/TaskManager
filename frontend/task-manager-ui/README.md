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
npm start
```

Default UI URL:

- `http://localhost:4200`

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
2. Trust the local .NET HTTPS certificate with `dotnet dev-certs https --trust`
3. Check `public/app-config.json`
