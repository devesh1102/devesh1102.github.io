# SOLID Principles

**Concise Definition**: "SOLID is a set of 5 design principles that make code more maintainable, flexible, and scalable by promoting modularity, testability, and low coupling."

**Architectural Definition**: "SOLID principles provide guidelines for designing classes and systems that are resilient to change, enabling teams to add features and refactor without cascading failures or tight coupling."

## Overview Table

| Principle | Meaning | Core Idea | Anti-Pattern |
|---|---|---|---|
| **S** | Single Responsibility | One class, one reason to change | God object (does everything) |
| **O** | Open/Closed | Open for extension, closed for modification | Modifying existing code constantly |
| **L** | Liskov Substitution | Subtypes interchangeable with base types | Child class breaks parent contract |
| **I** | Interface Segregation | Many specific interfaces > one fat interface | Clients forced to implement unused methods |
| **D** | Dependency Inversion | Depend on abstractions, not concretions | Direct dependency on concrete classes |

---

## 1. Single Responsibility Principle (SRP)

### What It Is
**A class should have only ONE reason to change.**

- One class = one responsibility = one reason to change
- If a class handles multiple concerns, split it into multiple classes
- Makes code easier to test, maintain, and understand

### Problem (Violates SRP)

```java
// BAD: One class doing too much
public class User {
    private String name;
    private String email;

    public void saveToDatabase() {  // Responsibility 1: persistence
        // Database logic
    }

    public void sendEmail() {  // Responsibility 2: notifications
        // Email logic
    }

    public void generateReport() {  // Responsibility 3: reporting
        // Report generation logic
    }
}

// Problem: This class has 3 reasons to change:
// 1. Database schema changes
// 2. Email service changes
// 3. Report format changes
```

### Solution (Follows SRP)

```java
// Responsibility 1: User data
public class User {
    private String name;
    private String email;

    public String getName() { return name; }
    public String getEmail() { return email; }
}

// Responsibility 2: Persistence
public class UserRepository {
    public void save(User user) {
        // Database logic
        System.out.println("User saved to database");
    }

    public User findByEmail(String email) {
        // Database query
        return null;
    }
}

// Responsibility 3: Notifications
public class EmailService {
    public void sendWelcomeEmail(User user) {
        // Email logic
        System.out.println("Welcome email sent to " + user.getEmail());
    }
}

// Responsibility 4: Reporting
public class UserReporter {
    public void generateUserReport(User user) {
        // Report logic
        System.out.println("Report generated for " + user.getName());
    }
}

// Usage:
public static void main(String[] args) {
    User user = new User("John", "john@example.com");
    
    UserRepository repo = new UserRepository();
    repo.save(user);  // Only saves
    
    EmailService email = new EmailService();
    email.sendWelcomeEmail(user);  // Only emails
    
    UserReporter reporter = new UserReporter();
    reporter.generateUserReport(user);  // Only reports
}
```

### Benefits
- **Maintainability**: Changes to email logic don't affect database code
- **Testability**: Easy to mock/test each responsibility independently
- **Reusability**: Each class can be used independently
- **Clarity**: Class name clearly describes what it does

### Real-World Example
A **restaurant** doesn't have one person doing cooking, serving, and accounting. It has:
- Chef (cooking responsibility)
- Waiter (serving responsibility)
- Accountant (accounting responsibility)

Each person has ONE responsibility.

---

## 2. Open/Closed Principle (OCP)

### What It Is
**Software entities should be OPEN for extension, CLOSED for modification.**

- Add new features WITHOUT changing existing code
- Use inheritance, interfaces, and polymorphism
- Reduces risk of breaking existing functionality

### Problem (Violates OCP)

```java
// BAD: Modifying class for every new shape
public class AreaCalculator {
    public double calculateArea(Object shape) {
        if (shape instanceof Rectangle) {
            Rectangle r = (Rectangle) shape;
            return r.getLength() * r.getWidth();
        } else if (shape instanceof Circle) {
            Circle c = (Circle) shape;
            return Math.PI * c.getRadius() * c.getRadius();
        } else if (shape instanceof Triangle) {  // Adding new type requires modification
            Triangle t = (Triangle) shape;
            return 0.5 * t.getBase() * t.getHeight();
        }
        return 0;
    }
}

// Problem: Every new shape requires modifying AreaCalculator
// Changes risk breaking existing code
```

### Solution (Follows OCP)

```java
// Open for extension: define interface
public interface Shape {
    double calculateArea();
}

// Closed for modification: implement interface for each shape
public class Rectangle implements Shape {
    private double length;
    private double width;

    public Rectangle(double length, double width) {
        this.length = length;
        this.width = width;
    }

    @Override
    public double calculateArea() {
        return length * width;
    }
}

public class Circle implements Shape {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public double calculateArea() {
        return Math.PI * radius * radius;
    }
}

// Add NEW shape without modifying AreaCalculator
public class Hexagon implements Shape {
    private double side;

    public Hexagon(double side) {
        this.side = side;
    }

    @Override
    public double calculateArea() {
        return (3 * Math.sqrt(3) / 2) * side * side;
    }
}

// Calculator: closed for modification, open for extension
public class AreaCalculator {
    public double calculateArea(Shape shape) {
        return shape.calculateArea();  // Polymorphic call
    }

    public double calculateTotalArea(List<Shape> shapes) {
        return shapes.stream()
                .mapToDouble(Shape::calculateArea)
                .sum();
    }
}

// Usage:
public static void main(String[] args) {
    List<Shape> shapes = new ArrayList<>();
    shapes.add(new Rectangle(5, 10));
    shapes.add(new Circle(7));
    shapes.add(new Hexagon(3));  // New shape, NO changes to AreaCalculator!

    AreaCalculator calculator = new AreaCalculator();
    System.out.println("Total Area: " + calculator.calculateTotalArea(shapes));
}
```

### Benefits
- **Extensibility**: Add new types without touching existing code
- **Stability**: Existing code remains unchanged, reducing bugs
- **Flexibility**: New requirements met by creating new classes
- **Testability**: Test each implementation independently

### Real-World Example
A **payment system** is open for extension (add PayPal, Apple Pay, cryptocurrency) but closed for modification. You don't change the core payment processor; you add new payment method implementations.

---

## 3. Liskov Substitution Principle (LSP)

### What It Is
**Subtypes must be substitutable for their base types without breaking functionality.**

- If `Dog` extends `Animal`, then `Dog` should work everywhere `Animal` is expected
- Child class shouldn't violate parent class contracts
- Overridden methods must maintain expected behavior

### Problem (Violates LSP)

```java
// Base class contract
public class Bird {
    public void fly() {
        System.out.println("Flying...");
    }
}

public class Sparrow extends Bird {
    // Follows contract: can fly
    @Override
    public void fly() {
        System.out.println("Sparrow flying");
    }
}

// Problem: Penguin is a bird but CAN'T fly
public class Penguin extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("Penguins can't fly");  // Breaks contract!
    }
}

// Usage breaks:
public static void letBirdFly(Bird bird) {
    bird.fly();  // Works for Sparrow, throws exception for Penguin
}

public static void main(String[] args) {
    Bird sparrow = new Sparrow();
    letBirdFly(sparrow);  // ✓ Works
    
    Bird penguin = new Penguin();
    letBirdFly(penguin);  // ✗ Throws exception!
}
```

### Solution (Follows LSP)

```java
// Base interface: only for birds that can fly
public interface FlyingBird {
    void fly();
}

// Base interface: for all birds
public interface Bird {
    void eat();
    void sleep();
}

// Sparrow: implements both (can fly and eat/sleep)
public class Sparrow implements FlyingBird, Bird {
    @Override
    public void fly() {
        System.out.println("Sparrow flying");
    }

    @Override
    public void eat() {
        System.out.println("Sparrow eating");
    }

    @Override
    public void sleep() {
        System.out.println("Sparrow sleeping");
    }
}

// Penguin: implements only Bird (can eat/sleep, but NOT fly)
public class Penguin implements Bird {
    @Override
    public void eat() {
        System.out.println("Penguin eating");
    }

    @Override
    public void sleep() {
        System.out.println("Penguin sleeping");
    }

    public void swim() {  // Penguins swim instead of fly
        System.out.println("Penguin swimming");
    }
}

// Usage: no surprises
public static void letBirdFly(FlyingBird bird) {
    bird.fly();  // Only called with birds that CAN fly
}

public static void feedBird(Bird bird) {
    bird.eat();  // Works for Sparrow and Penguin
}

public static void main(String[] args) {
    FlyingBird sparrow = new Sparrow();
    letBirdFly(sparrow);  // ✓ Works
    
    Bird penguin = new Penguin();
    feedBird(penguin);  // ✓ Works
    // letBirdFly(penguin);  // Won't compile; penguin doesn't implement FlyingBird
}
```

### Benefits
- **Predictability**: Subtypes behave as expected
- **Reliability**: No hidden exceptions or broken contracts
- **Loose Coupling**: Can use any subtype without special checks

### Real-World Example
A **payment processor** has many payment methods (Visa, MasterCard, PayPal). Each should handle payments consistently. If one throws an exception instead of processing, it violates the contract.

---

## 4. Interface Segregation Principle (ISP)

### What It Is
**Many specific interfaces > one fat interface.**

- Clients shouldn't be forced to implement methods they don't use
- Split large interfaces into smaller, focused ones
- Each interface represents a specific capability

### Problem (Violates ISP)

```java
// BAD: One fat interface with too many responsibilities
public interface Worker {
    void work();
    void eat();
    void manage();
    void code();
    void design();
}

// Developer has to implement ALL methods, even ones not relevant
public class Developer implements Worker {
    @Override
    public void work() { System.out.println("Coding"); }

    @Override
    public void eat() { System.out.println("Eating"); }

    @Override
    public void manage() { throw new UnsupportedOperationException(); }  // Forced to implement

    @Override
    public void code() { System.out.println("Writing code"); }

    @Override
    public void design() { System.out.println("UI design"); }
}

// Manager has to implement coding methods they don't use
public class Manager implements Worker {
    @Override
    public void work() { System.out.println("Managing"); }

    @Override
    public void eat() { System.out.println("Eating"); }

    @Override
    public void manage() { System.out.println("Organizing team"); }

    @Override
    public void code() { throw new UnsupportedOperationException(); }  // Forced to implement

    @Override
    public void design() { throw new UnsupportedOperationException(); }  // Forced to implement
}
```

### Solution (Follows ISP)

```java
// Segregate into focused interfaces
public interface Workable {
    void work();
}

public interface Eatable {
    void eat();
}

public interface Manageable {
    void manage();
}

public interface Codeable {
    void code();
}

public interface Designable {
    void design();
}

// Developer: implements only relevant interfaces
public class Developer implements Workable, Eatable, Codeable, Designable {
    @Override
    public void work() { System.out.println("Coding"); }

    @Override
    public void eat() { System.out.println("Eating"); }

    @Override
    public void code() { System.out.println("Writing code"); }

    @Override
    public void design() { System.out.println("UI design"); }
}

// Manager: implements only relevant interfaces
public class Manager implements Workable, Eatable, Manageable {
    @Override
    public void work() { System.out.println("Managing"); }

    @Override
    public void eat() { System.out.println("Eating"); }

    @Override
    public void manage() { System.out.println("Organizing team"); }
}

// Robot: only workable, doesn't eat
public class Robot implements Workable, Codeable {
    @Override
    public void work() { System.out.println("Processing"); }

    @Override
    public void code() { System.out.println("Executing code"); }
}

// Usage:
public static void main(String[] args) {
    Developer dev = new Developer();
    dev.code();        // ✓ Relevant
    dev.eat();         // ✓ Relevant
    
    Manager mgr = new Manager();
    mgr.manage();      // ✓ Relevant
    
    Robot robot = new Robot();
    robot.code();      // ✓ Relevant
    // robot.eat();    // ✓ Not required
}
```

### Benefits
- **Flexibility**: Classes implement only relevant methods
- **Clarity**: Interfaces clearly state what they do
- **Maintainability**: Changes to one capability don't affect others
- **Reusability**: Smaller interfaces are easier to compose

### Real-World Example
An **airline ticket interface** shouldn't force passengers to implement "pilot" or "flight attendant" methods. Separate interfaces: PassengerInterface, PilotInterface, CabinCrewInterface.

---

## 5. Dependency Inversion Principle (DIP)

### What It Is
**High-level modules should depend on abstractions, not low-level details.**

- Depend on interfaces/abstract classes, not concrete implementations
- Invert the dependency direction: low-level classes depend on abstractions
- Reduces coupling between components

### Problem (Violates DIP)

```java
// Low-level class: concrete implementation
public class MySQLDatabase {
    public void save(String data) {
        System.out.println("Saving to MySQL: " + data);
    }
}

// High-level class: directly depends on MySQL
public class UserService {
    private MySQLDatabase database;  // Tightly coupled

    public UserService() {
        this.database = new MySQLDatabase();  // Hard to test, hard to change
    }

    public void createUser(String username) {
        database.save(username);
    }
}

// Problem: Changing to PostgreSQL requires modifying UserService
// Hard to test: can't mock database
```

### Solution (Follows DIP)

```java
// Abstraction: interface for any database
public interface Database {
    void save(String data);
    String retrieve(String id);
}

// Low-level implementations depend on abstraction
public class MySQLDatabase implements Database {
    @Override
    public void save(String data) {
        System.out.println("Saving to MySQL: " + data);
    }

    @Override
    public String retrieve(String id) {
        return "Data from MySQL";
    }
}

public class PostgreSQLDatabase implements Database {
    @Override
    public void save(String data) {
        System.out.println("Saving to PostgreSQL: " + data);
    }

    @Override
    public String retrieve(String id) {
        return "Data from PostgreSQL";
    }
}

// High-level class: depends on abstraction, not concrete class
public class UserService {
    private Database database;  // Depends on interface

    // Dependency injection: database passed in
    public UserService(Database database) {
        this.database = database;
    }

    public void createUser(String username) {
        database.save(username);  // Works with any database
    }

    public String getUser(String id) {
        return database.retrieve(id);
    }
}

// Usage:
public static void main(String[] args) {
    // Easy to swap implementations
    Database mysql = new MySQLDatabase();
    UserService service1 = new UserService(mysql);
    service1.createUser("John");  // Saves to MySQL
    
    Database postgres = new PostgreSQLDatabase();
    UserService service2 = new UserService(postgres);
    service2.createUser("Jane");  // Saves to PostgreSQL
    
    // For testing: use a mock
    Database mockDb = new MockDatabase();
    UserService testService = new UserService(mockDb);
    testService.createUser("TestUser");
}

// Mock for testing
public class MockDatabase implements Database {
    @Override
    public void save(String data) {
        System.out.println("Mock: saving " + data);
    }

    @Override
    public String retrieve(String id) {
        return "Mock data";
    }
}
```

### Benefits
- **Flexibility**: Swap implementations without changing high-level code
- **Testability**: Easy to inject mocks for testing
- **Maintainability**: Changes to low-level classes don't affect high-level logic
- **Scalability**: Add new implementations easily

### Real-World Example
A **restaurant** depends on the concept of a "supplier" (abstraction), not a specific vendor. If one vendor goes out of business, you switch to another without changing restaurant operations.

---

## SOLID Principles Applied Together

### E-Commerce Order System Example

```java
// S: Single Responsibility
public class Order {
    private String id;
    private List<Item> items;
    // Order data only, no persistence/email/notification logic
}

// I: Interface Segregation
public interface OrderRepository {
    void save(Order order);
}

public interface EmailService {
    void sendConfirmation(Order order);
}

public interface PaymentProcessor {
    boolean processPayment(Order order);
}

// D: Dependency Inversion (high-level depends on abstractions)
public class OrderService {
    private OrderRepository repository;
    private EmailService email;
    private PaymentProcessor payment;

    public OrderService(OrderRepository repo, EmailService email, PaymentProcessor payment) {
        this.repository = repo;
        this.email = email;
        this.payment = payment;
    }

    public void createOrder(Order order) {
        if (payment.processPayment(order)) {
            repository.save(order);
            email.sendConfirmation(order);
        }
    }
}

// O: Open/Closed (open for extension via new implementations)
public class StripePaymentProcessor implements PaymentProcessor {
    @Override
    public boolean processPayment(Order order) {
        System.out.println("Processing with Stripe");
        return true;
    }
}

public class PayPalPaymentProcessor implements PaymentProcessor {
    @Override
    public boolean processPayment(Order order) {
        System.out.println("Processing with PayPal");
        return true;
    }
}

// L: Liskov Substitution (any PaymentProcessor works)
public static void main(String[] args) {
    OrderRepository repo = new MySQLOrderRepository();
    EmailService emailService = new GmailEmailService();
    PaymentProcessor payment = new StripePaymentProcessor();  // Can swap to PayPalPaymentProcessor

    OrderService orderService = new OrderService(repo, emailService, payment);
    Order order = new Order("ORD123");
    orderService.createOrder(order);
}
```

---

## Interview Cheat Sheet

| Principle | Problem | Solution | Benefit |
|---|---|---|---|
| **SRP** | Class has too many responsibilities | Split into single-responsibility classes | Easy to test, maintain, and change |
| **OCP** | Modifying code for new features | Use inheritance/interfaces for extension | Add features without changing existing code |
| **LSP** | Subtype breaks parent contract | Ensure subtypes maintain expected behavior | Subtypes work seamlessly with base type |
| **ISP** | Fat interface with unused methods | Split into focused interfaces | Classes implement only what they need |
| **DIP** | High-level depends on low-level | Depend on abstractions, inject dependencies | Easy to test, swap implementations, reduce coupling |

### Common Interview Questions

1. **"Why is SRP important?"**
   - One reason to change = easier to maintain
   - Each class has clear purpose
   - Easy to test in isolation

2. **"Explain Open/Closed with an example."**
   - Payment system: closed for modification (core logic unchanged)
   - Open for extension (add PayPal, Apple Pay, etc. via new classes)

3. **"What's the difference between ISP and SRP?"**
   - SRP: one class, one responsibility
   - ISP: one interface, one capability (multiple interfaces per class OK)

4. **"How does Dependency Inversion help testing?"**
   - Inject mock implementations in tests
   - Don't need real database/API/email service
   - Tests run fast and reliably

5. **"Can you violate SOLID principles?"**
   - Yes, but pay a price: hard to test, hard to change, hard to maintain
   - Start with clean design, refactor toward SOLID when problems appear

### When to Apply SOLID

- **Always**: When designing new systems from scratch
- **Sometimes**: When adding to existing systems; refactor if needed
- **Pragmatically**: Balance SOLID principles with practical constraints
- **Iteratively**: Not all code needs to be perfect; refactor when pain points emerge
