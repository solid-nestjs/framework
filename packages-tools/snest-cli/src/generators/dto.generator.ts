import { writeFile } from '../utils/file-utils';
import { createNameVariations } from '../utils/string-utils';
import { FieldDefinition } from '../types';
import * as path from 'path';

export class DTOGenerator {
  /**
   * Generate Create DTO for entity
   */
  static async generateCreateDTO(entityName: string, fields: FieldDefinition[] = []): Promise<string> {
    const nameVariations = createNameVariations(entityName);
    
    const imports = [
      "import { IsString, IsNumber, IsBoolean, IsOptional, IsEmail, MaxLength } from 'class-validator';",
      "import { ApiProperty } from '@nestjs/swagger';"
    ];

    const fieldDefinitions = fields.map(field => {
      const decorators = [];
      
      // API Property
      decorators.push(`  @ApiProperty({
    description: 'The ${field.name} of the ${entityName}',
    ${field.nullable ? 'required: false,' : ''}
    type: '${this.getSwaggerType(field.type)}',
  })`);

      // Validation decorators
      if (field.nullable) {
        decorators.push('  @IsOptional()');
      }

      switch (field.type) {
        case 'string':
          decorators.push('  @IsString()');
          if (field.name.toLowerCase().includes('email')) {
            decorators.push('  @IsEmail()');
          }
          decorators.push('  @MaxLength(255)');
          break;
        case 'number':
          decorators.push('  @IsNumber()');
          break;
        case 'boolean':
          decorators.push('  @IsBoolean()');
          break;
      }

      return `${decorators.join('\n')}
  ${field.name}${field.nullable ? '?' : ''}: ${this.getTypeScriptType(field.type)};`;
    }).join('\n\n');

    const content = `${imports.join('\n')}

export class Create${nameVariations.pascalCase}Dto {
${fieldDefinitions}
}`;

    const outputPath = path.join(process.cwd(), 'src/dto/inputs', `create-${nameVariations.kebabCase}.dto.ts`);
    await writeFile(outputPath, content);
    return outputPath;
  }

  /**
   * Generate Update DTO for entity
   */
  static async generateUpdateDTO(entityName: string): Promise<string> {
    const nameVariations = createNameVariations(entityName);
    
    const content = `import { PartialType } from '@nestjs/swagger';
import { Create${nameVariations.pascalCase}Dto } from './create-${nameVariations.kebabCase}.dto';

export class Update${nameVariations.pascalCase}Dto extends PartialType(Create${nameVariations.pascalCase}Dto) {}`;

    const outputPath = path.join(process.cwd(), 'src/dto/inputs', `update-${nameVariations.kebabCase}.dto.ts`);
    await writeFile(outputPath, content);
    return outputPath;
  }

  private static getSwaggerType(type: string): string {
    switch (type) {
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      default: return 'string';
    }
  }

  private static getTypeScriptType(type: string): string {
    switch (type) {
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'Date': return 'Date';
      default: return 'string';
    }
  }
}