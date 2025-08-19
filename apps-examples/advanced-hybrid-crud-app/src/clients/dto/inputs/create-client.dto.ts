import { SolidInput } from '@solid-nestjs/typeorm-hybrid-crud';
import { GenerateDtoFromEntity } from '@solid-nestjs/rest-graphql';
import { Client } from '../../entities/client.entity';

// Example 1: Using default rules (no configuration)
// This will include all flat properties (string, number, boolean, Date) except system fields
@SolidInput()
export class CreateClientDto extends GenerateDtoFromEntity(Client) {}

// Example 2: Using legacy array format (backward compatibility)
// @SolidInput()
// export class CreateClientDto extends GenerateDtoFromEntity(Client, [
//   'firstName',
//   'lastName',
//   'email',
//   'phone',
//   'address',
//   'city',
//   'country',
// ]) {}

// Example 3: Using new object format for fine control
// @SolidInput()
// export class CreateClientDto extends GenerateDtoFromEntity(Client, {
//   firstName: true, // Always include
//   lastName: true, // Always include
//   email: true, // Always include
//   phone: false, // Always exclude
//   address: undefined, // Use default rules (include if flat type)
//   city: true, // Always include
//   country: true, // Always include
//   id: false, // Always exclude
//   invoices: false, // Always exclude
//   // Properties not listed here will use default rules
// }) {}
