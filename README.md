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

The easiest way to install Secret-Santa-Ultimate is with the [docker image](https://hub.docker.com/r/pacopening/secret-santa-ultimate).
Once docker installed you can run this command
```bash
docker run
        -d pacopening/secret-santa-ultimate:latest
        -p 3000:3000
        -v YOUR_VOLUME:/app/data
        -e EMAIL_ADDRESS="email@server.com"
        -e EMAIL_PASSWORD="password"
        -e EMAIL_SMTP="smtp.gmail.com"
        -e EMAIL_PORT="465"
```

or with docker-compose
```yaml
services:
  secret-santa:
    image: pacopening/secret-santa-ultimate:latest
    ports:
      - "3000:3000"
    environment:
      - EMAIL_ADDRESS="email@server.com"
      - EMAIL_PASSWORD="password"
      - EMAIL_SMTP="smtp.gmail.com"
      - EMAIL_PORT="465"
    volumes:
      - database:/data
  
volumes:
  database:
```