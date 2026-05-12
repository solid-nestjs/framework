# Database Support

SOLID NestJS supports four database backends via TypeORM, with SQLite as the zero-config default for development and testing.

## Multi-Database Overview

| Feature | SQLite | PostgreSQL | MySQL | SQL Server |
|---|---|---|---|---|
| Basic CRUD | ✅ | ✅ | ✅ | ✅ |
| GraphQL | ✅ | ✅ | ✅ | ✅ |
| Soft Deletion | ✅ | ✅ | ✅ | ✅ |
| Bulk Operations | ✅ | ⚠️¹ | ⚠️¹ | ✅ |
| GROUP BY | ✅ | ✅ | ✅ | ✅ |
| Composite Keys | ✅ | ✅ | ✅ | ✅ |
| Relations | ✅ | ✅ | ✅ | ✅ |

¹ Bulk operations using camelCase column filters are skipped (TypeORM identifier quoting issue).

## SQLite (Default)

No configuration required. SQLite is used out of the box for development and testing:

```typescript
// app.module.ts — no DB config needed
@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    autoLoadEntities: true,
  })],
})
```

## PostgreSQL

### Docker Setup

```bash
docker run -e POSTGRES_PASSWORD=pgpass -p 5432:5432 -d postgres:15-alpine
```

### Connection Config

```typescript
{
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'my_app',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
}
```

### Known Issues

- **CamelCase identifier quoting**: TypeORM may generate unquoted identifiers for camelCase columns in bulk operations. Example: `WHERE supplier.contactEmail = $1` instead of `"supplier"."contactEmail" = $1`. Use snake_case columns or avoid bulk operations filtering on camelCase fields.
- **Aggregation return types**: COUNT/SUM may return strings. The framework's test helpers (`expectCount()`, `expectNumericValue()`) handle both types.

### Test Commands

```bash
docker-compose up -d postgres
npm run test:e2e:postgres
```

Uses `TRUNCATE ... CASCADE` for data cleanup.

## MySQL

### Docker Setup

```bash
docker run -e MYSQL_ROOT_PASSWORD=mysqlpass -p 3306:3306 -d mysql:8.0
```

### Connection Config

```typescript
{
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'my_app',
  charset: 'utf8mb4',
  timezone: '+00:00',
}
```

### Known Issues

- **CamelCase identifier quoting** — Same limitation as PostgreSQL for bulk operations.
- **Aggregation return types** — Like PostgreSQL, MySQL returns aggregate values as strings.
- **Data cleanup** — Uses `SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE ...; SET FOREIGN_KEY_CHECKS = 1;`.

### Test Commands

```bash
docker-compose up -d mysql
npm run test:e2e:mysql
```

## SQL Server

### Docker Setup

```bash
docker pull mcr.microsoft.com/mssql/server:2022-latest
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourPassword123!" \
  -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

### Connection Config

```typescript
{
  type: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  username: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'my_app',
  options: { encrypt: false, trustServerCertificate: true },
}
```

### Known Issues

- **UUID format**: SQL Server requires valid UUID format for UNIQUEIDENTIFIER columns. Generate valid UUIDs with `crypto.randomUUID()`.
- **Test database**: Framework automatically appends `_test` to the database name for E2E tests.
- **Isolation**: The framework configures `ALLOW_SNAPSHOT_ISOLATION` and `READ_COMMITTED_SNAPSHOT` automatically.
- **Test parallelism**: Use `maxWorkers: 1` for SQL Server to avoid conflicts.

### Test Commands

```bash
docker-compose up -d sqlserver
npm run test:e2e
```

### CI/CD (GitHub Actions)

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    env:
      ACCEPT_EULA: Y
      MSSQL_SA_PASSWORD: TestPassword123!
    ports:
      - 1433:1433
```

## Composite Primary Keys

### Key Class Definition

```typescript
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { PrimaryColumn } from 'typeorm';

@InputType()
@ObjectType('ProductId')
export class ProductId {
  @Field(() => ID)
  @PrimaryColumn()
  type: string;

  @Field(() => ID)
  @PrimaryColumn()
  code: number;
}
```

### Entity Configuration

```typescript
import { AutoIncrement } from '@solid-nestjs/typeorm';

@ObjectType()
@Entity()
@AutoIncrement<ProductId>('code')
export class Product {
  @Field(() => ProductId)
  get id(): ProductId {
    return { type: this.type, code: this.code };
  }
  set id(value: ProductId) {
    this.type = value.type;
    this.code = value.code;
  }

  @PrimaryColumn() type: string;
  @PrimaryColumn() code: number;

  @Field() @Column() name: string;
  @Field(() => Float) @Column('decimal', { precision: 10, scale: 2 }) price: number;
}
```

### Relationships with Composite Keys

```typescript
@Entity()
export class Order {
  @PrimaryGeneratedColumn() id: number;

  @Column({ nullable: true }) product_type: string;
  @Column({ nullable: true }) product_code: number;

  @Field(() => Product, { nullable: true })
  @JoinColumn([
    { name: 'product_type', referencedColumnName: 'type' },
    { name: 'product_code', referencedColumnName: 'code' },
  ])
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;
}
```

### Common Patterns

- **Type + Auto-Increment Code**: User provides `type`, system generates sequential `code`.
- **Multi-Tenant**: `{ tenant_id: "acme", user_id: 123 }`.
- **Time-based**: `{ device_id: "sensor_01", timestamp: "2024-01-15T10:30:00Z" }`.

## Database-Specific Notes

| Concern | Postgres | MySQL | SQL Server | SQLite |
|---|---|---|---|---|
| ID quoting | `"id"` | `` `id` `` | `[id]` | `"id"` |
| CamelCase bulk | ⚠️ Skip | ⚠️ Skip | ✅ | ✅ |
| Aggregates as strings | ✅ | ✅ | — | — |
| Cleanup strategy | TRUNCATE CASCADE | TRUNCATE (FK checks off) | TRUNCATE | In-memory reset |
| Default charset | UTF8 | utf8mb4 | NVARCHAR | — |
| Test DB suffix | (env) | (env) | `_test` | — |
