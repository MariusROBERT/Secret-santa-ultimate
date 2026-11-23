# Secret Santa Ultimate

This project is a simple web version of a Secret Santa for friends, family or coworkers.

The goal is to create a Secret Santa, chose a mail date and share the link to everyone
so they can register and join your secret santa. 

There's no accounts, login or admin as it would make the project prettier heavier, harder to dev, to maintain and not that useful.
For me, most of the secret santa are meant to be done with trust people so no need to have an admin.

### Target selection

Targets are selected randomly with only 2 rules:
- You can't gift your gifter
- You can manually set a list of person that you will not be able to gift

The second option is here if you want specific rules
eg: couples can't gift their spouse, you can't gift the same person that last year, or you maybe just don't like someone

If you have set too much rules (eg: someone can't gift anyone), the mail just won't be sent, you will not have any warning.

Once the mail has been sent, you can't add, remove or edit people.

### Installation

Secret Santa Ultimate runs on port `3000` inside the container. It stores its SQLite database in `/app/data`, so keep that directory on a persistent Docker volume.

Before starting the app, create a private environment file from the example and add your SMTP provider's settings:

```bash
cp .env.example .env
chmod 600 .env
```

Set these variables in `.env` (their names match the application):

| Variable | Meaning |
| --- | --- |
| `EMAIL_ADDRESS` | SMTP account email address; also used as the sender address |
| `EMAIL_PASSWORD` | SMTP password or provider-issued app password |
| `EMAIL_SMTP` | SMTP server hostname, such as `smtp.example.com` |
| `EMAIL_PORT` | SMTP port; `465` uses a secure connection, other ports use STARTTLS when supported |

Do not commit `.env` or put real credentials in the README or Compose file. `.env` is ignored by Git; `.env.example` contains placeholders only. Use an app password when your provider supports it.

#### Docker Compose

From the repository directory, Compose builds the Docker image and reads the SMTP values from `.env`:

```bash
docker compose up -d --build
```

Open [http://localhost:3002](http://localhost:3002). The included `docker-compose.yml` publishes host port `3002` to the app's container port `3000` and stores SQLite data in the named `santa-db` volume mounted at `/app/data`.

#### Docker image

To run the published [Docker image](https://hub.docker.com/r/pacopening/secret-santa-ultimate) instead of building from the repository:

```bash
docker run -d \
  --name secret-santa \
  --restart unless-stopped \
  -p 3000:3000 \
  --mount source=secret-santa-data,target=/app/data \
  --env-file .env \
  pacopening/secret-santa-ultimate:latest
```

Open [http://localhost:3000](http://localhost:3000). The named `secret-santa-data` volume keeps events when the container is restarted, replaced, or removed. In Compose, `docker compose restart` restarts the app without deleting its `santa-db` volume; `docker compose down` also preserves it. Do not use `docker compose down -v` or remove the named volume unless you intend to delete the events. Configure `.env` before starting either deployment so scheduled email delivery has the required SMTP credentials.
