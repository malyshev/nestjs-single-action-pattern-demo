# Customers Module - Single Action Pattern

## 🎯 Purpose

This module demonstrates the **"good practice"** approach in NestJS development - the **Single Action Pattern**. Each controller and service handles exactly one action, resulting in minimal dependencies, simple tests, and effortless maintenance. This serves as a learning example to showcase how to build scalable, maintainable NestJS applications.

## 📋 Module Overview

### What This Module Does
- **Customer Management**: Complete CRUD operations for customers
- **Email Confirmation**: Customer email verification workflow
- **Account Activation/Deactivation**: Customer account state management
- **Customer Search**: Search functionality with validation
- **Cross-Cutting Concerns**: Audit logging, analytics tracking, email notifications, in-app notifications

### Components
- **10 Controllers**: Each handling exactly one action
- **10 Services**: Each implementing exactly one business method
- **`Customer` Entity**: TypeORM entity with comprehensive customer data
- **DTOs**: Create and Update data transfer objects
- **Domain Exceptions**: Custom business logic exceptions

## ✨ Single Action Pattern Benefits

### 1. **Minimal Dependencies**
Each service has only the dependencies it actually needs:

```typescript
// ListCustomersService - only needs repository and audit
constructor(
  @InjectRepository(Customer) private customersRepository: Repository<Customer>,
  private auditService: AuditService,
  private analyticsService: AnalyticsService,
) {}

// GetCustomerService - only needs repository and audit
constructor(
  @InjectRepository(Customer) private customersRepository: Repository<Customer>,
  private auditService: AuditService,
) {}

// CreateCustomerService - needs repository and all cross-cutting concerns
constructor(
  @InjectRepository(Customer) private customersRepository: Repository<Customer>,
  private auditService: AuditService,
  private analyticsService: AnalyticsService,
  private mailingService: MailingService,
  private notificationsService: NotificationsService,
) {}
```

**Benefits:**
- **Clear dependencies** - each service only depends on what it uses
- **Easy testing** - minimal mocks required
- **Loose coupling** - services don't depend on unused functionality
- **Simple initialization** - only required dependencies need to be available

### 2. **Single Responsibility Principle**
Each class has exactly one responsibility:

```typescript
// ListCustomersService - only lists customers
async handle(): Promise<Customer[]> {
  await this.auditService.logSystemAction('customers.list_all');
  await this.analyticsService.trackUserSearch('all_customers');
  return this.customersRepository.find({
    order: { createdAt: 'DESC' }
  });
}

// GetCustomerService - only gets a customer by ID
async handle(id: string): Promise<Customer> {
  await this.auditService.logSystemAction('customers.get_by_id', {
    customerId: id,
  });
  
  const customer = await this.customersRepository.findOne({ where: { id } });
  if (!customer) {
    throw new CustomerNotFoundException(id);
  }
  
  return customer;
}
```

**Benefits:**
- **Clear purpose** - each class does one thing well
- **Easy to understand** - simple, focused methods
- **Easy to modify** - changes are isolated to specific functionality
- **Easy to test** - test one behavior at a time

### 3. **Graceful Degradation**
Cross-cutting concerns don't break core functionality:

```typescript
// CreateCustomerService - core functionality works even if cross-cutting concerns fail
async handle(createCustomerRequest: CreateCustomerRequest): Promise<Customer> {
  // Core business logic - always works
  const existingCustomer = await this.customersRepository.findOne({
    where: { email: createCustomerRequest.email },
  });
  
  if (existingCustomer) {
    throw new CustomerEmailAlreadyExistsException(createCustomerRequest.email);
  }
  
  const customer = this.customersRepository.create(createCustomerRequest);
  const savedCustomer = await this.customersRepository.save(customer);
  
  // Cross-cutting concerns - fail gracefully
  await this.handleCrossCuttingConcerns(savedCustomer);
  
  return savedCustomer;
}

private async handleCrossCuttingConcerns(customer: Customer): Promise<void> {
  await Promise.allSettled([
    this.auditService.logSystemAction('customers.create', {
      customerId: customer.id,
      email: customer.email,
    }),
    this.analyticsService.trackUserRegistration(customer.id, {
      email: customer.email,
    }),
    this.mailingService.sendWelcomeEmail(customer.id, customer.email, customer.firstName),
    this.notificationsService.sendWelcomeNotification(customer.id, customer.firstName),
  ]);
}
```

**Benefits:**
- **Resilient operations** - core functionality works even if non-critical services fail
- **Better user experience** - customers can still register even if analytics is down
- **Simplified error handling** - don't need to handle failures at multiple levels
- **Improved reliability** - fewer points of failure

### 4. **Simple Testing**

#### Controller Testing Simplicity
```typescript
// Only need to mock 1 service per controller
const mockListCustomersService = {
  handle: jest.fn(),
};

describe('ListCustomersController', () => {
  it('should return list of customers', async () => {
    const customers = [mockCustomer];
    mockListCustomersService.handle.mockResolvedValue(customers);
    
    const result = await controller.handle();
    
    expect(result).toEqual(customers);
    expect(service.handle).toHaveBeenCalledTimes(1);
  });
});
```

#### Service Testing Simplicity
```typescript
// Only need to mock actual dependencies
const mockCustomerRepository = { find: jest.fn() };
const mockAuditService = { logSystemAction: jest.fn() };
const mockAnalyticsService = { trackUserSearch: jest.fn() };

describe('ListCustomersService', () => {
  it('should return list of customers ordered by creation date', async () => {
    const customers = [mockCustomer];
    mockCustomerRepository.find.mockResolvedValue(customers);
    mockAuditService.logSystemAction.mockResolvedValue(undefined);
    mockAnalyticsService.trackUserSearch.mockResolvedValue(undefined);
    
    const result = await service.handle();
    
    expect(result).toEqual(customers);
    expect(customerRepository.find).toHaveBeenCalledWith({
      order: { createdAt: 'DESC' },
    });
  });
});
```

**Benefits:**
- **Fewer tests** - 20 controllers + 20 services = 40 focused test files
- **Simple mocks** - only mock what's actually used
- **Clear test cases** - each test focuses on one behavior
- **Easy maintenance** - changes only affect relevant tests



## 🧪 Testing Advantages

### 1. **Simple Mock Setup**
Each test only needs to mock actual dependencies:

```typescript
// ListCustomersService test - only 3 mocks
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ListCustomersService,
      { provide: getRepositoryToken(Customer), useValue: mockCustomerRepository },
      { provide: AuditService, useValue: mockAuditService },
      { provide: AnalyticsService, useValue: mockAnalyticsService },
    ],
  }).compile();
});

// CreateCustomerService test - only 5 mocks (when actually needed)
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CreateCustomerService,
      { provide: getRepositoryToken(Customer), useValue: mockCustomerRepository },
      { provide: AuditService, useValue: mockAuditService },
      { provide: AnalyticsService, useValue: mockAnalyticsService },
      { provide: MailingService, useValue: mockMailingService },
      { provide: NotificationsService, useValue: mockNotificationsService },
    ],
  }).compile();
});
```

### 2. **Focused Test Cases**
Each test focuses on one specific behavior:

```typescript
describe('GetCustomerService', () => {
  it('should return customer when found');
  it('should throw CustomerNotFoundException when customer not found');
  it('should handle database errors');
  it('should handle audit service failure');
  it('should handle empty customer ID');
  it('should handle customer with all fields populated');
  it('should handle customer with minimal fields');
});
```

### 3. **Easy Edge Case Testing**
Testing edge cases is straightforward:

```typescript
it('should handle cross-cutting concerns failures gracefully', async () => {
  mockCustomerRepository.findOne.mockResolvedValue(null);
  mockCustomerRepository.create.mockReturnValue(mockCustomer);
  mockCustomerRepository.save.mockResolvedValue(mockCustomer);
  mockAuditService.logSystemAction.mockRejectedValue(new Error('Audit service down'));
  mockAnalyticsService.trackUserRegistration.mockRejectedValue(new Error('Analytics service down'));
  mockMailingService.sendWelcomeEmail.mockRejectedValue(new Error('Mailing service down'));
  mockNotificationsService.sendWelcomeNotification.mockRejectedValue(new Error('Notifications service down'));
  
  const result = await service.handle(mockCreateCustomerRequest);
  
  expect(result).toEqual(mockCustomer); // Core functionality still works
  expect(customerRepository.findOne).toHaveBeenCalledWith({
    where: { email: 'test@example.com' },
  });
  expect(customerRepository.create).toHaveBeenCalledWith(mockCreateCustomerRequest);
  expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
});
```

### 4. **Isolated Failure Testing**
Testing failures doesn't require complex setup:

```typescript
it('should handle audit service failure', async () => {
  const customers = [mockCustomer];
  mockCustomerRepository.find.mockResolvedValue(customers);
  mockAuditService.logSystemAction.mockRejectedValue(new Error('Audit service down'));
  
  await expect(service.handle()).rejects.toThrow('Audit service down');
  expect(customerRepository.find).not.toHaveBeenCalled(); // Database not called if audit fails
  expect(auditService.logSystemAction).toHaveBeenCalledWith('customers.list_all');
  expect(analyticsService.trackUserSearch).not.toHaveBeenCalled();
});
```

## 📊 Complexity Metrics

| Metric | Value | Impact |
|--------|-------|--------|
| **Dependencies per Service** | 1-5 services (as needed) | Loose coupling |
| **Methods per Controller** | 1 endpoint | Single responsibility |
| **Methods per Service** | 1 business method | Single responsibility |
| **Total Tests** | 40 test files | Low maintenance |
| **Mock Methods** | 1-5 methods per test | Simple setup |
| **Cross-Cutting Concerns** | Isolated per service | Graceful degradation |
| **Failure Points** | 1 per operation | High reliability |

## 🎯 Learning Objectives

This module demonstrates the **Single Action Pattern** benefits:

1. **Minimal Dependencies**: Each service only depends on what it uses
2. **Single Responsibility**: Each class handles exactly one action
3. **Simple Testing**: Few mocks, focused test cases
4. **Graceful Degradation**: Core functionality works even if cross-cutting concerns fail
5. **Easy Maintenance**: Changes are isolated and predictable
6. **Scalable Architecture**: Easy to add new actions without affecting existing ones

## 🔄 Comparison with Monolithic Pattern

| Aspect | Monolithic Pattern (Users) | Single Action Pattern (Customers) |
|--------|---------------------------|-----------------------------------|
| **Dependencies** | 5 services per class | 1-5 services (as needed) |
| **Methods per Class** | 10 methods | 1 method |
| **Test Complexity** | 87 tests, complex setup | 40 tests, simple setup |
| **Error Handling** | Cascading failures | Isolated failures |
| **Maintainability** | Difficult to change | Easy to modify |
| **Testing** | Complex mocks | Simple mocks |
| **Reliability** | Multiple failure points | Single failure points |
| **Scalability** | Hard to extend | Easy to extend |

## 🚀 Best Practices Demonstrated

### 1. **Interface Segregation**
Each service only implements the interfaces it needs:

```typescript
// CreateCustomerService uses CreateCustomerRequest interface
async handle(createCustomerRequest: CreateCustomerRequest): Promise<Customer>

// UpdateCustomerService uses UpdateCustomerRequest interface  
async handle(id: string, updateCustomerRequest: UpdateCustomerRequest): Promise<Customer>
```

### 2. **Dependency Inversion**
Services depend on abstractions, not concrete implementations:

```typescript
// Service depends on Repository interface
@InjectRepository(Customer) private customersRepository: Repository<Customer>

// Service depends on service interfaces
private auditService: AuditService
private analyticsService: AnalyticsService
```

### 3. **Exception Handling**
Domain exceptions are thrown by services, HTTP exceptions by controllers:

```typescript
// Service throws domain exception
throw new CustomerNotFoundException(id);

// Controller converts to HTTP exception
throw new HttpException(error.message, HttpStatus.NOT_FOUND);
```

### 4. **RESTful Design**
Proper HTTP methods and status codes:

```typescript
@Get() @HttpCode(HttpStatus.OK)           // List customers
@Get(':id') @HttpCode(HttpStatus.OK)      // Get customer
@Post() @HttpCode(HttpStatus.CREATED)     // Create customer
@Patch(':id') @HttpCode(HttpStatus.OK)    // Update customer
@Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) // Delete customer
@Patch(':id/activate') @HttpCode(HttpStatus.OK) // Activate customer
```

## 🔄 Next Steps

After understanding these benefits, compare with the **monolithic pattern** to see the contrast:

- **Complex Dependencies**: 5 services injected into every class
- **Multiple Responsibilities**: Each class handles 10 different actions
- **Difficult Testing**: 87 tests with complex mock setup
- **Cascading Failures**: One service failure breaks entire operations
- **Poor Maintainability**: Changes affect multiple functionalities

---

*This module serves as a "what to do" example, demonstrating the simplicity, maintainability, and scalability of the Single Action Pattern in NestJS applications.*
