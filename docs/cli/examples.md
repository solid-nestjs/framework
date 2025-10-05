# SNEST CLI Examples

Real-world examples and patterns for using the SNEST CLI to build SOLID NestJS applications.

## Table of Contents

- [Basic Examples](#basic-examples)
- [E-commerce Application](#e-commerce-application)
- [Blog Platform](#blog-platform)
- [Task Management System](#task-management-system)
- [Social Media API](#social-media-api)
- [Advanced Patterns](#advanced-patterns)
- [Testing Examples](#testing-examples)

## Basic Examples

### Simple CRUD Resource

Generate a complete CRUD resource for a basic entity:

```bash
# Create the entity
snest generate entity Book --fields "title:string,author:string,isbn:string,publishedDate:Date,pages:number"

# Create the service
snest generate service Books --entity-name Book --with-bulk-operations

# Create the controller
snest generate controller Books --entity-name Book --service-name Books --with-validation

# Create the module
snest generate module Books --entities "Book" --services "Books" --controllers "Books"
```

**Generated API Endpoints:**
- `GET /books` - List all books
- `GET /books/:id` - Get book by ID
- `POST /books` - Create new book
- `PATCH /books/:id` - Update book
- `DELETE /books/:id` - Delete book
- `POST /books/bulk` - Create multiple books
- `PATCH /books/bulk` - Update multiple books
- `DELETE /books/bulk` - Delete multiple books

### Entity with Soft Deletion

Create an entity that supports soft deletion:

```bash
# Generate entity with soft delete
snest generate entity Product --fields "name:string,price:number,description:string:optional,categoryId:number" --with-soft-delete

# Generate service with soft delete support
snest generate service Products --entity-name Product --with-soft-delete --with-bulk-operations

# Generate controller with soft delete endpoints
snest generate controller Products --entity-name Product --with-soft-delete --with-validation
```

**Additional API Endpoints:**
- `DELETE /products/:id` - Soft delete product
- `POST /products/:id/recover` - Recover soft-deleted product
- `DELETE /products/:id/hard` - Permanently delete product

## E-commerce Application

### Complete E-commerce Setup

```bash
# Create the project
snest new ecommerce-api --database postgres --type hybrid --package-manager yarn

cd ecommerce-api

# Generate User Management
snest g entity User --fields "email:string,password:string,firstName:string,lastName:string,role:string,phoneNumber:string:optional,isActive:boolean" --with-soft-delete

snest g service Users --entity-name User --with-args-helpers --with-soft-delete

snest g controller Users --entity-name User --with-validation --with-guards --with-soft-delete

# Generate Category System
snest g entity Category --fields "name:string,description:string:optional,parentId:number:optional,isActive:boolean"

snest g service Categories --entity-name Category --with-bulk-operations

snest g controller Categories --entity-name Category --with-validation

# Generate Product Catalog
snest g entity Product --fields "name:string,description:string,price:number,sku:string,stock:number,categoryId:number,weight:number:optional,dimensions:string:optional,isActive:boolean" --with-soft-delete

snest g service Products --entity-name Product --relations "category:manyToOne:Category:eager" --with-bulk-operations --with-soft-delete --with-args-helpers

snest g controller Products --entity-name Product --with-validation --with-bulk-operations --with-soft-delete

# Generate Shopping Cart
snest g entity CartItem --fields "userId:number,productId:number,quantity:number,addedAt:Date"

snest g service Cart --entity-name CartItem --relations "user:manyToOne:User,product:manyToOne:Product:eager"

snest g controller Cart --entity-name CartItem --service-name Cart --with-validation

# Generate Order System
snest g entity Order --fields "userId:number,totalAmount:number,status:string,shippingAddress:string,billingAddress:string,orderDate:Date,shippedDate:Date:optional,deliveredDate:Date:optional" --with-soft-delete

snest g entity OrderItem --fields "orderId:number,productId:number,quantity:number,unitPrice:number,totalPrice:number"

snest g service Orders --entity-name Order --relations "user:manyToOne:User,items:oneToMany:OrderItem:cascade" --with-soft-delete --with-args-helpers

snest g service OrderItems --entity-name OrderItem --relations "order:manyToOne:Order,product:manyToOne:Product:eager"

snest g controller Orders --entity-name Order --with-validation --with-guards --with-soft-delete

# Generate Payment System  
snest g entity Payment --fields "orderId:number,amount:number,method:string,status:string,transactionId:string,processedAt:Date,failureReason:string:optional"

snest g service Payments --entity-name Payment --relations "order:manyToOne:Order:eager" --with-args-helpers

snest g controller Payments --entity-name Payment --with-validation --with-guards

# Generate modules
snest g module Users --entities "User" --services "Users" --controllers "Users"
snest g module Products --entities "Product,Category" --services "Products,Categories" --controllers "Products,Categories"
snest g module Orders --entities "Order,OrderItem,Payment" --services "Orders,OrderItems,Payments" --controllers "Orders,Payments"
snest g module Cart --entities "CartItem" --services "Cart" --controllers "Cart"
```

### E-commerce API Structure

After generation, your e-commerce API will have:

**User Management:**
- User registration and authentication
- Profile management with soft deletion
- Role-based access control

**Product Catalog:**
- Category hierarchy
- Product management with inventory
- Advanced product search and filtering
- Bulk product operations

**Shopping Experience:**
- Shopping cart management
- Order processing workflow
- Payment handling
- Order history and tracking

**Generated Endpoints:**
```
# Users
POST   /users/register
POST   /users/login
GET    /users/profile
PATCH  /users/profile
DELETE /users/account

# Products
GET    /products              # With filtering, sorting, pagination
GET    /products/:id
POST   /products              # Admin only
PATCH  /products/:id          # Admin only
DELETE /products/:id          # Soft delete
POST   /products/bulk         # Bulk operations

# Categories
GET    /categories
GET    /categories/:id/products
POST   /categories            # Admin only
PATCH  /categories/:id        # Admin only

# Cart
GET    /cart                  # User's cart
POST   /cart/items           # Add to cart
PATCH  /cart/items/:id       # Update quantity
DELETE /cart/items/:id       # Remove from cart
DELETE /cart                 # Clear cart

# Orders  
GET    /orders               # User's orders
GET    /orders/:id           # Order details
POST   /orders               # Create order
PATCH  /orders/:id/status    # Update status (admin)
GET    /orders/:id/track     # Track order

# Payments
POST   /payments             # Process payment
GET    /payments/:id         # Payment details
POST   /payments/:id/refund  # Refund payment
```

## Blog Platform

### Blog Application Setup

```bash
# Create project
snest new blog-api --database mysql --type hybrid

cd blog-api

# Generate Author/User System
snest g entity Author --fields "username:string,email:string,password:string,firstName:string,lastName:string,bio:string:optional,avatar:string:optional,isActive:boolean,joinedAt:Date" --with-soft-delete

snest g service Authors --entity-name Author --with-args-helpers --with-soft-delete

snest g controller Authors --entity-name Author --with-validation --with-guards

# Generate Category System
snest g entity Category --fields "name:string,slug:string,description:string:optional,color:string:optional,isActive:boolean"

snest g service Categories --entity-name Category

snest g controller Categories --entity-name Category --with-validation

# Generate Tag System
snest g entity Tag --fields "name:string,slug:string,color:string:optional"

snest g service Tags --entity-name Tag --with-bulk-operations

snest g controller Tags --entity-name Tag --with-validation

# Generate Post System
snest g entity Post --fields "title:string,slug:string,content:string,excerpt:string:optional,featuredImage:string:optional,authorId:number,categoryId:number,status:string,publishedAt:Date:optional,viewCount:number,likesCount:number,commentsCount:number,isCommentingEnabled:boolean" --with-soft-delete

snest g service Posts --entity-name Post --relations "author:manyToOne:Author:eager,category:manyToOne:Category:eager,tags:manyToMany:Tag,comments:oneToMany:Comment" --with-soft-delete --with-args-helpers

snest g controller Posts --entity-name Post --with-validation --with-soft-delete

# Generate Comment System
snest g entity Comment --fields "content:string,postId:number,authorId:number,parentId:number:optional,isApproved:boolean,createdAt:Date" --with-soft-delete

snest g service Comments --entity-name Comment --relations "post:manyToOne:Post,author:manyToOne:Author:eager,parent:manyToOne:Comment:optional,replies:oneToMany:Comment" --with-soft-delete

snest g controller Comments --entity-name Comment --with-validation --with-guards

# Generate Like System
snest g entity Like --fields "postId:number,authorId:number,createdAt:Date"

snest g service Likes --entity-name Like --relations "post:manyToOne:Post,author:manyToOne:Author"

snest g controller Likes --entity-name Like --with-validation --with-guards

# Generate modules
snest g module Blog --entities "Author,Category,Tag,Post,Comment,Like" --services "Authors,Categories,Tags,Posts,Comments,Likes" --controllers "Authors,Categories,Tags,Posts,Comments,Likes"
```

### Blog API Features

**Content Management:**
- Rich text posts with categories and tags
- Draft and published states
- Featured images and excerpts
- SEO-friendly slugs

**User Interaction:**
- Threaded commenting system
- Like/unlike posts
- Author profiles and bios
- User authentication

**Administration:**
- Content moderation
- Comment approval
- User management
- Analytics (view counts, likes)

## Task Management System

### Project Setup

```bash
# Create project
snest new task-manager --database postgres --type rest

cd task-manager

# Generate User/Team System
snest g entity User --fields "email:string,password:string,firstName:string,lastName:string,avatar:string:optional,isActive:boolean" --with-soft-delete

snest g entity Team --fields "name:string,description:string:optional,ownerId:number,isActive:boolean"

snest g entity TeamMember --fields "teamId:number,userId:number,role:string,joinedAt:Date"

# Generate Project System
snest g entity Project --fields "name:string,description:string:optional,teamId:number,ownerId:number,status:string,startDate:Date:optional,endDate:Date:optional,priority:string,color:string:optional" --with-soft-delete

# Generate Task System
snest g entity Task --fields "title:string,description:string:optional,projectId:number,assigneeId:number:optional,creatorId:number,status:string,priority:string,dueDate:Date:optional,estimatedHours:number:optional,actualHours:number:optional,tags:string:optional" --with-soft-delete

snest g entity TaskComment --fields "taskId:number,userId:number,content:string,createdAt:Date"

snest g entity TaskAttachment --fields "taskId:number,fileName:string,filePath:string,fileSize:number,uploadedBy:number,uploadedAt:Date"

# Generate Time Tracking
snest g entity TimeEntry --fields "taskId:number,userId:number,description:string:optional,startTime:Date,endTime:Date:optional,duration:number:optional,billable:boolean"

# Generate services with relations
snest g service Users --entity-name User --with-args-helpers --with-soft-delete

snest g service Teams --entity-name Team --relations "owner:manyToOne:User:eager,members:oneToMany:TeamMember,projects:oneToMany:Project"

snest g service Projects --entity-name Project --relations "team:manyToOne:Team:eager,owner:manyToOne:User:eager,tasks:oneToMany:Task" --with-soft-delete --with-args-helpers

snest g service Tasks --entity-name Task --relations "project:manyToOne:Project:eager,assignee:manyToOne:User:eager,creator:manyToOne:User:eager,comments:oneToMany:TaskComment,attachments:oneToMany:TaskAttachment,timeEntries:oneToMany:TimeEntry" --with-soft-delete --with-args-helpers

snest g service TimeTracking --entity-name TimeEntry --relations "task:manyToOne:Task:eager,user:manyToOne:User:eager" --with-args-helpers

# Generate controllers
snest g controller Users --entity-name User --with-validation --with-guards
snest g controller Teams --entity-name Team --with-validation --with-guards  
snest g controller Projects --entity-name Project --with-validation --with-guards
snest g controller Tasks --entity-name Task --with-validation --with-guards
snest g controller TimeTracking --entity-name TimeEntry --service-name TimeTracking --with-validation --with-guards

# Generate modules
snest g module Users --entities "User" --services "Users" --controllers "Users"
snest g module Teams --entities "Team,TeamMember" --services "Teams" --controllers "Teams"
snest g module Projects --entities "Project,Task,TaskComment,TaskAttachment" --services "Projects,Tasks" --controllers "Projects,Tasks"
snest g module TimeTracking --entities "TimeEntry" --services "TimeTracking" --controllers "TimeTracking"
```

### Task Management Features

**Team Collaboration:**
- Team creation and member management
- Role-based permissions
- Project assignment to teams

**Project Management:**
- Project creation with status tracking
- Priority and deadline management
- Color-coded organization

**Task Management:**
- Task assignment and status updates
- Priority levels and due dates
- Time estimation vs actual tracking
- Comments and attachments

**Time Tracking:**
- Start/stop timers
- Manual time entry
- Billable hours tracking
- Time reports and analytics

## Social Media API

### Setup

```bash
# Create project
snest new social-api --database postgres --type graphql

cd social-api

# Generate User System
snest g entity User --fields "username:string,email:string,password:string,firstName:string,lastName:string,bio:string:optional,avatar:string:optional,coverPhoto:string:optional,birthDate:Date:optional,location:string:optional,website:string:optional,isVerified:boolean,isPrivate:boolean,followersCount:number,followingCount:number,postsCount:number" --with-soft-delete

# Generate Follow System
snest g entity Follow --fields "followerId:number,followingId:number,createdAt:Date"

# Generate Post System
snest g entity Post --fields "content:string,authorId:number,mediaUrls:string:optional,location:string:optional,likesCount:number,commentsCount:number,sharesCount:number,isPublic:boolean,createdAt:Date" --with-soft-delete

# Generate Interaction System
snest g entity Like --fields "userId:number,postId:number,createdAt:Date"

snest g entity Comment --fields "content:string,postId:number,authorId:number,parentId:number:optional,likesCount:number,createdAt:Date" --with-soft-delete

snest g entity Share --fields "userId:number,postId:number,comment:string:optional,createdAt:Date"

# Generate Messaging System
snest g entity Conversation --fields "isGroup:boolean,name:string:optional,lastMessageAt:Date:optional,createdAt:Date"

snest g entity ConversationMember --fields "conversationId:number,userId:number,joinedAt:Date,lastReadAt:Date:optional,role:string:optional"

snest g entity Message --fields "conversationId:number,senderId:number,content:string,messageType:string,mediaUrl:string:optional,replyToId:number:optional,isEdited:boolean,createdAt:Date" --with-soft-delete

# Generate Notification System
snest g entity Notification --fields "userId:number,type:string,title:string,content:string,relatedEntityType:string:optional,relatedEntityId:number:optional,isRead:boolean,createdAt:Date"

# Generate services
snest g service Users --entity-name User --relations "followers:oneToMany:Follow,following:oneToMany:Follow,posts:oneToMany:Post" --with-args-helpers --with-soft-delete

snest g service Posts --entity-name Post --relations "author:manyToOne:User:eager,likes:oneToMany:Like,comments:oneToMany:Comment,shares:oneToMany:Share" --with-args-helpers --with-soft-delete

snest g service Social --entity-name Follow --relations "follower:manyToOne:User:eager,following:manyToOne:User:eager"

snest g service Interactions --entity-name Like --relations "user:manyToOne:User:eager,post:manyToOne:Post"

snest g service Comments --entity-name Comment --relations "author:manyToOne:User:eager,post:manyToOne:Post,parent:manyToOne:Comment,replies:oneToMany:Comment" --with-soft-delete

snest g service Messaging --entity-name Message --relations "conversation:manyToOne:Conversation,sender:manyToOne:User:eager" --with-args-helpers

snest g service Notifications --entity-name Notification --relations "user:manyToOne:User" --with-args-helpers

# Generate GraphQL controllers (resolvers)
snest g controller Users --entity-name User --type graphql --with-validation --with-guards
snest g controller Posts --entity-name Post --type graphql --with-validation --with-guards  
snest g controller Social --entity-name Follow --service-name Social --type graphql --with-validation --with-guards
snest g controller Messaging --entity-name Message --service-name Messaging --type graphql --with-validation --with-guards

# Generate modules
snest g module Social --entities "User,Follow,Post,Like,Comment,Share" --services "Users,Posts,Social,Interactions,Comments" --controllers "Users,Posts,Social"
snest g module Messaging --entities "Conversation,ConversationMember,Message" --services "Messaging" --controllers "Messaging"
snest g module Notifications --entities "Notification" --services "Notifications"
```

### Social Media Features

**User Profiles:**
- Customizable profiles with bio, avatar, cover photo
- Privacy settings (public/private accounts)
- Verification badges
- User statistics (followers, following, posts)

**Social Interactions:**
- Follow/unfollow users
- Post creation with media attachments
- Like, comment, and share posts
- Threaded comments

**Messaging:**
- Direct messages between users
- Group conversations
- Message types (text, media, etc.)
- Read receipts and online status

**Notifications:**
- Real-time notifications for interactions
- Customizable notification preferences
- Push notification support

## Advanced Patterns

### Multi-tenant Application

```bash
# Generate tenant-aware entities
snest g entity Tenant --fields "name:string,domain:string,plan:string,isActive:boolean,createdAt:Date"

snest g entity User --fields "email:string,password:string,firstName:string,lastName:string,tenantId:number,role:string" --with-soft-delete

snest g entity Product --fields "name:string,price:number,description:string,tenantId:number,categoryId:number" --with-soft-delete

# Generate services with tenant isolation
snest g service Tenants --entity-name Tenant --with-args-helpers

snest g service Users --entity-name User --relations "tenant:manyToOne:Tenant:eager" --with-args-helpers --with-soft-delete

snest g service Products --entity-name Product --relations "tenant:manyToOne:Tenant" --with-bulk-operations --with-soft-delete
```

### Event Sourcing Pattern

```bash
# Generate event store
snest g entity Event --fields "aggregateId:string,aggregateType:string,eventType:string,eventData:string,version:number,occurredAt:Date"

snest g entity Snapshot --fields "aggregateId:string,aggregateType:string,data:string,version:number,createdAt:Date"

# Generate event services
snest g service EventStore --entity-name Event --with-args-helpers

snest g service Snapshots --entity-name Snapshot --relations "events:oneToMany:Event"
```

### Microservices Communication

```bash
# Generate message entities
snest g entity OutboxEvent --fields "eventType:string,payload:string,status:string,createdAt:Date,processedAt:Date:optional"

snest g entity InboxEvent --fields "eventId:string,eventType:string,payload:string,status:string,receivedAt:Date,processedAt:Date:optional"

# Generate messaging services
snest g service Outbox --entity-name OutboxEvent --with-args-helpers

snest g service Inbox --entity-name InboxEvent --with-args-helpers
```

## Testing Examples

### Unit Test Generation

While SNEST CLI doesn't generate tests automatically, here are patterns for testing generated components:

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all users', async () => {
    const users = [{ id: 1, name: 'John', email: 'john@example.com' }];
    jest.spyOn(repository, 'find').mockResolvedValue(users as User[]);

    const result = await service.findAll();
    expect(result).toEqual(users);
  });
});
```

### E2E Test Patterns

```typescript
// users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect('Content-Type', /json/);
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
      })
      .expect(201);
  });
});
```

## Performance Optimization Examples

### Database Optimization

```bash
# Generate entities with proper indexing
snest g entity User --fields "email:string,username:string,createdAt:Date"

# Then manually add indexes in the entity:
# @Index(['email'])
# @Index(['username'])
# @Index(['createdAt'])
```

### Caching Layer

```bash
# Generate cache-related entities
snest g entity CacheEntry --fields "key:string,value:string,expiresAt:Date:optional,createdAt:Date"

snest g service Cache --entity-name CacheEntry --with-args-helpers
```

### Rate Limiting

```bash
# Generate rate limit tracking
snest g entity RateLimit --fields "identifier:string,endpoint:string,count:number,windowStart:Date,lastRequest:Date"

snest g service RateLimit --entity-name RateLimit --with-args-helpers
```

## Conclusion

These examples demonstrate the power and flexibility of the SNEST CLI for generating complete, production-ready applications. The CLI handles the boilerplate code, allowing you to focus on business logic and unique features.

### Key Benefits Demonstrated:

- 🚀 **Rapid Development** - Complete applications in minutes
- 🏗️ **Consistent Architecture** - SOLID patterns throughout
- 🔄 **Automatic Updates** - Module management with AST
- 📚 **Rich Features** - Soft deletion, bulk operations, relations
- 🎯 **Type Safety** - Full TypeScript integration
- 📖 **Documentation** - Automatic API documentation

Use these examples as starting points for your own applications, and customize them to fit your specific requirements!