# Moneydee finance app

This repository supports two modes:

- GitHub Pages static mode: the browser app runs from GitHub and stores data locally in the browser.
- Node.js + SQLite mode: the included API server stores shared data for a server deployment.

## GitHub Pages

The repository includes a GitHub Actions workflow that publishes the static app from the `master` branch.

Static GitHub Pages mode does not run `server.js` or SQLite, so data is not synchronized between devices.

## Run locally with the database

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
