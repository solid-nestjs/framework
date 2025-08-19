import 'reflect-metadata';
import { GenerateDtoFromEntity } from '../generate-dto-from-entity.helper';
import { SolidEntity, SolidField, SolidId, SolidInput } from '@solid-nestjs/common';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';
import { MetadataStorage } from '@solid-nestjs/common';

// Clean metadata before each test
beforeEach(() => {
  MetadataStorage.clearMetadata();
});

describe('GenerateDtoFromEntity (rest-graphql)', () => {
  @SolidEntity()
  class User {
    @SolidId({ description: 'User ID' })
    id: string;

    @SolidField({ 
      description: 'User name',
      minLength: 3,
      maxLength: 50
    })
    name: string;

    @SolidField({ 
      description: 'User email',
      email: true
    })
    email: string;

    @SolidField({ 
      description: 'User age',
      min: 18,
      max: 120
    })
    age: number;

    @SolidField({ 
      description: 'User phone',
      nullable: true
    })
    phone?: string;

    @SolidField()
    createdAt: Date;

    @SolidField()
    updatedAt: Date;

    // Complex field that should not be auto-selected
    profile: { bio: string; avatar: string };
  }

  describe('Basic functionality', () => {
    it('should generate DTO with selected properties', () => {
      const CreateUserDto = GenerateDtoFromEntity(User, ['name', 'email']);
      
      const instance = new CreateUserDto();
      
      expect(instance).toHaveProperty('name');
      expect(instance).toHaveProperty('email');
      expect(instance).not.toHaveProperty('id');
      expect(instance).not.toHaveProperty('age');
    });

    it('should generate DTO with default properties when none specified', () => {
      const CreateUserDto = GenerateDtoFromEntity(User);
      
      const instance = new CreateUserDto();
      
      expect(instance).toHaveProperty('name');
      expect(instance).toHaveProperty('email');
      expect(instance).toHaveProperty('age');
      expect(instance).toHaveProperty('phone');
      expect(instance).not.toHaveProperty('id');
      expect(instance).not.toHaveProperty('createdAt');
      expect(instance).not.toHaveProperty('updatedAt');
      expect(instance).not.toHaveProperty('profile');
    });

    it('should work with class extension', () => {
      @SolidInput()
      class CreateUserDto extends GenerateDtoFromEntity(User, ['name', 'email']) {
        @SolidField({ description: 'Additional field' })
        additionalField: string;
      }
      
      const instance = new CreateUserDto();
      
      expect(instance).toHaveProperty('name');
      expect(instance).toHaveProperty('email');
      expect(instance).toHaveProperty('additionalField');
      expect(instance).not.toHaveProperty('id');
    });
  });

  describe('Error handling', () => {
    it('should throw error for non-existent property', () => {
      expect(() => {
        GenerateDtoFromEntity(User, ['nonExistent'] as any);
      }).toThrow("Property 'nonExistent' does not exist on entity User");
    });

    it('should throw error for system field selection', () => {
      expect(() => {
        GenerateDtoFromEntity(User, ['id'] as any);
      }).toThrow("Property 'id' is a system field");
    });

    it('should throw error for complex field selection', () => {
      expect(() => {
        GenerateDtoFromEntity(User, ['profile'] as any);
      }).toThrow("Property 'profile' is not a flat type");
    });
  });

  describe('Decorator transfer', () => {
    it('should preserve class name for debugging', () => {
      const CreateUserDto = GenerateDtoFromEntity(User, ['name']);
      
      expect(CreateUserDto.name).toBe('GeneratedUserDto');
    });
  });

  describe('Type safety', () => {
    it('should maintain TypeScript type compatibility', () => {
      const CreateUserDto = GenerateDtoFromEntity(User, ['name', 'email', 'age']);
      
      // This should compile without errors
      const dto: Partial<User> = new CreateUserDto();
      dto.name = 'John';
      dto.email = 'john@example.com';
      dto.age = 30;
      
      expect(dto.name).toBe('John');
      expect(dto.email).toBe('john@example.com');
      expect(dto.age).toBe(30);
    });

    it('should work with optional properties', () => {
      const CreateUserDto = GenerateDtoFromEntity(User, ['name', 'phone']);
      
      const dto = new CreateUserDto();
      dto.name = 'John';
      dto.phone = '+1234567890';
      
      expect(dto.name).toBe('John');
      expect(dto.phone).toBe('+1234567890');
    });
  });

  describe('Real-world usage patterns', () => {
    it('should work for create DTO pattern', () => {
      @SolidInput()
      class CreateUserDto extends GenerateDtoFromEntity(User, ['name', 'email', 'age']) {}
      
      const dto = new CreateUserDto();
      dto.name = 'John Doe';
      dto.email = 'john@example.com';
      dto.age = 30;
      
      expect(dto).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      });
    });

    it('should work for update DTO pattern', () => {
      @SolidInput()
      class UpdateUserDto extends GenerateDtoFromEntity(User) {}
      
      const instance = new UpdateUserDto();
      
      // Should have all flat properties for partial updates
      expect(instance).toHaveProperty('name');
      expect(instance).toHaveProperty('email');
      expect(instance).toHaveProperty('age');
      expect(instance).toHaveProperty('phone');
    });

    it('should work for extended DTO with additional fields', () => {
      @SolidInput()
      class RegisterUserDto extends GenerateDtoFromEntity(User, ['name', 'email']) {
        @SolidField({ 
          description: 'User password',
          minLength: 8
        })
        password: string;
        
        @SolidField({ 
          description: 'Confirm password'
        })
        confirmPassword: string;
      }
      
      const dto = new RegisterUserDto();
      dto.name = 'John';
      dto.email = 'john@example.com';
      dto.password = 'secretpass';
      dto.confirmPassword = 'secretpass';
      
      expect(dto).toHaveProperty('name');
      expect(dto).toHaveProperty('email');
      expect(dto).toHaveProperty('password');
      expect(dto).toHaveProperty('confirmPassword');
      expect(dto).not.toHaveProperty('id');
    });
  });
});