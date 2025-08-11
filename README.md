
## Description

A practical example of the Single Action Controller pattern in NestJS — a lightweight architectural approach where each controller and service handles exactly one action. This keeps dependencies minimal, tests simple, and maintenance effortless. Perfect for teams aiming for clean, decoupled, and highly testable backend code.

## Modules

### Users Module - "Bad Practice" Example
The `src/users/` module demonstrates traditional monolithic controller/service patterns and their associated problems:

- **Monolithic Controller**: 10 endpoints in a single controller
- **Monolithic Service**: 10 business methods with 5 dependencies
- **Injection Hell**: Multiple cross-cutting concerns (audit, analytics, mailing, notifications)
- **Complex Testing**: 87 tests required for comprehensive coverage
- **Cascading Failures**: Single service failure breaks entire operations

📖 **[Read the detailed Users Module README](src/users/README.md)** for an in-depth analysis of pain points, testing challenges, and complexity metrics.

This module serves as a "what not to do" example, highlighting the problems that the Single Action Pattern solves.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Stay in touch

- Author - [Serhii Malyshev](https://medium.com/@s_malyshev)


## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
