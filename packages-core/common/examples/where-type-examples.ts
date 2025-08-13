/**
 * Examples demonstrating the corrected Where<T> type for array fields
 */

import { Where } from '../src/types/find-args.type';

// Example entities
interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  details: InvoiceDetail[];  // Array field
  client: Client;            // Non-array field
}

interface InvoiceDetail {
  id: number;
  productId: number;
  quantity: number;
  price: number;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

// ✅ FIXED: Array fields now work correctly
const whereExample: Where<Invoice> = {
  // Array field: details: InvoiceDetail[]
  // Before fix: Type error - couldn't filter by InvoiceDetail properties
  // After fix: Can filter by properties of the array elements
  details: {
    productId: 123,              // ✅ Works - filters by InvoiceDetail.productId
    quantity: { _gt: 5 },        // ✅ Works - uses NumberFilter
    price: { _between: [10, 50] } // ✅ Works - advanced filtering
  },
  
  // Non-array field: client: Client
  // Always worked, continues to work
  client: {
    name: 'John Doe',            // ✅ Works - filters by Client.name
    email: { _endswith: '@company.com' } // ✅ Works - uses StringFilter
  },
  
  // Primitive fields work as before
  id: 123,                       // ✅ Works - direct value
  invoiceNumber: { _startswith: 'INV-' }, // ✅ Works - StringFilter
  totalAmount: { _gte: 1000 },   // ✅ Works - NumberFilter
  
  // Logical operators work with corrected types
  _and: [
    { details: { productId: { _in: [123, 456] } } }, // ✅ Works - array filtering in _and
    { client: { name: { _contains: 'Corp' } } }      // ✅ Works - object filtering in _and
  ],
  
  _or: [
    { details: { quantity: { _gt: 100 } } },         // ✅ Works - array filtering in _or
    { totalAmount: { _lt: 500 } }                    // ✅ Works - primitive filtering in _or
  ]
};

// ✅ BEFORE vs AFTER comparison:

// BEFORE (Type Error):
// const brokenExample: Where<Invoice> = {
//   details: {
//     productId: 123  // ❌ TypeScript Error: Property 'productId' does not exist on type 'Where<InvoiceDetail[]>'
//   }
// };

// AFTER (Type Safe):
const fixedExample: Where<Invoice> = {
  details: {
    productId: 123,    // ✅ TypeScript Happy: Correctly infers Where<InvoiceDetail>
    quantity: { _gt: 5 } // ✅ TypeScript Happy: Supports advanced filtering
  }
};

// ✅ Real-world usage examples:

// Example 1: Find invoices with expensive items
const expensiveInvoices: Where<Invoice> = {
  details: {
    price: { _gte: 1000 }
  }
};

// Example 2: Find invoices with specific products AND high quantities
const specificProducts: Where<Invoice> = {
  details: {
    productId: { _in: [123, 456, 789] },
    quantity: { _gte: 10 }
  }
};

// Example 3: Complex filtering with logical operators
const complexExample: Where<Invoice> = {
  _and: [
    {
      details: {
        productId: 123,
        quantity: { _gt: 5 }
      }
    },
    {
      client: {
        name: { _contains: 'Premium' }
      }
    },
    {
      totalAmount: { _gte: 500 }
    }
  ]
};

// Example 4: OR conditions with mixed array and non-array fields
const mixedExample: Where<Invoice> = {
  _or: [
    { details: { productId: 123 } },           // Array field filter
    { client: { name: 'VIP Customer' } },      // Object field filter
    { totalAmount: { _gt: 5000 } }             // Primitive field filter
  ]
};

export {
  whereExample,
  fixedExample,
  expensiveInvoices,
  specificProducts,
  complexExample,
  mixedExample
};