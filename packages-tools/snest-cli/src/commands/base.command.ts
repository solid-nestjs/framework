import { Command } from 'commander';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { CliConfig, CommandResult } from '../types';

/**
 * Base class for all CLI commands
 */
export abstract class BaseCommand {
  protected spinner: Ora;
  protected config: CliConfig;

  constructor(config: CliConfig) {
    this.config = config;
    this.spinner = ora();
  }

  /**
   * Register the command with Commander
   */
  abstract register(program: Command): void;

  /**
   * Execute the command
   */
  abstract execute(...args: any[]): Promise<CommandResult>;

  /**
   * Log success message
   */
  protected logSuccess(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  /**
   * Log error message
   */
  protected logError(message: string): void {
    console.log(chalk.red('✖'), message);
  }

  /**
   * Log warning message
   */
  protected logWarning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  /**
   * Log info message
   */
  protected logInfo(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  /**
   * Start spinner with message
   */
  protected startSpinner(message: string): void {
    this.spinner.start(message);
  }

  /**
   * Update spinner message
   */
  protected updateSpinner(message: string): void {
    this.spinner.text = message;
  }

  /**
   * Stop spinner with success
   */
  protected succeedSpinner(message?: string): void {
    this.spinner.succeed(message);
  }

  /**
   * Stop spinner with failure
   */
  protected failSpinner(message?: string): void {
    this.spinner.fail(message);
  }

  /**
   * Stop spinner
   */
  protected stopSpinner(): void {
    this.spinner.stop();
  }

  /**
   * Validate command arguments
   */
  protected validateArgs(args: any): string[] {
    const errors: string[] = [];
    
    // Override in subclasses for specific validation
    return errors;
  }

  /**
   * Handle command execution with error handling
   */
  protected async handleExecution(
    executionFn: () => Promise<CommandResult>
  ): Promise<void> {
    try {
      const result = await executionFn();
      
      if (result.success) {
        this.logSuccess(result.message);
        
        if (result.generatedFiles && result.generatedFiles.length > 0) {
          console.log('\nGenerated files:');
          result.generatedFiles.forEach(file => {
            console.log(chalk.gray('  -'), chalk.cyan(file));
          });
        }
      } else {
        this.logError(result.message);
        
        if (result.errors && result.errors.length > 0) {
          console.log('\nErrors:');
          result.errors.forEach(error => {
            console.log(chalk.gray('  -'), chalk.red(error));
          });
        }
        
        process.exit(1);
      }
    } catch (error) {
      this.failSpinner();
      
      if (error instanceof Error) {
        this.logError(`Command failed: ${error.message}`);
        
        // Show stack trace in debug mode
        if (process.env.DEBUG) {
          console.log(chalk.gray(error.stack));
        }
      } else {
        this.logError('Command failed with unknown error');
      }
      
      process.exit(1);
    }
  }

  /**
   * Prompt user for confirmation
   */
  protected async confirmAction(message: string): Promise<boolean> {
    const inquirer = await import('inquirer');
    const { confirmed } = await inquirer.default.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: false,
      },
    ]);
    
    return confirmed;
  }

  /**
   * Get current working directory
   */
  protected getCurrentDirectory(): string {
    return process.cwd();
  }

  /**
   * Check if running in a valid project directory
   */
  protected async isValidProjectDirectory(): Promise<boolean> {
    const fs = await import('fs-extra');
    const path = await import('path');
    
    const packageJsonPath = path.join(this.getCurrentDirectory(), 'package.json');
    
    try {
      await fs.access(packageJsonPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format file path for display
   */
  protected formatPath(filePath: string): string {
    const path = require('path');
    return path.relative(this.getCurrentDirectory(), filePath);
  }
}