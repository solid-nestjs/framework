import * as ts from 'typescript';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * Module import to add
 */
export interface ModuleImport {
  name: string;
  path: string;
  isDefault?: boolean;
}

/**
 * Module array item to add (controllers, providers, etc.)
 */
export interface ModuleArrayItem {
  name: string;
  arrayType: 'imports' | 'controllers' | 'providers' | 'exports';
}

/**
 * TypeORM entity to add to forFeature
 */
export interface TypeOrmEntity {
  name: string;
}

/**
 * AST utility for TypeScript file manipulation
 */
export class AstUtils {
  
  /**
   * Parse TypeScript content and return AST
   */
  static parseFromContent(content: string, fileName: string = 'temp.ts'): ts.SourceFile | null {
    try {
      return ts.createSourceFile(
        fileName,
        content,
        ts.ScriptTarget.Latest,
        true
      );
    } catch (error) {
      console.error('Error parsing TypeScript content:', error);
      return null;
    }
  }

  /**
   * Parse TypeScript file and return AST
   */
  static parseFile(filePath: string): ts.SourceFile | null {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return ts.createSourceFile(
        path.basename(filePath),
        content,
        ts.ScriptTarget.Latest,
        true
      );
    } catch (error) {
      console.error(`Failed to parse file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Check if file contains an import statement
   */
  static hasImport(sourceFile: ts.SourceFile, importName: string): boolean {
    let hasImport = false;
    
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isImportDeclaration(node)) {
        const importClause = node.importClause;
        if (importClause) {
          // Check default import
          if (importClause.name?.text === importName) {
            hasImport = true;
          }
          
          // Check named imports
          if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
            importClause.namedBindings.elements.forEach((element) => {
              if (element.name.text === importName) {
                hasImport = true;
              }
            });
          }
        }
      }
    });
    
    return hasImport;
  }

  /**
   * Check if module decorator contains an array item
   */
  static hasModuleArrayItem(sourceFile: ts.SourceFile, itemName: string, arrayType: string): boolean {
    let hasItem = false;
    
    const visit = (node: ts.Node): void => {
      if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
        const expression = node.expression;
        if (ts.isIdentifier(expression.expression) && expression.expression.text === 'Module') {
          const moduleConfig = expression.arguments[0];
          if (moduleConfig && ts.isObjectLiteralExpression(moduleConfig)) {
            moduleConfig.properties.forEach((prop) => {
              if (ts.isPropertyAssignment(prop) && 
                  ts.isIdentifier(prop.name) && 
                  prop.name.text === arrayType) {
                if (ts.isArrayLiteralExpression(prop.initializer)) {
                  prop.initializer.elements.forEach((element) => {
                    if (ts.isIdentifier(element) && element.text === itemName) {
                      hasItem = true;
                    }
                  });
                }
              }
            });
          }
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return hasItem;
  }

  /**
   * Check if TypeORM forFeature exists
   */
  static hasTypeOrmForFeature(sourceFile: ts.SourceFile): boolean {
    let hasForFeature = false;
    
    const visitor = (node: ts.Node): void => {
      if (ts.isCallExpression(node) && 
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === 'TypeOrmModule' &&
          ts.isIdentifier(node.expression.name) &&
          node.expression.name.text === 'forFeature') {
        hasForFeature = true;
        return;
      }
      ts.forEachChild(node, visitor);
    };
    
    visitor(sourceFile);
    return hasForFeature;
  }

  /**
   * Check if TypeORM forFeature contains an entity
   */
  static hasTypeOrmEntity(sourceFile: ts.SourceFile, entityName: string): boolean {
    let hasEntity = false;
    
    const visit = (node: ts.Node): void => {
      // Look for TypeOrmModule.forFeature calls
      if (ts.isCallExpression(node) && 
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === 'TypeOrmModule' &&
          ts.isIdentifier(node.expression.name) &&
          node.expression.name.text === 'forFeature') {
        
        const entitiesArray = node.arguments[0];
        if (entitiesArray && ts.isArrayLiteralExpression(entitiesArray)) {
          entitiesArray.elements.forEach((element) => {
            if (ts.isIdentifier(element) && element.text === entityName) {
              hasEntity = true;
            }
          });
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return hasEntity;
  }

  /**
   * Add import statement to file
   */
  static addImport(
    sourceFile: ts.SourceFile, 
    moduleImport: ModuleImport
  ): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    
    // Check if import already exists
    if (this.hasImport(sourceFile, moduleImport.name)) {
      return this.printSourceFile(sourceFile, printer);
    }

    // Create new import statement
    const importDeclaration = moduleImport.isDefault
      ? ts.factory.createImportDeclaration(
          undefined,
          ts.factory.createImportClause(
            false,
            ts.factory.createIdentifier(moduleImport.name),
            undefined
          ),
          ts.factory.createStringLiteral(moduleImport.path)
        )
      : ts.factory.createImportDeclaration(
          undefined,
          ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamedImports([
              ts.factory.createImportSpecifier(
                false,
                undefined,
                ts.factory.createIdentifier(moduleImport.name)
              )
            ])
          ),
          ts.factory.createStringLiteral(moduleImport.path)
        );

    // Find insertion point (after last import)
    let insertIndex = 0;
    for (let i = 0; i < sourceFile.statements.length; i++) {
      if (ts.isImportDeclaration(sourceFile.statements[i])) {
        insertIndex = i + 1;
      } else {
        break;
      }
    }

    // Create new statements array with import inserted
    const newStatements = [
      ...sourceFile.statements.slice(0, insertIndex),
      importDeclaration,
      ...sourceFile.statements.slice(insertIndex)
    ];

    const newSourceFile = ts.factory.updateSourceFile(
      sourceFile,
      newStatements
    );

    return this.printSourceFile(newSourceFile, printer);
  }

  /**
   * Add item to module decorator array
   */
  static addModuleArrayItem(
    sourceFile: ts.SourceFile,
    item: ModuleArrayItem
  ): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    
    // Check if item already exists
    if (this.hasModuleArrayItem(sourceFile, item.name, item.arrayType)) {
      return this.printSourceFile(sourceFile, printer);
    }

    const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
      return (sourceFile) => {
        const visitor: ts.Visitor = (node) => {
          if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
            const expression = node.expression;
            if (ts.isIdentifier(expression.expression) && expression.expression.text === 'Module') {
              const moduleConfig = expression.arguments[0];
              if (moduleConfig && ts.isObjectLiteralExpression(moduleConfig)) {
                return this.updateModuleDecorator(node, item);
              }
            }
          }
          return ts.visitEachChild(node, visitor, context);
        };
        return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
      };
    };

    const result = ts.transform(sourceFile, [transformer]);
    const transformedSourceFile = result.transformed[0];
    result.dispose();

    return this.printSourceFile(transformedSourceFile, printer);
  }

  /**
   * Add entity to TypeORM forFeature array
   */
  static addTypeOrmEntity(
    sourceFile: ts.SourceFile,
    entity: TypeOrmEntity
  ): string {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    
    // Check if entity already exists
    if (this.hasTypeOrmEntity(sourceFile, entity.name)) {
      return this.printSourceFile(sourceFile, printer);
    }

    // Check if there's already a forFeature call
    const hasForFeature = this.hasTypeOrmForFeature(sourceFile);
    
    if (hasForFeature) {
      // Add to existing forFeature call
      const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
        return (sourceFile) => {
          const visitor: ts.Visitor = (node) => {
            if (ts.isCallExpression(node) && 
                ts.isPropertyAccessExpression(node.expression) &&
                ts.isIdentifier(node.expression.expression) &&
                node.expression.expression.text === 'TypeOrmModule' &&
                ts.isIdentifier(node.expression.name) &&
                node.expression.name.text === 'forFeature') {
              
              const entitiesArray = node.arguments[0];
              if (entitiesArray && ts.isArrayLiteralExpression(entitiesArray)) {
                const newElements = [
                  ...entitiesArray.elements,
                  ts.factory.createIdentifier(entity.name)
                ];
                
                const newArray = ts.factory.createArrayLiteralExpression(newElements, true);
                return ts.factory.updateCallExpression(
                  node,
                  node.expression,
                  node.typeArguments,
                  [newArray, ...node.arguments.slice(1)]
                );
              }
            }
            return ts.visitEachChild(node, visitor, context);
          };
          return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
        };
      };

      const result = ts.transform(sourceFile, [transformer]);
      const transformedSourceFile = result.transformed[0];
      result.dispose();

      return this.printSourceFile(transformedSourceFile, printer);
    } else {
      // Create new forFeature call
      return this.addModuleArrayItem(sourceFile, {
        name: `TypeOrmModule.forFeature([${entity.name}])`,
        arrayType: 'imports'
      });
    }
  }

  /**
   * Update module decorator with new array item
   */
  private static updateModuleDecorator(
    decoratorNode: ts.Decorator,
    item: ModuleArrayItem
  ): ts.Decorator {
    if (!ts.isCallExpression(decoratorNode.expression)) {
      return decoratorNode;
    }

    const expression = decoratorNode.expression;
    const moduleConfig = expression.arguments[0];
    
    if (!moduleConfig || !ts.isObjectLiteralExpression(moduleConfig)) {
      return decoratorNode;
    }

    let updatedProperties = [...moduleConfig.properties];
    let foundArrayProperty = false;

    // Update existing array property
    updatedProperties = updatedProperties.map((prop) => {
      if (ts.isPropertyAssignment(prop) && 
          ts.isIdentifier(prop.name) && 
          prop.name.text === item.arrayType) {
        foundArrayProperty = true;
        
        if (ts.isArrayLiteralExpression(prop.initializer)) {
          const newElements = [
            ...prop.initializer.elements,
            ts.factory.createIdentifier(item.name)
          ];
          
          return ts.factory.updatePropertyAssignment(
            prop,
            prop.name,
            ts.factory.createArrayLiteralExpression(newElements, true)
          );
        }
      }
      return prop;
    });

    // Add new array property if it doesn't exist
    if (!foundArrayProperty) {
      const newProperty = ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier(item.arrayType),
        ts.factory.createArrayLiteralExpression([
          ts.factory.createIdentifier(item.name)
        ], true)
      );
      updatedProperties.push(newProperty);
    }

    const newModuleConfig = ts.factory.createObjectLiteralExpression(
      updatedProperties,
      true
    );

    const newExpression = ts.factory.updateCallExpression(
      expression,
      expression.expression,
      expression.typeArguments,
      [newModuleConfig]
    );

    return ts.factory.updateDecorator(decoratorNode, newExpression);
  }

  /**
   * Print source file to string
   */
  private static printSourceFile(sourceFile: ts.SourceFile, printer: ts.Printer): string {
    return printer.printFile(sourceFile);
  }

  /**
   * Write updated content to file
   */
  static writeFile(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Find all module files in a directory
   */
  static async findModuleFiles(dir: string): Promise<string[]> {
    const moduleFiles: string[] = [];
    
    try {
      const files = await fs.readdir(dir, { recursive: true });
      
      for (const file of files) {
        if (typeof file === 'string' && file.endsWith('.module.ts')) {
          moduleFiles.push(path.join(dir, file));
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${dir}:`, error);
    }
    
    return moduleFiles;
  }
}