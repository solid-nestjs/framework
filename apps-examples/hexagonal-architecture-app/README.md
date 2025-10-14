# Hexagonalarchitectureapp

A SOLID NestJS application built with TypeScript.

## Description

This project was generated using the SOLID NestJS CLI. It includes:

- REST API with Swagger documentation
- GraphQL API with playground
- TypeORM integration with SQLITE
- SOLID decorators for reduced boilerplate
- Automatic CRUD generation capabilities

## Installation

```bash
$ npm install
```

## Running the app

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

## API Documentation

- Swagger UI: http://localhost:3000/api
- GraphQL Playground: http://localhost:3000/graphql

## Development

To generate new resources using the SOLID NestJS CLI:

```bash
# Generate complete resource (entity, service, controller, DTOs)
$ snest generate resource Product --fields "name:string,price:number"

# Generate individual components
$ snest generate entity Product
$ snest generate service Products
$ snest generate controller Products

# Interactive mode
$ snest generate --interactive
```

## License

This project is [MIT licensed](LICENSE).
