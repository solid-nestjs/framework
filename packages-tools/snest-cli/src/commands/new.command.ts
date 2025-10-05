import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import validateNpmPackageName from 'validate-npm-package-name';
import { BaseCommand } from './base.command';
import { CommandResult } from '../types';
import { fileExists, writeFile, ensureDirectory } from '../utils/file-utils';
import { createNameVariations } from '../utils/string-utils';

interface NewCommandOptions {
  packageManager: 'npm' | 'yarn' | 'pnpm';
  database: 'sqlite' | 'postgres' | 'mysql' | 'mssql';
  type: 'rest' | 'graphql' | 'hybrid';
  skipInstall: boolean;
  skipGit: boolean;
  resourceFolder: string;
}

/**
 * Command to create a new SOLID NestJS project
 */
export class NewCommand extends BaseCommand {
  register(program: Command): void {
    program
      .command('new <project-name>')
      .description('Create a new SOLID NestJS project')
      .option(
        '-p, --package-manager <manager>',
        'Package manager to use (npm, yarn, pnpm)',
        this.config.defaultPackageManager,
      )
      .option(
        '-d, --database <type>',
        'Database type (sqlite, postgres, mysql, mssql)',
        this.config.defaultDatabase,
      )
      .option(
        '-t, --type <api-type>',
        'API type (rest, graphql, hybrid)',
        this.config.defaultApiType,
      )
      .option('--skip-install', 'Skip package installation', false)
      .option('--skip-git', 'Skip git initialization', false)
      .option(
        '--resource-folder <folder>',
        'Resource folder name (default: modules)',
        'modules',
      )
      .action(async (projectName: string, options: NewCommandOptions) => {
        await this.handleExecution(() => this.execute(projectName, options));
      });
  }

  async execute(
    projectName: string,
    options: NewCommandOptions,
  ): Promise<CommandResult> {
    // Validate project name
    const validationErrors = this.validateProjectName(projectName);
    if (validationErrors.length > 0) {
      return {
        success: false,
        message: 'Invalid project name',
        errors: validationErrors,
      };
    }

    const projectPath = path.resolve(process.cwd(), projectName);

    // Check if directory already exists
    if (await fileExists(projectPath)) {
      return {
        success: false,
        message: `Directory '${projectName}' already exists`,
      };
    }

    this.startSpinner(`Creating SOLID NestJS project '${projectName}'...`);

    try {
      const generatedFiles: string[] = [];

      // Create project directory
      await ensureDirectory(projectPath);

      // Generate project files
      const nameVariations = createNameVariations(projectName);

      // Generate package.json
      const packageJsonContent = this.generatePackageJson(
        nameVariations,
        options,
        projectName,
      );
      const packageJsonResult = await writeFile(
        path.join(projectPath, 'package.json'),
        packageJsonContent,
      );
      if (packageJsonResult.success) {
        generatedFiles.push(packageJsonResult.path);
      }

      // Generate tsconfig.json
      const tsconfigContent = this.generateTsConfig();
      const tsconfigResult = await writeFile(
        path.join(projectPath, 'tsconfig.json'),
        tsconfigContent,
      );
      if (tsconfigResult.success) {
        generatedFiles.push(tsconfigResult.path);
      }

      // Generate nest-cli.json
      const nestCliContent = this.generateNestCliConfig();
      const nestCliResult = await writeFile(
        path.join(projectPath, 'nest-cli.json'),
        nestCliContent,
      );
      if (nestCliResult.success) {
        generatedFiles.push(nestCliResult.path);
      }

      // Generate snest.config.json
      const snestConfigContent = this.generateSnestConfig(options);
      const snestConfigResult = await writeFile(
        path.join(projectPath, 'snest.config.json'),
        snestConfigContent,
      );
      if (snestConfigResult.success) {
        generatedFiles.push(snestConfigResult.path);
      }

      // Generate .env.example
      const envContent = this.generateEnvExample(options.database);
      const envResult = await writeFile(
        path.join(projectPath, '.env.example'),
        envContent,
      );
      if (envResult.success) {
        generatedFiles.push(envResult.path);
      }

      // Generate .gitignore
      const gitignoreContent = this.generateGitignore();
      const gitignoreResult = await writeFile(
        path.join(projectPath, '.gitignore'),
        gitignoreContent,
      );
      if (gitignoreResult.success) {
        generatedFiles.push(gitignoreResult.path);
      }

      // Generate docker-compose.yml for non-SQLite databases
      if (options.database !== 'sqlite') {
        const dockerComposeContent = this.generateDockerCompose(
          options.database,
        );
        const dockerComposeResult = await writeFile(
          path.join(projectPath, 'docker-compose.yml'),
          dockerComposeContent,
        );
        if (dockerComposeResult.success) {
          generatedFiles.push(dockerComposeResult.path);
        }
      }

      // Create src directory structure
      await this.createSrcStructure(
        projectPath,
        nameVariations,
        options,
        generatedFiles,
      );

      // Create README.md
      const readmeContent = this.generateReadme(nameVariations, options);
      const readmeResult = await writeFile(
        path.join(projectPath, 'README.md'),
        readmeContent,
      );
      if (readmeResult.success) {
        generatedFiles.push(readmeResult.path);
      }

      this.succeedSpinner(`Project '${projectName}' created successfully!`);

      // Install dependencies
      if (!options.skipInstall) {
        await this.installDependencies(projectPath, options.packageManager);
      }

      // Initialize git
      if (!options.skipGit) {
        await this.initializeGit(projectPath);
      }

      // Show next steps
      this.showNextSteps(projectName, options);

      return {
        success: true,
        message: `Project '${projectName}' created successfully`,
        generatedFiles: generatedFiles.map(file =>
          path.relative(process.cwd(), file),
        ),
      };
    } catch (error) {
      this.failSpinner('Failed to create project');
      throw error;
    }
  }

  private validateProjectName(name: string): string[] {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Project name is required');
      return errors;
    }

    const validation = validateNpmPackageName(name);
    if (!validation.validForNewPackages) {
      if (validation.errors) {
        errors.push(...validation.errors);
      }
      if (validation.warnings) {
        errors.push(...validation.warnings);
      }
    }

    return errors;
  }

  private generatePackageJson(
    nameVariations: any,
    options: NewCommandOptions,
    projectName: string,
  ): string {
    const dependencies = this.getDependencies(options);
    const devDependencies = this.getDevDependencies(options);

    const packageJson = {
      name: projectName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''),
      version: '0.0.1',
      description: 'A SOLID NestJS application',
      author: '',
      private: true,
      license: 'MIT',
      scripts: {
        build: 'nest build',
        format: 'prettier --write "src/**/*.ts" "test/**/*.ts"',
        start: 'nest start',
        'start:dev': 'nest start --watch',
        'start:debug': 'nest start --debug --watch',
        'start:prod': 'node dist/main',
        lint: 'eslint "{src,apps,libs,test}/**/*.ts" --fix',
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:cov': 'jest --coverage',
        'test:debug':
          'node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand',
        'test:e2e': 'jest --config ./test/jest-e2e.json',
      },
      dependencies,
      devDependencies,
      jest: {
        moduleFileExtensions: ['js', 'json', 'ts'],
        rootDir: 'src',
        testRegex: '.*\\.spec\\.ts$',
        transform: {
          '^.+\\.(t|j)s$': 'ts-jest',
        },
        collectCoverageFrom: ['**/*.(t|j)s'],
        coverageDirectory: '../coverage',
        testEnvironment: 'node',
      },
    };

    return JSON.stringify(packageJson, null, 2);
  }

  private getDependencies(options: NewCommandOptions): Record<string, string> {
    const base: Record<string, string> = {
      '@nestjs/common': '^11.0.1',
      '@nestjs/core': '^11.0.1',
      '@nestjs/platform-express': '^11.0.1',
      '@nestjs/typeorm': '^11.0.0',
      '@nestjs/config': '^4.0.0',
      'class-transformer': '^0.5.1',
      'class-validator': '^0.14.1',
      dotenv: '^16.4.7',
      typeorm: '^0.3.22',
      'reflect-metadata': '^0.2.2',
      rxjs: '^7.8.1',
      multer: '^2.0.1',
    };

    // Add database driver
    switch (options.database) {
      case 'postgres':
        base['pg'] = '^8.11.3';
        base['@types/pg'] = '^8.10.2';
        break;
      case 'mysql':
        base['mysql2'] = '^3.6.0';
        break;
      case 'mssql':
        base['mssql'] = '^9.1.1';
        base['@types/mssql'] = '^8.1.2';
        break;
      case 'sqlite':
        base['sqlite3'] = '^5.1.7';
        break;
    }

    // Add API-specific bundle dependencies
    switch (options.type) {
      case 'rest':
        base['@nestjs/swagger'] = '^11.1.4';
        base['@solid-nestjs/typeorm-crud'] = '^0.2.9';
        break;

      case 'graphql':
        base['@nestjs/graphql'] = '^13.1.0';
        base['@nestjs/apollo'] = '13.1.0';
        base['@apollo/server'] = '^4.12.1';
        base['graphql'] = '^16.11.0';
        base['@solid-nestjs/typeorm-graphql-crud'] = '^0.2.9';
        break;

      case 'hybrid':
        base['@nestjs/swagger'] = '^11.1.4';
        base['@nestjs/graphql'] = '^13.1.0';
        base['@nestjs/apollo'] = '13.1.0';
        base['@apollo/server'] = '^4.12.1';
        base['graphql'] = '^16.11.0';
        base['@solid-nestjs/typeorm-hybrid-crud'] = '^0.2.9';
        break;
    }

    return base;
  }

  private getDevDependencies(
    options: NewCommandOptions,
  ): Record<string, string> {
    return {
      '@eslint/eslintrc': '^3.2.0',
      '@eslint/js': '^9.18.0',
      '@nestjs/cli': '^11.0.0',
      '@nestjs/schematics': '^11.0.0',
      '@nestjs/testing': '^11.0.1',
      '@swc/cli': '^0.6.0',
      '@swc/core': '^1.10.7',
      '@types/express': '^5.0.0',
      '@types/jest': '^29.5.14',
      '@types/node': '^22.10.7',
      '@types/supertest': '^6.0.2',
      eslint: '^9.18.0',
      'eslint-config-prettier': '^10.0.1',
      'eslint-plugin-prettier': '^5.2.2',
      globals: '^15.14.0',
      jest: '^29.7.0',
      multer: '^2.0.1',
      prettier: '^3.4.2',
      'source-map-support': '^0.5.21',
      supertest: '^7.0.0',
      'ts-jest': '^29.2.5',
      'ts-loader': '^9.5.2',
      'ts-node': '^10.9.2',
      'tsconfig-paths': '^4.2.0',
      'typescript-eslint': '^8.20.0',
      typescript: '^5.7.3',
    };
  }

  private generateTsConfig(): string {
    const tsconfig = {
      compilerOptions: {
        module: 'commonjs',
        declaration: true,
        removeComments: true,
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        allowSyntheticDefaultImports: true,
        target: 'ES2021',
        sourceMap: true,
        outDir: './dist',
        baseUrl: './src',
        incremental: true,
        skipLibCheck: true,
        strictNullChecks: false,
        noImplicitAny: false,
        strictBindCallApply: false,
        forceConsistentCasingInFileNames: false,
        noFallthroughCasesInSwitch: false,
      },
    };

    return JSON.stringify(tsconfig, null, 2);
  }

  private generateNestCliConfig(): string {
    const nestCli = {
      $schema: 'https://json.schemastore.org/nest-cli',
      collection: '@nestjs/schematics',
      sourceRoot: 'src',
      compilerOptions: {
        deleteOutDir: true,
      },
    };

    return JSON.stringify(nestCli, null, 2);
  }

  private generateEnvExample(database: string): string {
    const envVars = [
      '# Application',
      'NODE_ENV=development',
      'PORT=3000',
      '',
      '# Database',
    ];

    switch (database) {
      case 'postgres':
        envVars.push(
          'DB_TYPE=postgres',
          'DB_HOST=localhost',
          'DB_PORT=5432',
          'DB_USERNAME=postgres',
          'DB_PASSWORD=password',
          'DB_DATABASE=solid_nestjs_dev',
        );
        break;
      case 'mysql':
        envVars.push(
          'DB_TYPE=mysql',
          'DB_HOST=localhost',
          'DB_PORT=3306',
          'DB_USERNAME=mysqluser',
          'DB_PASSWORD=password',
          'DB_DATABASE=solid_nestjs_dev',
        );
        break;
      case 'mssql':
        envVars.push(
          'DB_TYPE=mssql',
          'DB_HOST=localhost',
          'DB_PORT=1433',
          'DB_USERNAME=sa',
          'DB_PASSWORD=Password123!',
          'DB_DATABASE=solid_nestjs_dev',
          '',
          '# MSSQL specific options',
          'DB_ENCRYPT=false',
          'DB_TRUST_SERVER_CERTIFICATE=true',
        );
        break;
      case 'sqlite':
        envVars.push('DB_TYPE=sqlite', 'DB_DATABASE=database.sqlite');
        break;
    }

    return envVars.join('\n');
  }

  private generateGitignore(): string {
    return `# compiled output
/dist
/node_modules

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# temp
.temp
.tmp

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
*.lcov

# Database
*.sqlite
*.db
database/

# Backup files
*.backup.*
`;
  }

  private generateDockerCompose(database: string): string {
    const services: Record<string, any> = {};

    switch (database) {
      case 'postgres':
        services.postgres = {
          image: 'postgres:15-alpine',
          container_name: 'solid-nestjs-postgres',
          restart: 'unless-stopped',
          environment: {
            POSTGRES_USER: '${DB_USERNAME}',
            POSTGRES_PASSWORD: '${DB_PASSWORD}',
            POSTGRES_DB: '${DB_DATABASE}',
          },
          ports: ['${DB_PORT}:5432'],
          volumes: ['./database/postgres:/var/lib/postgresql/data'],
          healthcheck: {
            test: [
              'CMD-SHELL',
              'pg_isready -U ${DB_USERNAME} -d ${DB_DATABASE}',
            ],
            interval: '10s',
            timeout: '5s',
            retries: 5,
          },
        };
        break;

      case 'mysql':
        services.mysql = {
          image: 'mysql:8.0',
          container_name: 'solid-nestjs-mysql',
          restart: 'unless-stopped',
          environment: {
            MYSQL_ROOT_PASSWORD: '${DB_PASSWORD}',
            MYSQL_DATABASE: '${DB_DATABASE}',
            MYSQL_USER: '${DB_USERNAME}',
            MYSQL_PASSWORD: '${DB_PASSWORD}',
          },
          ports: ['${DB_PORT}:3306'],
          volumes: ['./database/mysql:/var/lib/mysql'],
          command: '--default-authentication-plugin=mysql_native_password',
          healthcheck: {
            test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost'],
            interval: '10s',
            timeout: '5s',
            retries: 5,
          },
        };
        break;

      case 'mssql':
        services.mssql = {
          image: 'mcr.microsoft.com/mssql/server:2019-latest',
          container_name: 'solid-nestjs-mssql',
          restart: 'unless-stopped',
          environment: {
            ACCEPT_EULA: 'Y',
            MSSQL_SA_PASSWORD: '${DB_PASSWORD}',
            MSSQL_PID: 'Express',
            MSSQL_DATABASE: '${DB_DATABASE}',
          },
          ports: ['${DB_PORT}:1433'],
          volumes: ['./database/mssql:/var/opt/mssql'],
          healthcheck: {
            test: [
              'CMD-SHELL',
              '/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${DB_PASSWORD} -d ${DB_DATABASE} -Q "SELECT 1"',
            ],
            interval: '10s',
            timeout: '5s',
            retries: 5,
          },
        };
        break;
    }

    const dockerCompose = {
      version: '3.8',
      services,
    };

    return `version: '3.8'

services:
${
  database === 'postgres'
    ? `  postgres:
    image: postgres:15-alpine
    container_name: solid-nestjs-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${DB_USERNAME}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: \${DB_DATABASE}
    ports:
      - \${DB_PORT}:5432
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USERNAME} -d \${DB_DATABASE}"]
      interval: 10s
      timeout: 5s
      retries: 5`
    : database === 'mysql'
      ? `  mysql:
    image: mysql:8.0
    container_name: solid-nestjs-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: \${DB_PASSWORD}
      MYSQL_DATABASE: \${DB_DATABASE}
      MYSQL_USER: \${DB_USERNAME}
      MYSQL_PASSWORD: \${DB_PASSWORD}
    ports:
      - \${DB_PORT}:3306
    volumes:
      - mysql_data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5`
      : `  mssql:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: mssql_server
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=\${DB_PASSWORD}
      - MSSQL_PID=Developer
      - DB_DATABASE=\${DB_DATABASE}
    ports:
      - "\${DB_PORT}:1433"
    volumes:
      - mssql_data:/var/opt/mssql
    entrypoint: /bin/bash
    command:
      - -c
      - |
        /opt/mssql/bin/sqlservr &
        pid=\$!
        echo "Waiting for SQL Server to be ready..."
        sleep 30

        echo "Checking and creating database: \$\$DB_DATABASE"
        /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "\$\$SA_PASSWORD" -C -Q "
        IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '\$\$DB_DATABASE')
        BEGIN
            CREATE DATABASE [\$\$DB_DATABASE];
            PRINT 'Database \$\$DB_DATABASE created successfully';
        END
        ELSE
        BEGIN
            PRINT 'Database \$\$DB_DATABASE already exists';
        END
        " || echo "Error creating database"

        echo "Initialization completed"
        wait \$pid
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \${DB_PASSWORD} -C -Q 'SELECT 1' || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s`
}${
      database === 'postgres'
        ? `

volumes:
  postgres_data:
    driver: local`
        : database === 'mysql'
          ? `

volumes:
  mysql_data:
    driver: local`
          : database === 'mssql'
            ? `

volumes:
  mssql_data:
    driver: local`
            : ''
    }`;
  }

  private async createSrcStructure(
    projectPath: string,
    nameVariations: any,
    options: NewCommandOptions,
    generatedFiles: string[],
  ): Promise<void> {
    const srcPath = path.join(projectPath, 'src');

    // Create main.ts
    const mainContent = this.generateMainTs(options);
    const mainResult = await writeFile(
      path.join(srcPath, 'main.ts'),
      mainContent,
    );
    if (mainResult.success) {
      generatedFiles.push(mainResult.path);
    }

    // Create app.module.ts
    const appModuleContent = this.generateAppModule(nameVariations, options);
    const appModuleResult = await writeFile(
      path.join(srcPath, 'app.module.ts'),
      appModuleContent,
    );
    if (appModuleResult.success) {
      generatedFiles.push(appModuleResult.path);
    }

    // Create app.controller.ts
    const appControllerContent = this.generateAppController();
    const appControllerResult = await writeFile(
      path.join(srcPath, 'app.controller.ts'),
      appControllerContent,
    );
    if (appControllerResult.success) {
      generatedFiles.push(appControllerResult.path);
    }

    // Create app.service.ts
    const appServiceContent = this.generateAppService();
    const appServiceResult = await writeFile(
      path.join(srcPath, 'app.service.ts'),
      appServiceContent,
    );
    if (appServiceResult.success) {
      generatedFiles.push(appServiceResult.path);
    }

    // Create directory structure
    await ensureDirectory(path.join(srcPath, options.resourceFolder));
    await ensureDirectory(path.join(srcPath, 'config'));

    // Create database config
    const dbConfigContent = this.generateDatabaseConfig(options);
    const dbConfigResult = await writeFile(
      path.join(srcPath, 'config', 'database.config.ts'),
      dbConfigContent,
    );
    if (dbConfigResult.success) {
      generatedFiles.push(dbConfigResult.path);
    }
  }

  private generateMainTs(options: NewCommandOptions): string {
    const imports = [
      "import { NestFactory } from '@nestjs/core';",
      "import { ValidationPipe } from '@nestjs/common';",
      "import { AppModule } from './app.module';",
    ];

    if (options.type === 'rest' || options.type === 'hybrid') {
      imports.push(
        "import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';",
      );
      imports.push(
        "import { swaggerRecomenedOptions } from '@solid-nestjs/rest-api';",
      );
    }

    const mainContent = `${imports.join('\n')}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

${
  options.type === 'graphql' || options.type === 'hybrid'
    ? `  // Enable CORS for GraphQL playground
  app.enableCors();

`
    : ''
}  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

${
  options.type === 'rest' || options.type === 'hybrid'
    ? `  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('SOLID NestJS API')
    .setDescription('API documentation for SOLID NestJS application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { ...swaggerRecomenedOptions },
  });

`
    : ''
}  await app.listen(process.env.PORT || 3000);

  const port = process.env.PORT || 3000;
${
  options.type === 'rest'
    ? `  console.log(\`🚀 Rest-API ready at http://localhost:\${port}/api\`);`
    : options.type === 'graphql'
      ? `  console.log(\`🚀 GraphQL server ready at http://localhost:\${port}/graphql\`);`
      : `  console.log(\`🚀 Rest-API ready at http://localhost:\${port}/api\`);
  console.log(\`🚀 GraphQL server ready at http://localhost:\${port}/graphql\`);`
}
}
bootstrap();
`;

    return mainContent;
  }

  private generateAppModule(
    nameVariations: any,
    options: NewCommandOptions,
  ): string {
    const imports = [
      "import { Module } from '@nestjs/common';",
      "import { TypeOrmModule } from '@nestjs/typeorm';",
      "import { ConfigModule, ConfigService } from '@nestjs/config';",
      "import { AppController } from './app.controller';",
      "import { AppService } from './app.service';",
      "import { databaseConfig } from './config/database.config';",
    ];

    if (options.type === 'graphql' || options.type === 'hybrid') {
      imports.push("import { GraphQLModule } from '@nestjs/graphql';");
      imports.push(
        "import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';",
      );
      imports.push(
        "import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';",
      );
      imports.push("import { join } from 'path';");
    }

    const moduleImports = [
      'ConfigModule.forRoot({ isGlobal: true })',
      'TypeOrmModule.forRootAsync(databaseConfig)',
    ];

    if (options.type === 'graphql' || options.type === 'hybrid') {
      moduleImports.push(`GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        playground: false,
        introspection: configService.get('GRAPHQL_INTROSPECTION', 'true') === 'true',
        sortSchema: true,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
      }),
      inject: [ConfigService],
    })`);
    }

    const appModuleContent = `${imports.join('\n')}

@Module({
  imports: [
    ${moduleImports.join(',\n    ')},
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;

    return appModuleContent;
  }

  private generateAppController(): string {
    return `import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // @ApiOperation({ summary: 'Get application info' })
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  // @Get('health')
  // @ApiOperation({ summary: 'Health check' })
  // getHealth(): { status: string; timestamp: string } {
  //   return this.appService.getHealth();
  // }
}
`;
  }

  private generateAppService(): string {
    return `import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to SOLID NestJS!';
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
`;
  }

  private generateDatabaseConfig(options: NewCommandOptions): string {
    const mssqlOptions =
      options.database === 'mssql'
        ? `
      options: {
        encrypt: configService.get('DB_ENCRYPT') === 'true',
        trustServerCertificate: configService.get('DB_TRUST_SERVER_CERTIFICATE') !== 'false',
      },`
        : '';

    return `import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    const dbType = configService.get('DB_TYPE') || '${options.database}';

    return {
      type: dbType as any,
      ${
        options.database === 'sqlite'
          ? "database: configService.get('DB_DATABASE') || 'database.sqlite',"
          : `host: configService.get('DB_HOST') || 'localhost',
      port: parseInt(configService.get('DB_PORT')) || ${this.getDefaultPort(options.database)},
      username: configService.get('DB_USERNAME'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_DATABASE'),${mssqlOptions}`
      }
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: configService.get('NODE_ENV') !== 'production',
      logging: configService.get('NODE_ENV') === 'development',
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsRun: false,
    } as TypeOrmModuleOptions;
  },
  inject: [ConfigService],
};
`;
  }

  private getDefaultPort(database: string): number {
    switch (database) {
      case 'postgres':
        return 5432;
      case 'mysql':
        return 3306;
      case 'mssql':
        return 1433;
      default:
        return 5432;
    }
  }

  private generateSnestConfig(options: NewCommandOptions): string {
    const bundle = this.getSolidBundleForType(options.type);
    const config = {
      $schema: `./node_modules/${bundle}/schemas/snest.config.json`,
      version: '1.0',
      project: {
        type: options.type,
        database: options.database,
        features: {
          hasSwagger: options.type === 'rest' || options.type === 'hybrid',
          hasGraphQL: options.type === 'graphql' || options.type === 'hybrid',
          hasTypeORM: true,
        },
        bundle: bundle,
      },
      generators: {
        defaultModulePath: `src/${options.resourceFolder}`,
        autoUpdateModules: true,
      },
    };

    return JSON.stringify(config, null, 2);
  }

  private getSolidBundleForType(type: 'rest' | 'graphql' | 'hybrid'): string {
    switch (type) {
      case 'rest':
        return '@solid-nestjs/typeorm-crud';
      case 'graphql':
        return '@solid-nestjs/typeorm-graphql-crud';
      case 'hybrid':
        return '@solid-nestjs/typeorm-hybrid-crud';
      default:
        return '@solid-nestjs/typeorm-hybrid-crud';
    }
  }

  private generateReadme(
    nameVariations: any,
    options: NewCommandOptions,
  ): string {
    return `# ${nameVariations.pascalCase}

A SOLID NestJS application built with TypeScript.

## Description

This project was generated using the SOLID NestJS CLI. It includes:

${options.type === 'rest' || options.type === 'hybrid' ? '- REST API with Swagger documentation\n' : ''}${options.type === 'graphql' || options.type === 'hybrid' ? '- GraphQL API with playground\n' : ''}- TypeORM integration with ${options.database.toUpperCase()}
- SOLID decorators for reduced boilerplate
- Automatic CRUD generation capabilities${options.database !== 'sqlite' ? '\n- Docker setup for database' : ''}

## Installation

\`\`\`bash
$ npm install
\`\`\`
${
  options.database !== 'sqlite'
    ? `
## Database Setup

This project includes a Docker Compose setup for your ${options.database.toUpperCase()} database.

### Using Docker

1. Copy the environment file:
\`\`\`bash
$ cp .env.example .env
\`\`\`

2. Configure your database settings in \`.env\` (the defaults should work for Docker)

3. Start the database:
\`\`\`bash
$ docker-compose up -d
\`\`\`

4. The database will be available with persistent storage in the \`./database\` folder.

### Manual Database Setup

If you prefer to set up the database manually, update the connection settings in \`.env\` and ensure your database server is running.
`
    : ''
}
## Running the app

\`\`\`bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
\`\`\`

## Test

\`\`\`bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
\`\`\`

## API Documentation

${options.type === 'rest' || options.type === 'hybrid' ? '- Swagger UI: http://localhost:3000/api\n' : ''}${options.type === 'graphql' || options.type === 'hybrid' ? '- GraphQL Playground: http://localhost:3000/graphql\n' : ''}
## Development

To generate new resources using the SOLID NestJS CLI:

\`\`\`bash
# Generate complete resource (entity, service, controller, DTOs)
$ snest generate resource Product --fields "name:string,price:number"

# Generate individual components
$ snest generate entity Product
$ snest generate service Products
$ snest generate controller Products

# Interactive mode
$ snest generate --interactive
\`\`\`

## License

This project is [MIT licensed](LICENSE).
`;
  }

  private async installDependencies(
    projectPath: string,
    packageManager: string,
  ): Promise<void> {
    this.startSpinner(`Installing dependencies with ${packageManager}...`);

    try {
      const { spawn } = await import('child_process');

      await new Promise<void>((resolve, reject) => {
        const child = spawn(packageManager, ['install'], {
          cwd: projectPath,
          stdio: 'pipe',
          shell: true,
        });

        child.on('close', code => {
          if (code === 0) {
            resolve();
          } else {
            reject(
              new Error(`${packageManager} install failed with code ${code}`),
            );
          }
        });

        child.on('error', reject);
      });

      this.succeedSpinner('Dependencies installed successfully');
    } catch (error) {
      this.failSpinner('Failed to install dependencies');
      throw error;
    }
  }

  private async initializeGit(projectPath: string): Promise<void> {
    this.startSpinner('Initializing git repository...');

    try {
      const { spawn } = await import('child_process');

      await new Promise<void>((resolve, reject) => {
        const child = spawn('git', ['init'], {
          cwd: projectPath,
          stdio: 'pipe',
          shell: true,
        });

        child.on('close', code => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`git init failed with code ${code}`));
          }
        });

        child.on('error', reject);
      });

      this.succeedSpinner('Git repository initialized');
    } catch (error) {
      this.logWarning(
        'Failed to initialize git repository (git not available)',
      );
    }
  }

  private showNextSteps(projectName: string, options: NewCommandOptions): void {
    console.log('\n' + chalk.green('✨ Project created successfully!'));
    console.log('\n' + chalk.bold('Next steps:'));
    console.log(chalk.gray('  1.'), `cd ${projectName}`);

    let step = 2;
    if (options.skipInstall) {
      console.log(
        chalk.gray(`  ${step++}.`),
        `${options.packageManager} install`,
      );
    }

    if (options.database !== 'sqlite') {
      console.log(chalk.gray(`  ${step++}.`), 'cp .env.example .env');
      console.log(chalk.gray(`  ${step++}.`), 'docker-compose up -d');
      console.log(chalk.gray(`  ${step++}.`), 'npm run start:dev');
    } else {
      console.log(chalk.gray(`  ${step++}.`), 'cp .env.example .env');
      console.log(chalk.gray(`  ${step++}.`), 'npm run start:dev');
    }

    console.log('\n' + chalk.blue('📚 Documentation:'));
    console.log(
      '  - Framework docs: https://github.com/solid-nestjs/framework',
    );
    console.log('  - NestJS docs: https://docs.nestjs.com');

    if (options.type === 'rest' || options.type === 'hybrid') {
      console.log('  - Swagger UI: http://localhost:3000/api');
    }

    if (options.type === 'graphql' || options.type === 'hybrid') {
      console.log('  - GraphQL Playground: http://localhost:3000/graphql');
    }

    console.log('\n' + chalk.yellow('💡 Generate resources with:'));
    console.log(
      '  snest generate resource Product --fields "name:string,price:number"',
    );
    console.log('  snest generate --interactive');
  }
}
