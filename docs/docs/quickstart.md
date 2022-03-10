---
slug: /quickstart
sidebar_position: 2
---

# Quickstart

This document guides you on the fastest possible way to get DadleX running

## Prerequisites

Ideally, DadleX should run on some sort of server. Please make sure that all of those dependencies are installed.

- Git (install it via your favorite package manager, e.g. `sudo apt install git`)
- OpenSSL
- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/gettingstarted/)

## Download

Clone the git repository and navigate into the directory:

```bash
git clone -b main https://github.com/exanion/dadlex.git
cd dadlex
```

:::tip
Replace `main` with `dev` in case you want to try the latest snapshot build
:::

## Configuration

For creating session tokens, a keypair needs to be created: 
```bash
mkdir -p ./data/backend-secrets
openssl genrsa -out ./data/backend-secrets/tokens.key 2048
openssl rsa -in ./data/backend-secrets/tokens.key -pubout -out ./data/backend-secrets/tokens.pub
sudo chown -R 1001:docker ./data/backend-secrets
```

Configuration variables will be set in the `.env`-File. A template is provided in `.env.example`
```bash
cp .env.example .env
```

All available settings are documented in the [Configuration](configuration.md) section. For now, you just need to set those:
* `DADLEX_PORT`: Set it to the HTTP port that you want the service to be available on, for instance `3000`
* `PACKAGE_VERSION`: This can be `latest` (default) for the latest stable release, `dev` for the latest snapshot or any version tag.
* `FRONTEND_PUBLIC_URL`: Set this to the public URL the app where will be reachable at in the end. Do _not_ include a trailing slash. Example: `http://localhost:3000` or `https://util.example.com/dadlex`
* `BACKEND_PUBLIC_URL`: For the pre-build docker images, this always needs to be set to `FRONTEND_PUBLIC URL` with `/backend` appended. Example: `http://localhost:3000/backend` or `https://util.example.com/dadlex/backend`

## Starting up

For starting the containers, you just need to run `docker-compose up -d`

:::tip That's it
DadleX is now up and running and is reachable on the port you've specified
:::

## Additional commands

You can stop all of the containers by running `docker-compose down` in the directory.

Log files can be viewed by running `docker-compose logs`