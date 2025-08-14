# Filtering by Multiplicative Relations Example

With the new implementation, you can now filter by fields in one-to-many and many-to-many relations without pagination issues.

## Example Usage

### Entity Setup
```typescript
// Invoice entity with one-to-many relation to InvoiceDetail
@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  invoiceNumber: string;

  @OneToMany(() => InvoiceDetail, detail => detail.invoice)
  details: InvoiceDetail[];
}

@Entity()
export class InvoiceDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Invoice, invoice => invoice.details)
  invoice: Invoice;
}
```

### Filtering Examples

#### 1. Find invoices that contain a specific product
```typescript
const args: FindInvoiceArgs = {
  where: {
    details: {
      productId: 123
    }
  },
  pagination: {
    page: 1,
    limit: 10
  }
};

const result = await invoiceService.findAll(context, args);
```

**Generated SQL (simplified):**
```sql
-- First query for pagination (gets IDs)
SELECT invoice.id FROM invoice 
WHERE EXISTS (
  SELECT 1 FROM invoice_detail 
  WHERE invoice_detail.invoice_id = invoice.id 
  AND invoice_detail.product_id = 123
)
LIMIT 10 OFFSET 0;

-- Second query for data (gets full records with relations)
SELECT * FROM invoice 
LEFT JOIN invoice_detail ON invoice_detail.invoice_id = invoice.id
WHERE invoice.id IN (/* IDs from first query */);
```

#### 2. Complex filtering with multiple conditions
```typescript
const args: FindInvoiceArgs = {
  where: {
    details: {
      productId: { _in: [123, 456] },
      quantity: { _gt: 5 }
    }
  }
};
```

**Generated SQL:**
```sql
WHERE EXISTS (
  SELECT 1 FROM invoice_detail 
  WHERE invoice_detail.invoice_id = invoice.id 
  AND invoice_detail.product_id IN (123, 456)
  AND invoice_detail.quantity > 5
)
```

#### 3. Combining with OR conditions
```typescript
const args: FindInvoiceArgs = {
  where: {
    _or: [
      { details: { productId: 123 } },
      { details: { quantity: { _gt: 100 } } }
    ]
  }
};
```

**Generated SQL:**
```sql
WHERE EXISTS (
  SELECT 1 FROM invoice_detail 
  WHERE invoice_detail.invoice_id = invoice.id 
  AND invoice_detail.product_id = 123
)
OR EXISTS (
  SELECT 1 FROM invoice_detail 
  WHERE invoice_detail.invoice_id = invoice.id 
  AND invoice_detail.quantity > 100
)
```

## Benefits

1. **Correct Pagination**: The EXISTS subquery doesn't multiply rows, so pagination works correctly
2. **Better Performance**: EXISTS is often more efficient than JOIN with DISTINCT
3. **Cleaner Code**: No need to manually handle the complexity of multiplicative joins
4. **Maintains Compatibility**: Non-multiplicative relations still use regular JOINs

## Limitations

- **Ordering**: You still cannot order by fields in multiplicative relations (this would require aggregation strategies)
- **Selection**: The filtering only affects the WHERE clause; the actual data fetching still uses the two-phase approach

## Migration Guide

No changes are needed to existing code. The framework automatically detects multiplicative relations and applies the EXISTS strategy when appropriate.