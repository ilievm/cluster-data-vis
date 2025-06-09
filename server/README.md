# Test task code repo

Test application that broadcast datapoints (randomly generated) from "server" service, and receives them on the front-end side in the "web-client"

## Usage

This application needs 2 services to run: server and web-client

go to the server and run

```sh
npm run dev
```
The service on the port :3333 should start

## Details




You can create a new app using the `api` boilerplate by executing the following command. The command will perform the following steps.

- Clone the repo
- Install dependencies
- Copy `.env.example` to `.env`
- Set app key using `node ace generate:key` command.
- Configure `@adonisjs/lucid` package.
- Install and configure `@adonisjs/session` package (if using auth session guard).
- Configure `@adonisjs/auth` package.

```sh
npm init adonisjs -- -K=api
```

### Configuring Lucid database dialect

By default, the `npm init adonisjs` command configures Lucid to use `sqlite`. However, you can define a custom database dialect as follows.

```sh
npm init adonisjs -- -K=api --db=postgres
```

Available options for the `--db` flag.

- sqlite
- postgres
- mysql
- mssql

### Configuring Auth package guard

By default, the `npm init adonisjs` command configures the Auth package to use `session` guard. However, you can define a custom auth guard as follows.

```sh
npm init adonisjs -- -K=api --auth-guard=access_tokens
```

Available options for the `--auth-guard` flag.

- session
- basic_auth
- access_tokens
