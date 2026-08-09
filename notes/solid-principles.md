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

- One class = one responsibility
- If a class handles multiple concerns, split it into multiple classes
- Makes code easier to test, maintain, and understand

### Problem (Violates SRP)

```python
# BAD: One class doing too much
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    def save_to_database(self):
        # Responsibility 1: persistence
        print(f"Saving user {self.name} to database")
    
    def send_email(self):
        # Responsibility 2: notifications
        print(f"Sending welcome email to {self.email}")
    
    def generate_report(self):
        # Responsibility 3: reporting
        print(f"Generating report for {self.name}")

# Problem: This class has 3 reasons to change:
# 1. Database schema changes
# 2. Email service changes
# 3. Report format changes
```

### Solution (Follows SRP)

```python
# Responsibility 1: User data
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email

# Responsibility 2: Persistence
class UserRepository:
    def save(self, user):
        print(f"User {user.name} saved to database")
    
    def find_by_email(self, email):
        return None  # Database query

# Responsibility 3: Notifications
class EmailService:
    def send_welcome_email(self, user):
        print(f"Welcome email sent to {user.email}")

# Responsibility 4: Reporting
class UserReporter:
    def generate_user_report(self, user):
        print(f"Report generated for {user.name}")

# Usage:
user = User("John", "john@example.com")

repo = UserRepository()
repo.save(user)

email = EmailService()
email.send_welcome_email(user)

reporter = UserReporter()
reporter.generate_user_report(user)
```

### Benefits
- **Maintainability**: Changes to email logic don't affect database code
- **Testability**: Easy to test each responsibility independently
- **Reusability**: Each class can be used independently
- **Clarity**: Class name clearly describes what it does

### Real-World Example
A **restaurant** doesn't have one person doing cooking, serving, and accounting. It has:
- Chef (cooking responsibility)
- Waiter (serving responsibility)  
- Accountant (accounting responsibility)

---

## 2. Open/Closed Principle (OCP)

### What It Is
**Software entities should be OPEN for extension, CLOSED for modification.**

- Add new features WITHOUT changing existing code
- Use inheritance, interfaces, and polymorphism
- Reduces risk of breaking existing functionality

### Problem (Violates OCP)

```python
# BAD: Modifying class for every new shape
class AreaCalculator:
    def calculate_area(self, shape):
        if shape.__class__.__name__ == "Rectangle":
            return shape.length * shape.width
        elif shape.__class__.__name__ == "Circle":
            return 3.14159 * shape.radius * shape.radius
        elif shape.__class__.__name__ == "Triangle":  # Adding new type requires modification
            return 0.5 * shape.base * shape.height
        return 0

# Problem: Every new shape requires modifying AreaCalculator
# Changes risk breaking existing code
```

### Solution (Follows OCP)

```python
from abc import ABC, abstractmethod
import math

# Open for extension: define abstract class
class Shape(ABC):
    @abstractmethod
    def calculate_area(self):
        pass

# Closed for modification: implement interface for each shape
class Rectangle(Shape):
    def __init__(self, length, width):
        self.length = length
        self.width = width
    
    def calculate_area(self):
        return self.length * self.width

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius
    
    def calculate_area(self):
        return math.pi * self.radius * self.radius

class Triangle(Shape):
    def __init__(self, base, height):
        self.base = base
        self.height = height
    
    def calculate_area(self):
        return 0.5 * self.base * self.height

# Add NEW shape without modifying AreaCalculator
class Hexagon(Shape):
    def __init__(self, side):
        self.side = side
    
    def calculate_area(self):
        return (3 * math.sqrt(3) / 2) * self.side * self.side

# Calculator: closed for modification, open for extension
class AreaCalculator:
    def calculate_area(self, shape):
        return shape.calculate_area()  # Polymorphic call
    
    def calculate_total_area(self, shapes):
        return sum(shape.calculate_area() for shape in shapes)

# Usage:
shapes = [
    Rectangle(5, 10),
    Circle(7),
    Hexagon(3)  # New shape, NO changes to AreaCalculator!
]

calculator = AreaCalculator()
print(f"Total Area: {calculator.calculate_total_area(shapes)}")
```

### Benefits
- **Extensibility**: Add new types without touching existing code
- **Stability**: Existing code remains unchanged, reducing bugs
- **Flexibility**: New requirements met by creating new classes
- **Testability**: Test each implementation independently

### Real-World Example
A **payment system** is open for extension (add PayPal, Apple Pay, crypto) but closed for modification. You don't change the core processor; you add new implementations.

---

## 3. Liskov Substitution Principle (LSP)

### What It Is
**Subtypes must be substitutable for their base types without breaking functionality.**

- If `Dog` extends `Animal`, then `Dog` should work everywhere `Animal` is expected
- Child class shouldn't violate parent class contracts
- Overridden methods must maintain expected behavior

### Problem (Violates LSP)

```python
# Base class contract
class Bird:
    def fly(self):
        print("Flying...")

class Sparrow(Bird):
    def fly(self):
        print("Sparrow flying")  # Follows contract

# Problem: Penguin is a bird but CAN'T fly
class Penguin(Bird):
    def fly(self):
        raise Exception("Penguins can't fly")  # Breaks contract!

# Usage breaks:
def let_bird_fly(bird):
    bird.fly()  # Works for Sparrow, throws exception for Penguin

# Code:
sparrow = Sparrow()
let_bird_fly(sparrow)  # ✓ Works

penguin = Penguin()
let_bird_fly(penguin)  # ✗ Throws exception!
```

### Solution (Follows LSP)

```python
from abc import ABC, abstractmethod

# Base interface: for all birds
class Bird(ABC):
    @abstractmethod
    def eat(self):
        pass
    
    @abstractmethod
    def sleep(self):
        pass

# Specialized interface: only for birds that can fly
class FlyingBird(Bird):
    @abstractmethod
    def fly(self):
        pass

# Sparrow: can fly and eat/sleep
class Sparrow(FlyingBird):
    def fly(self):
        print("Sparrow flying")
    
    def eat(self):
        print("Sparrow eating")
    
    def sleep(self):
        print("Sparrow sleeping")

# Penguin: can eat/sleep, but NOT fly
class Penguin(Bird):
    def eat(self):
        print("Penguin eating")
    
    def sleep(self):
        print("Penguin sleeping")
    
    def swim(self):  # Penguins swim instead of fly
        print("Penguin swimming")

# Usage: no surprises
def let_bird_fly(bird):
    bird.fly()  # Only called with birds that CAN fly

def feed_bird(bird):
    bird.eat()  # Works for Sparrow and Penguin

# Code:
sparrow = Sparrow()
let_bird_fly(sparrow)  # ✓ Works

penguin = Penguin()
feed_bird(penguin)      # ✓ Works
# let_bird_fly(penguin) # Won't work; penguin doesn't implement FlyingBird
```

### Benefits
- **Predictability**: Subtypes behave as expected
- **Reliability**: No hidden exceptions or broken contracts
- **Loose Coupling**: Can use any subtype without special checks

### Real-World Example
A **payment processor** has many payment methods (Visa, MasterCard, PayPal). Each should handle payments consistently. If one throws an exception, it violates the contract.

---

## 4. Interface Segregation Principle (ISP)

### What It Is
**Many specific interfaces > one fat interface.**

- Clients shouldn't be forced to implement methods they don't use
- Split large interfaces into smaller, focused ones
- Each interface represents a specific capability

### Problem (Violates ISP)

```python
# BAD: One fat interface with too many responsibilities
class Worker(ABC):
    @abstractmethod
    def work(self):
        pass
    
    @abstractmethod
    def eat(self):
        pass
    
    @abstractmethod
    def manage(self):
        pass
    
    @abstractmethod
    def code(self):
        pass
    
    @abstractmethod
    def design(self):
        pass

# Developer has to implement ALL methods
class Developer(Worker):
    def work(self):
        print("Coding")
    
    def eat(self):
        print("Eating")
    
    def manage(self):
        raise NotImplementedError()  # Forced to implement
    
    def code(self):
        print("Writing code")
    
    def design(self):
        print("UI design")

# Manager has to implement coding methods they don't use
class Manager(Worker):
    def work(self):
        print("Managing")
    
    def eat(self):
        print("Eating")
    
    def manage(self):
        print("Organizing team")
    
    def code(self):
        raise NotImplementedError()  # Forced to implement
    
    def design(self):
        raise NotImplementedError()  # Forced to implement
```

### Solution (Follows ISP)

```python
from abc import ABC, abstractmethod

# Segregate into focused interfaces
class Workable(ABC):
    @abstractmethod
    def work(self):
        pass

class Eatable(ABC):
    @abstractmethod
    def eat(self):
        pass

class Manageable(ABC):
    @abstractmethod
    def manage(self):
        pass

class Codeable(ABC):
    @abstractmethod
    def code(self):
        pass

class Designable(ABC):
    @abstractmethod
    def design(self):
        pass

# Developer: implements only relevant interfaces
class Developer(Workable, Eatable, Codeable, Designable):
    def work(self):
        print("Coding")
    
    def eat(self):
        print("Eating")
    
    def code(self):
        print("Writing code")
    
    def design(self):
        print("UI design")

# Manager: implements only relevant interfaces
class Manager(Workable, Eatable, Manageable):
    def work(self):
        print("Managing")
    
    def eat(self):
        print("Eating")
    
    def manage(self):
        print("Organizing team")

# Robot: only workable, doesn't eat
class Robot(Workable, Codeable):
    def work(self):
        print("Processing")
    
    def code(self):
        print("Executing code")

# Usage:
dev = Developer()
dev.code()      # ✓ Relevant
dev.eat()       # ✓ Relevant

mgr = Manager()
mgr.manage()    # ✓ Relevant

robot = Robot()
robot.code()    # ✓ Relevant
# robot.eat()   # ✓ Not required
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
- Invert the dependency direction
- Reduces coupling between components

### Problem (Violates DIP)

```python
# Low-level class: concrete implementation
class MySQLDatabase:
    def save(self, data):
        print(f"Saving to MySQL: {data}")

# High-level class: directly depends on MySQL
class UserService:
    def __init__(self):
        self.database = MySQLDatabase()  # Tightly coupled
    
    def create_user(self, username):
        self.database.save(username)

# Problem: Changing to PostgreSQL requires modifying UserService
# Hard to test: can't mock database
```

### Solution (Follows DIP)

```python
from abc import ABC, abstractmethod

# Abstraction: interface for any database
class Database(ABC):
    @abstractmethod
    def save(self, data):
        pass
    
    @abstractmethod
    def retrieve(self, id):
        pass

# Low-level implementations depend on abstraction
class MySQLDatabase(Database):
    def save(self, data):
        print(f"Saving to MySQL: {data}")
    
    def retrieve(self, id):
        return "Data from MySQL"

class PostgreSQLDatabase(Database):
    def save(self, data):
        print(f"Saving to PostgreSQL: {data}")
    
    def retrieve(self, id):
        return "Data from PostgreSQL"

# High-level class: depends on abstraction, not concrete class
class UserService:
    def __init__(self, database):
        self.database = database  # Depends on interface
    
    def create_user(self, username):
        self.database.save(username)
    
    def get_user(self, id):
        return self.database.retrieve(id)

# Usage:
# Easy to swap implementations
mysql_db = MySQLDatabase()
service1 = UserService(mysql_db)
service1.create_user("John")  # Saves to MySQL

postgres_db = PostgreSQLDatabase()
service2 = UserService(postgres_db)
service2.create_user("Jane")  # Saves to PostgreSQL

# For testing: use a mock
class MockDatabase(Database):
    def save(self, data):
        print(f"Mock: saving {data}")
    
    def retrieve(self, id):
        return "Mock data"

mock_db = MockDatabase()
test_service = UserService(mock_db)
test_service.create_user("TestUser")
```

### Benefits
- **Flexibility**: Swap implementations without changing high-level code
- **Testability**: Easy to inject mocks for testing
- **Maintainability**: Changes to low-level classes don't affect high-level logic
- **Scalability**: Add new implementations easily

### Real-World Example
A **restaurant** depends on the concept of a "supplier" (abstraction), not a specific vendor. If one vendor fails, you switch to another without changing restaurant operations.

---

## SOLID Principles Applied Together

### E-Commerce Order System Example

```python
from abc import ABC, abstractmethod
from enum import Enum

# S: Single Responsibility
class Order:
    def __init__(self, id, items):
        self.id = id
        self.items = items

# I: Interface Segregation
class OrderRepository(ABC):
    @abstractmethod
    def save(self, order):
        pass

class EmailService(ABC):
    @abstractmethod
    def send_confirmation(self, order):
        pass

class PaymentProcessor(ABC):
    @abstractmethod
    def process_payment(self, order):
        pass

# D: Dependency Inversion (high-level depends on abstractions)
class OrderService:
    def __init__(self, repository, email_service, payment_processor):
        self.repository = repository
        self.email_service = email_service
        self.payment_processor = payment_processor
    
    def create_order(self, order):
        if self.payment_processor.process_payment(order):
            self.repository.save(order)
            self.email_service.send_confirmation(order)
            print("Order created successfully")
        else:
            print("Payment failed")

# O: Open/Closed (open for extension via new implementations)
class StripePaymentProcessor(PaymentProcessor):
    def process_payment(self, order):
        print("Processing with Stripe")
        return True

class PayPalPaymentProcessor(PaymentProcessor):
    def process_payment(self, order):
        print("Processing with PayPal")
        return True

class SQLOrderRepository(OrderRepository):
    def save(self, order):
        print(f"Order {order.id} saved to SQL database")

class GmailEmailService(EmailService):
    def send_confirmation(self, order):
        print(f"Confirmation sent for order {order.id}")

# L: Liskov Substitution (any PaymentProcessor works)
order = Order(1, ["item1", "item2"])
repo = SQLOrderRepository()
email = GmailEmailService()
payment = StripePaymentProcessor()  # Can swap to PayPalPaymentProcessor

service = OrderService(repo, email, payment)
service.create_order(order)
```

---

## Interview Cheat Sheet

| Principle | Problem | Solution | Benefit |
|---|---|---|---|
| **SRP** | Too many responsibilities | Split into single-responsibility classes | Easy to test and maintain |
| **OCP** | Modifying code for new features | Use inheritance/interfaces for extension | Add features without changing code |
| **LSP** | Subtype breaks parent contract | Ensure subtypes maintain behavior | Subtypes work seamlessly |
| **ISP** | Fat interface with unused methods | Split into focused interfaces | Classes implement only what they need |
| **DIP** | High-level depends on low-level | Depend on abstractions, inject dependencies | Easy to test, swap implementations |

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
   - Start with clean design, refactor toward SOLID when pain appears
