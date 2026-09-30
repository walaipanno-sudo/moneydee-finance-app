# Moneydee finance app

This version stores shared data in SQLite through a small Node.js API.

## Run locally

```bash
npm start
```

Open `http://localhost:3000`.

## Use across devices

Run the server on a computer or hosted VM that other devices can reach, then open:

```text
http://YOUR-SERVER-IP:3000
```

The app and API are served from the same origin. The database file is `moneydee.sqlite`.

For internet access, place the app behind HTTPS and authentication before exposing it publicly. The current API is intentionally a simple single-user backend and does not yet include accounts, permissions, or encrypted transport by itself.

## API

- `GET /api/health`
- `GET /api/state`
- `PUT /api/state`
