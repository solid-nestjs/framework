#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CliConfig } from './types';
import { NewCommand } from './commands/new.command';

/**
 * Default CLI configuration
 */
const defaultConfig: CliConfig = {
  defaultPackageManager: 'npm',
  defaultDatabase: 'sqlite',
  defaultApiType: 'hybrid',
  generateTests: true,
  testFramework: 'jest',
  useStrictMode: true,
  formatting: {
    prettier: true,
    eslint: true,
  },
  paths: {
    entities: 'src/entities',
    services: 'src/services',
    controllers: 'src/controllers',
    modules: 'src/modules',
    dto: 'src/dto',
  },
};

/**
 * Main CLI function
 */
async function main() {
  const program = new Command();
  
  // Get package info
  const packageJson = require('../package.json');
  
  // Configure program
  program
    .name('snest')
    .description('CLI tool for generating SOLID NestJS applications and components')
    .version(packageJson.version, '-v, --version', 'Output the current version')
    .helpOption('-h, --help', 'Display help for command')
    .addHelpText('after', `
Examples:
  ${chalk.cyan('snest new my-app')}                    Create a new SOLID NestJS project
  ${chalk.cyan('snest generate entity Product')}      Generate an entity
  ${chalk.cyan('snest generate service Products')}    Generate a service
  ${chalk.cyan('snest generate controller Products')} Generate a controller
  ${chalk.cyan('snest generate resource Product')}    Generate complete resource
  ${chalk.cyan('snest generate --interactive')}       Interactive mode

For more information, visit: ${chalk.blue('https://github.com/solid-nestjs/framework')}
    `);

  // Register commands
  const newCommand = new NewCommand(defaultConfig);
  newCommand.register(program);

  // Handle unknown commands
  program.on('command:*', () => {
    console.log(chalk.red('✖'), `Unknown command: ${program.args.join(' ')}`);
    console.log('');
    console.log('Run', chalk.cyan('snest --help'), 'to see available commands.');
    process.exit(1);
  });

  // Show help if no command provided
  if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(0);
  }

  // Parse arguments and execute
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.log(chalk.red('✖'), 'CLI execution failed');
    
    if (error instanceof Error) {
      console.log(chalk.red(error.message));
      
      // Show stack trace in debug mode
      if (process.env.DEBUG) {
        console.log(chalk.gray(error.stack));
      }
    }
    
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log(chalk.red('✖'), 'Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.log(chalk.red('✖'), 'Uncaught Exception:', error.message);
  
  if (process.env.DEBUG) {
    console.log(chalk.gray(error.stack));
  }
  
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk.red('✖'), 'Failed to start CLI:', error.message);
    process.exit(1);
  });
}

export { main };