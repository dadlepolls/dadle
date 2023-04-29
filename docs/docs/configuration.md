---
slug: /configuration
sidebar_position: 3
---

# Configuration

Dadle is configured by environment variables, either by setting them in the `.env`-File or by specifying them when running the frontend or backend service.

## General config

### `PACKAGE_VERSION`

Version of Dadle to be used. Default: `latest`. Can be `latest` for latest stable version, `dev` for current development snapshot or any other tagged version.

### `DADLE_PORT`

HTTP port that the service is listening on. You should expose this port to public by some reverse proxy and with HTTPS configured. Default: `3000`.

### `BACKEND_LOG_LEVEL`

Log level for the backend service, specifying verbosity. One of `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`

### `BACKEND_PUBLIC_URL`

THe public URL that the backend is reachable at, without trailing slash. Example: `https://dadle-backend-stable.example.com` or `https://dadle.example.com/backend`

### `FRONTEND_PUBLIC_URL`

The public URL that the frontend service is reachable at, without trailing slash.

### `BACKEND_TRUST_PROXY`

This sets the ["trust proxy" attribute](https://expressjs.com/guide/behind-proxies.html) of the backend service. For the pre-built Docker image, this may be set to 1 (if you are accessing Dadle directly from your system), 2 (if you've got a reverse proxy running) or any other value stated in the [documentation](https://expressjs.com/guide/behind-proxies.html)

## Authentication settings

Any OpenID provider (e.g. MS Azure, Google Sign-In, Keycloak etc.) can be used for allowing users to sign in to the instance.

### `AUTH_ISSUER_BASEURL`

OpenID-Connect base URL of your OID provider

- Microsoft Azure: `https://login.microsoftonline.com/organizations/v2.0`
- Google: `https://accounts.google.com`

### `AUTH_CLIENT_ID` and `AUTH_CLIENT_SECRET`

Client ID and secret for app openid app registration

## Calendar integration

Currently, Dadle allows users to link their Microsoft 365 and Google calendars to show availability hints on date polls.

Therefore, you must register an app with Microsoft and/ or Google and configure it. See the chapters for setting up calendar integrations for further details and detailed explanations.

### Microsoft 365 Calendar

#### `CAL_MS_TENANT_ID`

Azure tenant ID that the app registration was made with or `common` in case you've configured your app as a multi-tenant application

#### `CAL_MS_CLIENT_ID` and `CAL_MS_CLIENT_SECRET`

Client ID and secret for the Azure app registration

### Google Calendar

#### `CAL_GOOGLE_CLIENT_ID` and `CAL_GOOGLE_CLIENT_SECRET`

Client ID and secret for the Google app registration.

## Usage-related settings

### `ALLOW_POLL_LISTING`

When set to `true`, all polls that have been created on the instance will be displayed on the home page. If not, the home page will be empty or show the polls that the authenticated user has created or participated in.
