# CLI Testing Guide - SOLID NestJS Framework

Esta guía te mostrará cómo probar el CLI del framework SOLID NestJS para crear aplicaciones completas con entidades, DTOs, servicios y controladores usando el estándar SOLID, incluyendo soporte para módulos y generación completa de recursos.

## 🚀 Comandos para Probar el CLI

### **1. Crear una Nueva Aplicación**

```bash
# Ir al directorio de pruebas
cd packages-tools/snest-cli/test-output

# Crear nueva aplicación REST con SQLite
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" new mi-tienda --type rest --database sqlite --skip-install
```

### **2. Instalar Dependencias**

```bash
# Entrar al directorio de la aplicación
cd mi-tienda

# Instalar dependencias
npm install
```

### **3. Generar Entidades**

```bash
# Generar entidad Product con campos
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate entity Product --fields "name:string,price:number,description:string:optional,category:string"

# Generar entidad Category
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate entity Category --fields "name:string,code:string,active:boolean"

# Generar entidad Order
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate entity Order --fields "total:number,status:string,customerEmail:string"
```

### **4. Generar Servicios (con DTOs automáticos)**

```bash
# Generar servicio Products (creará automáticamente los DTOs)
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate service Products

# Generar servicio Categories
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate service Categories

# Generar servicio Orders  
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate service Orders
```

### **5. Generar Controladores REST**

```bash
# Generar controlador Products
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate controller Products

# Generar controlador Categories
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate controller Categories

# Generar controlador Orders
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate controller Orders
```

### **6. Generar Recursos Completos (🆕 NUEVO)**

El comando `resource` genera todo de una vez (entity + service + controller + module):

```bash
# Generar recurso completo en módulo separado (recomendado)
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate resource Product --fields "name:string,price:number,description:string:optional"

# Generar recurso con módulo anidado
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate resource Order --fields "total:number,status:string,customerEmail:string" --module-path "e-commerce/orders"

# Generar recurso con opciones avanzadas
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate resource User --fields "email:string,name:string,active:boolean" --with-soft-delete --with-bulk-operations --module-path "auth/users"
```

### **7. Generar Solo Módulos (🆕 NUEVO)**

```bash
# Generar módulo para agrupar componentes existentes
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate module Inventory --entities "Product,Category" --services "Products,Categories" --controllers "Products,Categories"

# Generar módulo básico
"D:\NodeJS\solid-nestjs\framework\packages-tools\snest-cli\dist\cli.js" generate module Auth
```

### **8. Compilar y Ejecutar**

```bash
# Compilar la aplicación
npm run build

# Ejecutar en modo desarrollo
npm run start:dev
```

## 📁 Estructura de Archivos Generada

### **🆕 Nueva Estructura Modular (Recomendada)**

Con el comando `resource`, obtienes una estructura organizadas por módulos:

```
mi-tienda/
├── src/
│   ├── modules/
│   │   ├── product/                          # Módulo Product
│   │   │   ├── entities/
│   │   │   │   └── product.entity.ts         # @SolidEntity con decoradores SOLID
│   │   │   ├── dto/
│   │   │   │   └── inputs/
│   │   │   │       ├── create-product.dto.ts # extends GenerateDtoFromEntity(Product)
│   │   │   │       └── update-product.dto.ts # extends PartialType(CreateProductDto)
│   │   │   ├── services/
│   │   │   │   └── products.service.ts       # extends CrudServiceFrom(productsServiceStructure)
│   │   │   ├── controllers/
│   │   │   │   └── products.controller.ts    # extends CrudControllerFrom(productsControllerStructure)
│   │   │   └── product.module.ts             # Módulo NestJS completo
│   │   ├── e-commerce/                       # Módulos anidados
│   │   │   └── orders/
│   │   │       ├── entities/
│   │   │       │   └── order.entity.ts
│   │   │       ├── dto/
│   │   │       │   └── inputs/
│   │   │       │       ├── create-order.dto.ts
│   │   │       │       └── update-order.dto.ts
│   │   │       ├── services/
│   │   │       │   └── orders.service.ts
│   │   │       ├── controllers/
│   │   │       │   └── orders.controller.ts
│   │   │       └── order.module.ts
│   │   └── auth/                            # Módulos por dominio
│   │       └── users/
│   │           ├── entities/
│   │           │   └── user.entity.ts
│   │           ├── dto/...
│   │           ├── services/...
│   │           ├── controllers/...
│   │           └── user.module.ts
│   └── app.module.ts                        # Imports: ProductModule, OrderModule, etc.
```

### **📂 Estructura Clásica (Para compatibilidad)**

Si usas comandos individuales sin módulos:

```
mi-tienda/
├── src/
│   ├── entities/
│   │   ├── product.entity.ts      # @SolidEntity con decoradores SOLID
│   │   ├── category.entity.ts     # @SolidEntity con decoradores SOLID  
│   │   └── order.entity.ts        # @SolidEntity con decoradores SOLID
│   ├── dto/
│   │   └── inputs/
│   │       ├── create-product.dto.ts    # extends GenerateDtoFromEntity(Product)
│   │       ├── update-product.dto.ts    # extends PartialType(CreateProductDto)
│   │       ├── create-category.dto.ts   # extends GenerateDtoFromEntity(Category)
│   │       ├── update-category.dto.ts   # extends PartialType(CreateCategoryDto)
│   │       ├── create-order.dto.ts      # extends GenerateDtoFromEntity(Order)
│   │       └── update-order.dto.ts      # extends PartialType(CreateOrderDto)
│   ├── services/
│   │   ├── products.service.ts     # extends CrudServiceFrom(productsServiceStructure)
│   │   ├── categories.service.ts   # extends CrudServiceFrom(categoriesServiceStructure)
│   │   └── orders.service.ts       # extends CrudServiceFrom(ordersServiceStructure)
│   └── controllers/
│       ├── products.controller.ts  # extends CrudControllerFrom(productsControllerStructure)
│       ├── categories.controller.ts # extends CrudControllerFrom(categoriesControllerStructure)
│       └── orders.controller.ts     # extends CrudControllerFrom(ordersControllerStructure)
```

## 🔥 Características que Verás

### **Entidades con SOLID (Obligatorio)**
```typescript
@SolidEntity()
export class Product {
  @SolidId()
  id: number;

  @SolidField()
  name: string;
  
  @SolidField()
  price: number;

  @SolidField({nullable: true})
  description?: string;

  @SolidField()
  category: string;

  @SolidCreatedAt()
  createdAt: Date;

  @SolidUpdatedAt()
  updatedAt: Date;
}
```

### **DTOs con GenerateDtoFromEntity (Obligatorio)**
```typescript
// Create DTO - Inferencia automática de campos desde la entidad
export class CreateProductDto extends GenerateDtoFromEntity(Product) {}

// Update DTO - Usa PartialType para hacer todos los campos opcionales
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### **Servicios con Mixins SOLID**
```typescript
/**
 * Service structure configuration for Products
 */
export const productsServiceStructure = CrudServiceStructure({
  entityType: Product,
  createInputType: CreateProductDto,
  updateInputType: UpdateProductDto,
});

/**
 * Service for Products entity operations
 * 
 * This service extends the SOLID framework's CrudService with automatic CRUD operations.
 * It provides type-safe CRUD operations for Product entities.
 */
@Injectable()
export class ProductsService extends CrudServiceFrom(productsServiceStructure) {
  // Custom business logic methods can be added here
}
```

### **Controladores con Mixins SOLID**
```typescript
/**
 * Controller structure configuration for Products
 */
export const productsControllerStructure = CrudControllerStructure({
  ...productsServiceStructure,
  serviceType: ProductsService,
  operations: {
    findAll: true,
    findOne: true,
    create: true,
    update: true,
    remove: true,
  },
});

/**
 * REST Controller for Products entities
 * 
 * This controller extends the SOLID framework's CrudController with automatic REST endpoints.
 * It provides type-safe CRUD operations for Product entities.
 */
@Controller('products')
export class ProductsController extends CrudControllerFrom(productsControllerStructure) {
  // Automáticamente tiene todos los endpoints REST
}
```

## 🌐 Endpoints Automáticos

Una vez que la aplicación esté corriendo, tendrás automáticamente estos endpoints para cada entidad:

### **Products Endpoints**
- **GET** `/products` - Obtener todos los productos
- **GET** `/products/paginated` - Obtener productos paginados
- **GET** `/products/:id` - Obtener producto por ID
- **POST** `/products` - Crear producto
- **PUT** `/products/:id` - Actualizar producto
- **DELETE** `/products/:id` - Eliminar producto

### **Categories Endpoints**
- **GET** `/categories` - Obtener todas las categorías
- **GET** `/categories/paginated` - Obtener categorías paginadas
- **GET** `/categories/:id` - Obtener categoría por ID
- **POST** `/categories` - Crear categoría
- **PUT** `/categories/:id` - Actualizar categoría
- **DELETE** `/categories/:id` - Eliminar categoría

### **Orders Endpoints**
- **GET** `/orders` - Obtener todas las órdenes
- **GET** `/orders/paginated` - Obtener órdenes paginadas
- **GET** `/orders/:id` - Obtener orden por ID
- **POST** `/orders` - Crear orden
- **PUT** `/orders/:id` - Actualizar orden
- **DELETE** `/orders/:id` - Eliminar orden

## 📖 Swagger UI

Accede a `http://localhost:3000/api` para ver la documentación automática de la API con todos los endpoints, schemas y ejemplos.

## 🎯 Características Clave del Estándar SOLID

1. **Mixins Obligatorios**: Todos los servicios y controladores usan los mixins del framework SOLID
2. **Decoradores SOLID Obligatorios**: Todas las entidades usan `@SolidEntity`, `@SolidId`, `@SolidField`, etc.
3. **GenerateDtoFromEntity Obligatorio**: Todos los DTOs de creación usan inferencia automática
4. **PartialType para Updates**: Los DTOs de actualización usan `PartialType`
5. **Sin Código Manual**: No hay implementaciones manuales de TypeORM o endpoints REST
6. **Type-Safe**: Inferencia automática de tipos en toda la aplicación
7. **Automático**: Endpoints, validación, Swagger, todo generado automáticamente

## 🚨 Comandos de Limpieza (si es necesario)

```bash
# Limpiar puertos ocupados antes de ejecutar
powershell -ExecutionPolicy Bypass -File ".\scripts\cleanup-ports.ps1" -Port 3000

# Matar procesos Node.js después de probar
powershell -ExecutionPolicy Bypass -File ".\scripts\kill-all-node-except-claude.ps1"
```

¡Ahora tienes todo lo necesario para probar el CLI y generar aplicaciones completas con el estándar del framework SOLID NestJS!