import { registerEnumType } from '@nestjs/graphql';
import { AggregateFunctionTypes as AggregateFunctionTypesEnum } from '@solid-nestjs/common';

/**
 * GraphQL enum registration for aggregate function types.
 * This allows the enum to be used in GraphQL schemas and queries.
 */
registerEnumType(AggregateFunctionTypesEnum, {
  name: 'AggregateFunctionTypes',
  description: 'Available aggregate functions for groupBy operations',
  valuesMap: {
    COUNT: {
      description: 'Count of non-null values',
    },
    SUM: {
      description: 'Sum of numeric values',
    },
    AVG: {
      description: 'Average of numeric values',
    },
    MIN: {
      description: 'Minimum value',
    },
    MAX: {
      description: 'Maximum value',
    },
    COUNT_DISTINCT: {
      description: 'Count of distinct values',
    },
  },
});

// Re-export the enum for convenience
export { AggregateFunctionTypesEnum as AggregateFunctionTypes };