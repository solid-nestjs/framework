# Contributing to SOLID NestJS Framework

We love your input! We want to make contributing to SOLID NestJS Framework as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/solid-nestjs-framework.git
cd solid-nestjs-framework

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test

# Start the example application
cd examples/simple-crud-test
npm run start:dev
```

## Project Structure

```
framework/
├── packages/
│   ├── common/          # Common utilities and interfaces
│   ├── typeorm/         # TypeORM-specific implementations
│   └── rest-api/        # REST API utilities
├── examples/
│   └── simple-crud-test/ # Example application
└── docs/                # Documentation
```

## Package Development

The framework is organized as a monorepo with multiple packages:

### @solid-nestjs/common

Contains shared interfaces, types, and utilities used across all packages.

### @solid-nestjs/typeorm

Contains TypeORM-specific service implementations and decorators.

### @solid-nestjs/rest-api

Contains REST API controller implementations and Swagger utilities.

## Testing

We use Jest for testing. Please ensure all tests pass before submitting a PR:

```bash
# Run all tests
npm run test

# Run tests for a specific package
cd packages/typeorm
npm test

# Run tests in watch mode
npm run test:watch
```

## Coding Standards

### TypeScript

- Use TypeScript for all code
- Follow strict type checking
- Document public APIs with JSDoc comments
- Use meaningful variable and function names

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add new filtering capability
fix: resolve pagination issue with relations
docs: update API documentation
test: add unit tests for CrudService
refactor: improve query builder performance
```

## Adding New Features

### Before You Start

1. Check existing issues and PRs to avoid duplication
2. Create an issue to discuss the feature with maintainers
3. Wait for approval before starting development

### Feature Development Process

1. **Create a branch**: `git checkout -b feature/your-feature-name`
2. **Implement the feature**: Follow existing patterns and conventions
3. **Add tests**: Ensure good test coverage
4. **Update documentation**: Add or update relevant documentation
5. **Test thoroughly**: Run the test suite and manual testing
6. **Submit PR**: Create a pull request with a clear description

## Documentation

### API Documentation

- Update JSDoc comments for public APIs
- Ensure TypeScript types are properly documented
- Add examples for complex features

### User Documentation

- Update README.md for new features
- Add examples to the examples directory
- Create or update relevant guide documents

## Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/solid-nestjs/framework/issues/new).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We use GitHub issues to track feature requests. Request a feature by [opening a new issue](https://github.com/solid-nestjs/framework/issues/new) with the "feature request" label.

**Great Feature Requests** include:

- Clear description of the problem the feature would solve
- Detailed explanation of the proposed solution
- Examples of how the feature would be used
- Any alternative solutions you've considered

## Releasing

Releases are handled by maintainers. The process involves:

1. Update version numbers in package.json files
2. Update CHANGELOG.md
3. Create a git tag
4. Publish to npm
5. Create a GitHub release

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

We are committed to providing a friendly, safe and welcoming environment for all, regardless of level of experience, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, nationality, or other similar characteristic.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Questions?

Feel free to open an issue or contact the maintainers directly if you have any questions about contributing.

Thank you for contributing to SOLID NestJS Framework! 🚀
