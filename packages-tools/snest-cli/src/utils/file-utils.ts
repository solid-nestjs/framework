import * as fs from 'fs-extra';
import * as path from 'path';
import { FileOperationResult } from '../types';

/**
 * Utility functions for file system operations
 */

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists, create if it doesn't
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Read file content as string
 */
export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8');
}

/**
 * Write file content with directory creation
 */
export async function writeFile(
  filePath: string,
  content: string,
  overwrite = false
): Promise<FileOperationResult> {
  try {
    const exists = await fileExists(filePath);
    
    if (exists && !overwrite) {
      return {
        path: filePath,
        content,
        operation: 'skip',
        success: true,
      };
    }

    // Ensure directory exists
    await ensureDirectory(path.dirname(filePath));
    
    // Write file
    await fs.writeFile(filePath, content, 'utf8');
    
    return {
      path: filePath,
      content,
      operation: exists ? 'update' : 'create',
      success: true,
    };
  } catch (error) {
    return {
      path: filePath,
      content,
      operation: 'create',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Copy file from source to destination
 */
export async function copyFile(
  sourcePath: string,
  destPath: string,
  overwrite = false
): Promise<FileOperationResult> {
  try {
    const exists = await fileExists(destPath);
    
    if (exists && !overwrite) {
      return {
        path: destPath,
        content: '',
        operation: 'skip',
        success: true,
      };
    }

    await ensureDirectory(path.dirname(destPath));
    await fs.copy(sourcePath, destPath, { overwrite });
    
    const content = await readFile(destPath);
    
    return {
      path: destPath,
      content,
      operation: exists ? 'update' : 'create',
      success: true,
    };
  } catch (error) {
    return {
      path: destPath,
      content: '',
      operation: 'create',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Find files matching a pattern recursively
 */
export async function findFiles(
  directory: string,
  pattern: string | RegExp,
  maxDepth = 10
): Promise<string[]> {
  const results: string[] = [];
  
  async function search(dir: string, depth: number) {
    if (depth > maxDepth) return;
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await search(fullPath, depth + 1);
        } else if (entry.isFile()) {
          const matches = typeof pattern === 'string' 
            ? entry.name.includes(pattern)
            : pattern.test(entry.name);
            
          if (matches) {
            results.push(fullPath);
          }
        }
      }
    } catch {
      // Ignore directories we can't read
    }
  }
  
  await search(directory, 0);
  return results;
}

/**
 * Get relative path from project root
 */
export function getRelativePath(fullPath: string, projectRoot: string): string {
  return path.relative(projectRoot, fullPath);
}

/**
 * Resolve path relative to project root
 */
export function resolvePath(relativePath: string, projectRoot: string): string {
  return path.resolve(projectRoot, relativePath);
}

/**
 * Get file extension without dot
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).slice(1);
}

/**
 * Get filename without extension
 */
export function getFileNameWithoutExtension(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Create a backup of a file
 */
export async function backupFile(filePath: string): Promise<string> {
  const backupPath = `${filePath}.backup.${Date.now()}`;
  await fs.copy(filePath, backupPath);
  return backupPath;
}

/**
 * Clean up backup files older than specified days
 */
export async function cleanupBackups(directory: string, olderThanDays = 7): Promise<void> {
  const backupFiles = await findFiles(directory, /\.backup\.\d+$/);
  const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
  
  for (const backupFile of backupFiles) {
    try {
      const stats = await fs.stat(backupFile);
      if (stats.mtime.getTime() < cutoffTime) {
        await fs.remove(backupFile);
      }
    } catch {
      // Ignore errors when cleaning up
    }
  }
}