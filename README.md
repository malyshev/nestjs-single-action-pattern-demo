# Single Action Controller Pattern in NestJS

## 📖 Description

Large NestJS projects often start small but quickly grow into God Controllers and God Services — bloated classes with dozens of methods, tangled dependencies, and tests that take forever to set up.
This repo shows exactly how to escape that trap with the Single Action Controller pattern — a lightweight architectural approach where each controller and service handles exactly one action.

The result?
- Minimal dependencies per class
- Tests that are simple and fast to write
- Code that’s easy to read, modify, and extend

## 📚What’s Inside

This project is a side-by-side architectural A/B test: two modules implement the same functionality, but with radically different approaches.
- Users Module → Traditional monolithic pattern
- Customers Module → Modern Single Action pattern

You can run both, inspect the code, compare complexity, and see first-hand how architecture impacts maintainability, testability, and scalability.

Each module implements the same functionality (CRUD operations, email confirmation, account management, search) but with different architectural patterns, allowing you to compare the complexity, maintainability, and testing approaches.

### Users Module - "Bad Practice" Example
The `src/users/` module demonstrates traditional monolithic controller/service patterns and their associated problems:

- **Monolithic Controller**: 10 endpoints in a single controller
- **Monolithic Service**: 10 business methods with 5 dependencies
- **Injection Hell**: Multiple cross-cutting concerns (audit, analytics, mailing, notifications)
- **Complex Testing**: 87 tests required for comprehensive coverage
- **Cascading Failures**: Single service failure breaks entire operations

📖 **[Read the detailed Users Module README](src/users/README.md)** for an in-depth analysis of pain points, testing challenges, and complexity metrics.

This module serves as a "what not to do" example, highlighting the problems that the Single Action Pattern solves.

### Customers Module - "Good Practice" Example
The `src/customers/` module demonstrates the Single Action Pattern and its benefits:

- **Single Action Controllers**: 10 controllers, each handling exactly one endpoint
- **Single Action Services**: 10 services, each implementing exactly one business method
- **Minimal Dependencies**: Each service only depends on what it actually uses
- **Simple Testing**: 40 focused test files with minimal mock setup
- **Graceful Degradation**: Core functionality works even if cross-cutting concerns fail

📖 **[Read the detailed Customers Module README](src/customers/README.md)** for an in-depth analysis of benefits, testing advantages, and best practices.

This module serves as a "what to do" example, demonstrating the simplicity, maintainability, and scalability of the Single Action Pattern.

## 🆚 Summary Comparison

| Aspect | Monolithic Pattern (Users) | Single Action Pattern (Customers) |
|--------|---------------------------|-----------------------------------|
| **Controllers** | 1 controller, 10 endpoints | 10 controllers, 1 endpoint each |
| **Services** | 1 service, 10 methods | 10 services, 1 method each |
| **Dependencies per Class** | 5 services (always) | 1-5 services (as needed) |
| **Total Tests** | 87 tests, complex setup | 40 tests, simple setup |
| **Mock Complexity** | 20+ mock methods per test | 1-5 mock methods per test |
| **Error Handling** | Cascading failures | Isolated failures |
| **Maintainability** | Difficult to change | Easy to modify |
| **Testing** | Complex setup, many edge cases | Simple setup, focused tests |
| **Reliability** | Multiple failure points | Single failure points |
| **Scalability** | Hard to extend | Easy to extend |
| **Code Complexity** | High (10 methods, 5 deps) | Low (1 method, 1-5 deps) |
| **Cyclomatic Complexity** | ~50 (10 methods × 5 deps) | ~15 (10 methods × 1.5 avg deps) |
| **Test Setup Time** | 30-60 seconds per test | 5-15 seconds per test |
| **Mock Configuration** | 20+ lines per test | 3-8 lines per test |
| **Failure Isolation** | Poor (1 failure breaks all) | Excellent (failures isolated) |
| **Code Reusability** | Low (tightly coupled) | High (loosely coupled) |
| **Debugging Complexity** | High (multiple concerns) | Low (single concern) |
| **Onboarding Time** | Weeks (complex patterns) | Days (simple patterns) |
| **Refactoring Cost** | High (affects multiple areas) | Low (isolated changes) |
| **Performance Impact** | Higher (unused deps loaded) | Lower (only needed deps) |

## 🎯 Who Should Use This Repo
- Junior developers — Learn maintainable architecture early
- Senior developers — Introduce scalable patterns into large codebases
- Tech leads — Evaluate patterns for long-term projects
- QA engineers — See how architecture affects testability

## 💡 Why It Matters

The Single Action Controller pattern isn’t just a coding style — it’s a way to:
- Reduce cyclomatic complexity
- Limit dependency sprawl
- Speed up test execution
- Make onboarding faster for new team members
- Isolate failures so one broken feature doesn’t take down your app

## ⚙️ Project setup

```bash
$ yarn install
```

## 🚀 Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## 🧪 Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## 📖 Related Article

📖 **[Read the full article: "Breaking Up with Fat Controllers: Single-Action Controllers & Services in NestJS"](https://medium.com/javascript-in-plain-english/breaking-up-with-fat-controllers-single-action-controllers-services-in-nestjs-9355ec3444d3)** - Learn about the problems with traditional monolithic controllers and how the Single Action Pattern solves them.

## 📞 Stay in touch

- Author - [Serhii Malyshev](https://medium.com/@s_malyshev)


## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
