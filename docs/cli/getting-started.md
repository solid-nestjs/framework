# Getting Started with SNEST CLI

This guide will help you get started with the SNEST CLI tool for generating SOLID NestJS applications and components.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 8.0.0 or higher) or **yarn** (version 1.22.0 or higher)
- **Git** (for project initialization)

## Installation

### Global Installation (Recommended)

Install the SNEST CLI globally to use it from anywhere:

```bash
npm install -g @solid-nestjs/cli
```

Verify the installation:

```bash
snest --version
# Output: 0.3.0-alpha.1
```

### Local Installation

For project-specific installation:

```bash
npm install --save-dev @solid-nestjs/cli
```

Use with npx:

```bash
npx snest --help
```

## Your First Project

### Create a New Project

Create your first SOLID NestJS project:

```bash
snest new my-first-app
```

This creates a complete project structure with:

- 📁 **src/** - Source code directory
- 📁 **src/entities/** - Database entities
- 📁 **src/services/** - Business logic services
- 📁 **src/controllers/** - API controllers
- 📁 **src/modules/** - NestJS modules
- 📁 **src/dto/** - Data Transfer Objects
- 📄 **package.json** - Project dependencies
- 📄 **tsconfig.json** - TypeScript configuration
- 📄 **README.md** - Project documentation

### Navigate to Your Project

```bash
cd my-first-app
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run start:dev
```

Your SOLID NestJS application is now running at `http://localhost:3000`!

## Your First Components

### Generate an Entity

Create your first database entity:

```bash
snest generate entity User --fields "name:string,email:string,age:number"
```

This generates a `User` entity with SOLID decorators:

```typescript
// src/entities/user.entity.ts
import { SolidEntity, SolidId, SolidField } from '@solid-nestjs/common';

@SolidEntity()
export class User {
  @SolidId()
  id: number;

  @SolidField({ type: 'varchar' })
  name: string;

  @SolidField({ type: 'varchar' })
  email: string;

  @SolidField({ type: 'integer' })
  age: number;
}
```

### Generate a Service

Create a service to handle User operations:

```bash
snest generate service Users --entity-name User --with-bulk-operations
```

This generates a CRUD service:

```typescript
// src/services/users.service.ts
import { Injectable } from '@nestjs/common';
import { CrudServiceFrom, CrudServiceStructure } from '@solid-nestjs/typeorm';
import { User } from '../entities/user.entity';

export const usersServiceStructure = CrudServiceStructure({
  entityType: User,
  createInputType: CreateUsersDto,
  updateInputType: UpdateUsersDto,
  enableBulkOperations: true,
});

@Injectable()
export class UsersService extends CrudServiceFrom(usersServiceStructure) {
  // Custom business logic methods can be added here
}
```

### Generate a Controller

Create a REST API controller:

```bash
snest generate controller Users --entity-name User --service-name Users --with-validation
```

This generates a REST controller with automatic CRUD endpoints:

```typescript
// src/controllers/users.controller.ts
import { Controller } from '@nestjs/common';
import {
  CrudControllerFrom,
  CrudControllerStructure,
} from '@solid-nestjs/rest-api';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';

export const usersControllerStructure = CrudControllerStructure({
  entityType: User,
  serviceType: UsersService,
  createInputType: CreateUsersDto,
  updateInputType: UpdateUsersDto,
  operations: {
    findAll: true,
    findOne: true,
    create: true,
    update: true,
    remove: true,
    bulkCreate: true,
    bulkUpdate: true,
    bulkRemove: true,
  },
});

@Controller('users')
export class UsersController extends CrudControllerFrom(
  usersControllerStructure,
) {
  // Custom endpoints can be added here
}
```

### Generate a Module

Create a module to organize your components:

```bash
snest generate module Users --entities "User" --services "Users" --controllers "Users"
```

This generates a complete NestJS module:

```typescript
// src/modules/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { UsersController } from '../controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
```

## Automatic Module Updates

Notice that when you generated the service and controller, the CLI automatically updated existing modules! This is the **AST-based module updating system** in action.

The CLI:

- ✅ Found relevant modules in your project
- ✅ Added necessary import statements
- ✅ Updated the module's arrays (providers, controllers, etc.)
- ✅ Preserved your existing code format

You can see this in action by checking the output:

```bash
✓ Service 'Users' generated successfully

📋 Next steps:
  1. ✅ Automatically updated 1 module(s)
  2. Register the service in your module providers
  3. Import the User entity in your TypeORM module
  4. Add validation DTOs if not already present
```

## Interactive Mode

For a guided experience, use the interactive mode:

```bash
snest generate interactive
```

This launches a step-by-step wizard:

```
🔍 SOLID NestJS Interactive Generator

? What would you like to generate? (Use arrow keys)
❯ Entity - Database entity with SOLID decorators
  Service - CRUD service with operations
  Controller - REST API controller
  Module - NestJS module

? Entity name: Product
? Entity fields: name:string,price:number,description:string:optional
? Enable soft deletion? No
? Use SOLID decorators? Yes
? Output path: (leave empty for default)

✓ Entity 'Product' generated successfully
```

## Available API Endpoints

After generating your User components, your API automatically includes these endpoints:

### User Endpoints

- **GET** `/users` - Get all users
- **GET** `/users/:id` - Get user by ID
- **POST** `/users` - Create new user
- **PATCH** `/users/:id` - Update user
- **DELETE** `/users/:id` - Delete user

### Bulk Operations (if enabled)

- **POST** `/users/bulk` - Create multiple users
- **PATCH** `/users/bulk` - Update multiple users
- **DELETE** `/users/bulk` - Delete multiple users

### API Documentation

Your API automatically includes Swagger documentation at:

- **Swagger UI:** `http://localhost:3000/api`
- **OpenAPI JSON:** `http://localhost:3000/api-json`

## Advanced Options

### Custom Database Configuration

Create a project with specific database:

```bash
# PostgreSQL
snest new my-app --database postgres

# MySQL
snest new my-app --database mysql

# SQL Server
snest new my-app --database mssql
```

### API Types

Choose your API architecture:

```bash
# REST only
snest new my-app --type rest

# GraphQL only
snest new my-app --type graphql

# Hybrid (REST + GraphQL)
snest new my-app --type hybrid
```

### Advanced Entity Features

```bash
# Entity with soft deletion
snest generate entity Product --fields "name:string,price:number" --with-soft-delete

# Entity with custom path
snest generate entity Order --fields "total:number,status:string" --path "src/domain/entities"
```

### Advanced Service Features

```bash
# Service with relations
snest generate service Products --entity-name Product --relations "category:manyToOne:Category:eager"

# Service with Args helpers for advanced querying
snest generate service Users --entity-name User --with-args-helpers
```

### Skip Auto-Updates

If you prefer manual module management:

```bash
snest generate service Products --entity-name Product --skip-module-update
```

## Project Structure

After generating components, your project structure looks like:

```
my-first-app/
├── src/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── services/
│   │   └── users.service.ts
│   ├── controllers/
│   │   └── users.controller.ts
│   ├── modules/
│   │   └── users.module.ts
│   ├── dto/
│   │   ├── args/
│   │   └── inputs/
│   ├── app.module.ts
│   └── main.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Next Steps

Now that you have the basics down:

1. **Explore Templates** - Learn about customizing code generation templates
2. **Advanced Features** - Dive into bulk operations, soft deletion, and relations
3. **GraphQL Support** - Try generating GraphQL resolvers and schemas
4. **Production Deployment** - Learn about building and deploying your app
5. **Testing** - Add unit and integration tests to your generated components

## Common Patterns

### E-commerce Application

```bash
# Create project
snest new ecommerce-api --database postgres --type hybrid

# Generate core entities
snest g entity User --fields "email:string,password:string,role:string"
snest g entity Product --fields "name:string,price:number,stock:number" --with-soft-delete
snest g entity Order --fields "userId:number,total:number,status:string" --with-soft-delete

# Generate services with advanced features
snest g service Users --entity-name User --with-args-helpers
snest g service Products --entity-name Product --with-bulk-operations --with-soft-delete
snest g service Orders --entity-name Order --with-bulk-operations

# Generate controllers with validation
snest g controller Users --entity-name User --with-guards
snest g controller Products --entity-name Product --with-validation
snest g controller Orders --entity-name Order --with-validation --with-guards

# Generate modules
snest g module Users --entities "User" --services "Users" --controllers "Users"
snest g module Products --entities "Product" --services "Products" --controllers "Products"
snest g module Orders --entities "Order" --services "Orders" --controllers "Orders"
```

### Blog Application

```bash
# Create project
snest new blog-api --database mysql --type rest

# Generate entities
snest g entity Author --fields "name:string,email:string,bio:string:optional"
snest g entity Post --fields "title:string,content:string,authorId:number,published:boolean" --with-soft-delete
snest g entity Comment --fields "content:string,postId:number,authorId:number"

# Generate services
snest g service Authors --entity-name Author
snest g service Posts --entity-name Post --with-soft-delete --relations "author:manyToOne:Author,comments:oneToMany:Comment"
snest g service Comments --entity-name Comment --relations "post:manyToOne:Post,author:manyToOne:Author"

# Generate controllers
snest g controller Authors --entity-name Author --with-validation
snest g controller Posts --entity-name Post --with-validation --with-soft-delete
snest g controller Comments --entity-name Comment --with-validation

# Generate modules
snest g module Blog --entities "Author,Post,Comment" --services "Authors,Posts,Comments" --controllers "Authors,Posts,Comments"
```

## Tips and Best Practices

### 1. Use Consistent Naming

- **Entities:** Singular, PascalCase (`User`, `Product`, `Order`)
- **Services:** Plural, PascalCase (`Users`, `Products`, `Orders`)
- **Controllers:** Plural, PascalCase (`Users`, `Products`, `Orders`)
- **Modules:** Descriptive, PascalCase (`Users`, `Products`, `Blog`)

### 2. Organize by Domain

For larger applications, organize by business domain:

```bash
# User domain
snest g entity User --path "src/user/entities"
snest g service Users --path "src/user/services"
snest g controller Users --path "src/user/controllers"
snest g module User --path "src/user"

# Product domain
snest g entity Product --path "src/product/entities"
snest g service Products --path "src/product/services"
snest g controller Products --path "src/product/controllers"
snest g module Product --path "src/product"
```

### 3. Use Feature Flags

Enable features based on your needs:

```bash
# For admin entities
snest g entity User --fields "email:string,role:string" --with-soft-delete

# For audit-heavy services
snest g service Users --entity-name User --with-args-helpers --with-bulk-operations

# For public APIs
snest g controller Users --entity-name User --with-validation --with-guards
```

### 4. Leverage Interactive Mode

Use interactive mode when:

- Learning the CLI
- Exploring options
- Generating complex components
- Unsure about configuration

```bash
snest g -i
```

## Troubleshooting

### Common Issues

**Q: "Command not found: snest"**
A: Install the CLI globally: `npm install -g @solid-nestjs/cli`

**Q: "Template not found" error**
A: Rebuild the CLI: `npm run build && cp -r src/templates/* dist/templates/`

**Q: "Module update failed"**
A: Use `--skip-module-update` flag or manually update modules

**Q: Generated files are empty**
A: Check file permissions and ensure you have write access to the directory

### Getting Help

- **CLI Help:** `snest --help`
- **Command Help:** `snest generate entity --help`
- **Issues:** [GitHub Issues](https://github.com/solid-nestjs/framework/issues)
- **Community:** [Discord](https://discord.gg/solid-nestjs)

## Conclusion

You're now ready to build amazing SOLID NestJS applications with the SNEST CLI! The tool will help you:

- 🚀 **Generate projects faster** with complete boilerplate
- 📝 **Write less code** with automatic generation
- 🔄 **Maintain consistency** across your codebase
- ⚡ **Focus on business logic** instead of setup

Happy coding! 🎉
