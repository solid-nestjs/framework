# SNEST CLI

Official CLI tool for the SOLID NestJS Framework.

## Installation

```bash
# Install globally
npm install -g @solid-nestjs/snest-cli

# Or use npx (recommended)
npx @solid-nestjs/snest-cli
```

## Usage

### Create a new project

```bash
snest new my-project
```

### Generate components

```bash
# Interactive mode (recommended)
snest generate --interactive

# Generate complete resource
snest generate resource Product --fields "name:string,price:number"

# Generate individual components
snest generate entity Product
snest generate service Products
snest generate controller Products
snest generate dto Products
snest generate module Products
```

### Options

#### Project Creation
- `--package-manager`: npm, yarn, or pnpm (default: npm)
- `--database`: sqlite, postgres, mysql, or mssql (default: sqlite)
- `--type`: rest, graphql, or hybrid (default: hybrid)
- `--skip-install`: Skip package installation
- `--skip-git`: Skip git initialization

#### Code Generation
- `--type`: API type (rest, graphql, hybrid)
- `--path`: Custom output path
- `--with-tests`: Generate test files
- `--overwrite`: Overwrite existing files

## Features

- **Context-aware generation**: Detects project dependencies and offers relevant options
- **SOLID decorators**: Generates code using framework's unified decorators
- **Args helpers**: Automatic DTO generation with advanced filtering and sorting
- **Multi-database support**: Works with PostgreSQL, MySQL, SQL Server, and SQLite
- **Interactive mode**: Guided generation with intelligent suggestions

## Development

```bash
# Install dependencies
npm install

# Build the CLI
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Link locally for testing
npm link
```

## Version

Current version: 0.3.0-alpha.1

## License

MIT