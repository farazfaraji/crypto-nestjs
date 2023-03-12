## Description

An application to receive regular updates over email with the latest currency quotes for a given cryptocurrency.

## Installation

```bash
$ npm install
```

## Running the app

Note: you should copy `.env.example` to `.env` and provide requirements.

```bash
cp .env.example .env
```

before run the application, you need to run the docker-compose

```bash
docker-compose up -d
```

To run the application:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Document

After run the application, swagger is reachable on `localhost:3000/api`

## Consult

On case of having a lot of users and bottleneck on sending email, you can easily increase the worker of BullMq
