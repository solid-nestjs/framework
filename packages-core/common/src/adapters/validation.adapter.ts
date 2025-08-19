import { DecoratorAdapter, FieldMetadata } from '../interfaces';
import { 
  isClassValidatorAvailable, 
  isClassTransformerAvailable 
} from '../helpers/package-detector.helper';
import { detectArrayInfo } from '../helpers/type-inference.helper';

// Dynamic imports to avoid dependency issues
let IsString: any;
let IsNumber: any; 
let IsBoolean: any;
let IsDate: any;
let IsEmail: any;
let IsUrl: any;
let IsUUID: any;
let IsJSON: any;
let IsOptional: any;
let IsNotEmpty: any;
let IsEnum: any;
let IsIn: any;
let IsArray: any;
let IsObject: any;
let IsInt: any;
let IsPositive: any;
let IsNegative: any;
let Min: any;
let Max: any;
let MinLength: any;
let MaxLength: any;
let Matches: any;
let ValidateNested: any;
let ArrayMinSize: any;
let ArrayMaxSize: any;
let Type: any;
let Transform: any;

export class ValidationDecoratorAdapter implements DecoratorAdapter {
  name = 'validation';
  
  // Track applied decorators to prevent duplicates
  private static applied = new WeakMap<any, Set<string | symbol>>();
  private validatorsLoaded = false;
  
  isAvailable(): boolean {
    return isClassValidatorAvailable() && isClassTransformerAvailable();
  }
  
  private loadValidatorsSync(): void {
    if (this.validatorsLoaded) return;
    
    try {
      const classValidator = require('class-validator');
      const classTransformer = require('class-transformer');
      
      // Assign validators
      IsString = classValidator.IsString;
      IsNumber = classValidator.IsNumber;
      IsBoolean = classValidator.IsBoolean;
      IsDate = classValidator.IsDate;
      IsEmail = classValidator.IsEmail;
      IsUrl = classValidator.IsUrl;
      IsUUID = classValidator.IsUUID;
      IsJSON = classValidator.IsJSON;
      IsOptional = classValidator.IsOptional;
      IsNotEmpty = classValidator.IsNotEmpty;
      IsEnum = classValidator.IsEnum;
      IsIn = classValidator.IsIn;
      IsArray = classValidator.IsArray;
      IsObject = classValidator.IsObject;
      IsInt = classValidator.IsInt;
      IsPositive = classValidator.IsPositive;
      IsNegative = classValidator.IsNegative;
      Min = classValidator.Min;
      Max = classValidator.Max;
      MinLength = classValidator.MinLength;
      MaxLength = classValidator.MaxLength;
      Matches = classValidator.Matches;
      ValidateNested = classValidator.ValidateNested;
      ArrayMinSize = classValidator.ArrayMinSize;
      ArrayMaxSize = classValidator.ArrayMaxSize;
      
      // Assign transformers
      Type = classTransformer.Type;
      Transform = classTransformer.Transform;
      
      this.validatorsLoaded = true;
    } catch (error) {
      console.warn('[SolidNestJS] Failed to load validation decorators:', error);
    }
  }
  
  apply(target: any, propertyKey: string | symbol, metadata: FieldMetadata): void {
    // Load validators if not already loaded
    if (!this.validatorsLoaded) {
      this.loadValidatorsSync();
      if (!this.validatorsLoaded) return;
    }
    
    // Prevent duplicate application
    if (this.isAlreadyApplied(target, propertyKey)) {
      return;
    }
    this.markAsApplied(target, propertyKey);
    
    const { type, options, isOptional, adapterOptions } = metadata;
    
    // Debug logging (disabled)
    // if (process.env.NODE_ENV !== 'production') {
    //   console.log(`[ValidationAdapter] Applying to ${target.constructor.name}.${String(propertyKey)}: type=${type?.name}, optional=${isOptional}, nullable=${options.nullable}`);
    // }
    
    // Skip if validation explicitly disabled
    if (options.skipValidation || adapterOptions?.skip) {
      return;
    }
    
    // Apply transformation
    this.applyTransformation(target, propertyKey, type, options, adapterOptions);
    
    // Apply optional/required validators
    this.applyOptionalValidators(target, propertyKey, options, isOptional, adapterOptions);
    
    // Apply type-specific validators
    this.applyTypeValidators(target, propertyKey, type, options, adapterOptions);
    
    // Apply array-specific validators if detected
    this.applyArrayValidators(target, propertyKey, type, options, adapterOptions);
    
    // Apply constraint validators
    this.applyConstraintValidators(target, propertyKey, type, options, adapterOptions);
    
    // Apply custom validators
    this.applyCustomValidators(target, propertyKey, adapterOptions);
  }
  
  private applyTransformation(
    target: any,
    propertyKey: string | symbol,
    type: any,
    options: any,
    adapterOptions: any
  ): void {
    if (!Type || !Transform) return;
    
    // Skip transformation if explicitly disabled
    if (options.transform === false || adapterOptions?.skipTransform) {
      return;
    }
    
    // Apply Type decorator for nested objects only when safe
    if (type && typeof type === 'function' && !this.isPrimitiveType(type)) {
      try {
        Type(() => type)(target, propertyKey);
      } catch (error) {
        console.warn(`[SolidNestJS] Failed to apply Type decorator for ${String(propertyKey)}:`, error);
      }
    }
    
    // Apply custom transformers
    if (adapterOptions?.transform) {
      Transform(adapterOptions.transform)(target, propertyKey);
    }
  }
  
  private applyOptionalValidators(
    target: any,
    propertyKey: string | symbol,
    options: any,
    isOptional: boolean,
    adapterOptions: any
  ): void {
    if (!IsOptional || !IsNotEmpty) return;
    
    const isNullable = options.nullable ?? isOptional;
    
    if (isNullable) {
      IsOptional()(target, propertyKey);
    } else if (!adapterOptions?.skipRequired) {
      IsNotEmpty()(target, propertyKey);
    }
  }
  
  private applyTypeValidators(
    target: any,
    propertyKey: string | symbol,
    type: any,
    options: any,
    adapterOptions: any
  ): void {
    // String validators
    if (type === String && IsString) {
      IsString()(target, propertyKey);
      
      if ((options.email || adapterOptions?.email) && IsEmail) {
        IsEmail(adapterOptions?.emailOptions || {})(target, propertyKey);
      }
      if ((options.url || adapterOptions?.url) && IsUrl) {
        IsUrl(adapterOptions?.urlOptions || {})(target, propertyKey);
      }
      if ((options.uuid || adapterOptions?.uuid) && IsUUID) {
        IsUUID(adapterOptions?.uuidVersion || '4')(target, propertyKey);
      }
      if ((options.json || adapterOptions?.json) && IsJSON) {
        IsJSON()(target, propertyKey);
      }
    }
    
    // Number validators
    else if (type === Number) {
      if ((options.integer || adapterOptions?.integer) && IsInt) {
        IsInt()(target, propertyKey);
      } else if (IsNumber) {
        IsNumber(adapterOptions?.numberOptions || {})(target, propertyKey);
      }
      
      if ((options.positive || adapterOptions?.positive) && IsPositive) {
        IsPositive()(target, propertyKey);
      }
      if ((options.negative || adapterOptions?.negative) && IsNegative) {
        IsNegative()(target, propertyKey);
      }
    }
    
    // Boolean validators
    else if (type === Boolean && IsBoolean) {
      IsBoolean()(target, propertyKey);
    }
    
    // Date validators
    else if (type === Date && IsDate) {
      IsDate()(target, propertyKey);
    }
    
    // Array validators
    else if ((Array.isArray(type) || adapterOptions?.isArray) && IsArray) {
      IsArray()(target, propertyKey);
      
      if (adapterOptions?.arrayType && ValidateNested && Type) {
        ValidateNested({ each: true })(target, propertyKey);
        Type(() => adapterOptions.arrayType)(target, propertyKey);
      }
    }
    
    // Enum validators - use IsIn for arrays, IsEnum for actual enum types
    else if (options.enum || adapterOptions?.enum) {
      const enumType = options.enum || adapterOptions.enum;
      
      if (Array.isArray(enumType) && IsIn) {
        // For array of values like ['pending', 'paid', 'cancelled']
        IsIn(enumType)(target, propertyKey);
      } else if (IsEnum && typeof enumType === 'object') {
        // For actual TypeScript enums
        IsEnum(enumType)(target, propertyKey);
      }
    }
    
    // Object validators
    else if (type && typeof type === 'function' && !this.isPrimitiveType(type)) {
      if (IsObject) {
        IsObject()(target, propertyKey);
      }
      if (ValidateNested) {
        ValidateNested()(target, propertyKey);
      }
    }
  }
  
  private applyConstraintValidators(
    target: any,
    propertyKey: string | symbol,
    type: any,
    options: any,
    adapterOptions: any
  ): void {
    // String constraints
    if (type === String) {
      if (options.minLength !== undefined && MinLength) {
        MinLength(options.minLength)(target, propertyKey);
      }
      if (options.maxLength !== undefined && MaxLength) {
        MaxLength(options.maxLength)(target, propertyKey);
      }
      if (options.pattern && Matches) {
        Matches(options.pattern)(target, propertyKey);
      }
    }
    
    // Number constraints
    if (type === Number) {
      if (options.min !== undefined && Min) {
        Min(options.min)(target, propertyKey);
      }
      if (options.max !== undefined && Max) {
        Max(options.max)(target, propertyKey);
      }
    }
    
    // Array constraints
    if ((Array.isArray(type) || adapterOptions?.isArray)) {
      if ((options.minSize !== undefined || adapterOptions?.minSize !== undefined) && ArrayMinSize) {
        ArrayMinSize(options.minSize || adapterOptions.minSize)(target, propertyKey);
      }
      if ((options.maxSize !== undefined || adapterOptions?.maxSize !== undefined) && ArrayMaxSize) {
        ArrayMaxSize(options.maxSize || adapterOptions.maxSize)(target, propertyKey);
      }
    }
  }
  
  private applyCustomValidators(
    target: any,
    propertyKey: string | symbol,
    adapterOptions: any
  ): void {
    if (adapterOptions?.validators && Array.isArray(adapterOptions.validators)) {
      adapterOptions.validators.forEach((validator: any) => {
        if (typeof validator === 'function') {
          // Apply validator directly as a decorator function
          validator(target, propertyKey);
        }
      });
    }
  }
  
  private applyArrayValidators(
    target: any,
    propertyKey: string | symbol,
    type: any,
    options: any,
    adapterOptions: any
  ): void {
    // Check if this is an array type
    const arrayInfo = detectArrayInfo(target, propertyKey);
    
    if (arrayInfo.isArray && IsArray) {
      IsArray()(target, propertyKey);
      
      // Apply ValidateNested for object arrays
      if (ValidateNested) {
        ValidateNested({ each: true })(target, propertyKey);
      }
      
      // Apply Type decorator for array element transformation
      if (Type && adapterOptions?.isArray) {
        // Try to get the array element type from GraphQL configuration
        if (adapterOptions.arrayType && typeof adapterOptions.arrayType === 'function') {
          try {
            Type(adapterOptions.arrayType)(target, propertyKey);
          } catch (error) {
            console.warn(`[SolidNestJS] Failed to apply array Type decorator for ${String(propertyKey)}:`, error);
          }
        }
      }
    }
  }
  
  private isPrimitiveType(type: any): boolean {
    return [String, Number, Boolean, Date, Symbol, BigInt].includes(type);
  }
  
  private isAlreadyApplied(target: any, propertyKey: string | symbol): boolean {
    const applied = ValidationDecoratorAdapter.applied.get(target);
    return applied ? applied.has(propertyKey) : false;
  }
  
  private markAsApplied(target: any, propertyKey: string | symbol): void {
    let applied = ValidationDecoratorAdapter.applied.get(target);
    if (!applied) {
      applied = new Set();
      ValidationDecoratorAdapter.applied.set(target, applied);
    }
    applied.add(propertyKey);
  }
  
  // Class-level decorator support (no specific class decorators for validation)
  applyClassDecorator?(target: Function, type: 'entity' | 'input', options: any): void {
    // No class-level validation decorators needed
  }
}