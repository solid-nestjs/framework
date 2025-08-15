import { GraphQLScalarType, Kind, ValueNode } from 'graphql';

/**
 * The GraphQLJSON scalar type represents JSON values as specified by ECMA-404.
 * Based on the implementation from graphql-type-json, but integrated directly
 * into our framework to avoid external dependencies.
 */

function identity<T>(value: T): T {
  return value;
}

function ensureObject(value: any): Record<string, any> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError(
      `JSONObject cannot represent non-object value: ${value}`,
    );
  }
  return value;
}

function parseObject(ast: any, variables?: Record<string, any>): any {
  const value = Object.create(null);
  ast.fields.forEach((field: any) => {
    value[field.name.value] = parseLiteral(field.value, variables);
  });
  return value;
}

function parseLiteral(ast: ValueNode, variables?: Record<string, any>): any {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(ast, variables);
    case Kind.LIST:
      return ast.values.map((n) => parseLiteral(n, variables));
    case Kind.NULL:
      return null;
    case Kind.VARIABLE:
      return variables ? variables[ast.name.value] : undefined;
    default:
      return undefined;
  }
}

/**
 * GraphQL scalar type for arbitrary JSON values.
 * Can represent any JSON-serializable value including objects, arrays, strings, numbers, booleans, and null.
 */
export const GraphQLJSON = new GraphQLScalarType({
  name: 'JSON',
  description:
    'The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
  serialize: identity,
  parseValue: identity,
  parseLiteral: (ast, variables) => parseLiteral(ast, variables as Record<string, any> | undefined),
});

/**
 * GraphQL scalar type specifically for JSON objects (excludes arrays and primitives).
 * Ensures that only object values are accepted.
 */
export const GraphQLJSONObject = new GraphQLScalarType({
  name: 'JSONObject',
  description:
    'The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).',
  serialize: ensureObject,
  parseValue: ensureObject,
  parseLiteral: (ast, variables) => {
    if (ast.kind !== Kind.OBJECT) {
      throw new TypeError(
        `JSONObject cannot represent non-object value: ${ast.kind}`,
      );
    }
    return parseObject(ast, variables as Record<string, any> | undefined);
  },
});