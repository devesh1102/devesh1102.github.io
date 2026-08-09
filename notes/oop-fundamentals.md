# OOP Fundamentals

**Concise Definition**: "Object-Oriented Programming organizes code into objects that combine data and behavior, enabling modularity, reusability, and maintainability through encapsulation, inheritance, polymorphism, and abstraction."

**Architectural Definition**: "OOP provides a blueprint for designing systems by modeling entities as self-contained objects with well-defined interfaces, reducing coupling, improving testability, and enabling scalable design patterns commonly used in large-scale systems."

## 1. Encapsulation

### What It Is
**Bundling data (state) and methods (behavior) together, hiding internal details from the outside world.**

- Data members are private; controlled access via public methods
- Protects object integrity by preventing invalid state changes
- Reduces coupling between components

### Real-Life Example
A **bicycle gear system**. You just turn the shifter lever (public interface); internally, complex mechanisms (derailleur, chain, sprockets, cassette) automatically adjust—but you don't need to know HOW they work.

```
What you see: Gear shifter lever (1-21)
What happens internally (HIDDEN):
  1. Derailleur moves chain to correct sprocket
  2. Cassette teeth engage with chain
  3. Tension maintained automatically
  4. Gear ratio changes without user knowing mechanics

You just: "Shift to gear 5"
System handles: chain alignment, tooth engagement, tension, cadence optimization
You don't care: how derailleur calculates position, chain physics, sprocket geometry
```

**Why this is encapsulation:** The complexity is completely hidden behind a simple interface. The internal implementation could change (electronic vs mechanical shifter) but your interaction stays the same.

### Coding Example: Bike Gear System

```java
public class BikeGearSystem {
    // Private: Internal mechanisms HIDDEN from user
    private int currentSprocket;      // Which sprocket chain is on (1-21)
    private Derailleur derailleur;    // Automatically positions chain
    private int chainTension;         // Automatically maintained
    
    public BikeGearSystem() {
        this.currentSprocket = 1;
        this.derailleur = new Derailleur();
        this.chainTension = 50;  // Default tension
    }

    // Public interface: Simple gear shifting
    public void shiftUp() {
        if (currentSprocket < 21) {
            // Complex internal logic HIDDEN
            currentSprocket++;
            derailleur.moveChain(currentSprocket);  // Internal call
            adjustChainTension();                    // Internal call
            System.out.println("Shifted to gear " + currentSprocket);
        }
    }

    public void shiftDown() {
        if (currentSprocket > 1) {
            currentSprocket--;
            derailleur.moveChain(currentSprocket);
            adjustChainTension();
            System.out.println("Shifted to gear " + currentSprocket);
        }
    }

    public int getCurrentGear() {
        return currentSprocket;  // User only sees gear number
    }

    // Private methods: HOW it works is HIDDEN
    private void adjustChainTension() {
        if (currentSprocket < 10) {
            chainTension = 45;
        } else if (currentSprocket < 15) {
            chainTension = 50;
        } else {
            chainTension = 55;
        }
        // User never sees this logic
    }
}

// Private class: Completely hidden implementation
class Derailleur {
    void moveChain(int sprocket) {
        // Complex electromagnetic/mechanical logic
        // User doesn't care about this
    }
}

// Usage: Simple, clean interface
BikeGearSystem bike = new BikeGearSystem();
bike.shiftUp();              // ✓ Allowed, simple
bike.shiftDown();            // ✓ Allowed, simple
// bike.currentSprocket = 30; // ✗ NOT ALLOWED (private)
// bike.adjustChainTension(); // ✗ NOT ALLOWED (private)
System.out.println(bike.getCurrentGear());  // Safe read access (5)
```

**Key insight:** The user interacts with a simple public interface (shiftUp/shiftDown), while all internal complexity is hidden. If the bike manufacturer changes the derailleur mechanism, the user's code doesn't change.

### Benefits
- **Simplicity**: Complex internals hidden behind simple public interface
- **Flexibility**: Implementation can change without affecting users
- **Protection**: Users can't break internal state by interacting incorrectly
- **Maintenance**: Internal changes don't cascade to dependent code

---

## 2. Abstraction

### What It Is
**Exposing only essential features and hiding implementation complexity.**

- Users interact with abstract interfaces, not concrete details
- Simplifies usage by reducing cognitive load
- Each object exposes "what it does," not "how it does it"

### Real-Life Example
A **car dashboard** abstracts the engine. You press the accelerator pedal; internally complex fuel injection, ignition timing, and combustion happen—but you don't need to know those details.

```
What user sees: Steering wheel, pedals, gauges
Hidden complexity: Engine, transmission, fuel system, electronics
User drives without understanding internal mechanics
```

### Coding Example

```java
// Abstract interface: users see only essential operations
public abstract class DatabaseConnection {
    abstract void connect();
    abstract void query(String sql);
    abstract void disconnect();
    
    // Implementation details hidden
    abstract void validateCredentials();
    abstract void handleNetworkFailure();
}

// Concrete implementation: how it's really done
public class MySQLConnection extends DatabaseConnection {
    @Override
    public void connect() {
        // Complex MySQL connection logic hidden
        validateCredentials();
        // TCP handshake, SSL negotiation, etc.
        System.out.println("Connected to MySQL");
    }

    @Override
    public void query(String sql) {
        // Complex parsing, optimization, execution hidden
        System.out.println("Executing: " + sql);
    }

    @Override
    public void disconnect() {
        // Cleanup logic hidden
        System.out.println("MySQL connection closed");
    }

    private void validateCredentials() {
        // Internal detail: never called directly by users
    }

    private void handleNetworkFailure() {
        // Internal detail: retry logic hidden
    }
}

// Usage: User sees only essential methods
DatabaseConnection db = new MySQLConnection();
db.connect();
db.query("SELECT * FROM users");
db.disconnect();
// User doesn't need to know: connection pooling, SSL, retries, etc.
```

### Benefits
- **Simplicity**: Complex systems become easy to use
- **Security**: Internal mechanisms protected from misuse
- **Flexibility**: Can swap implementations (MySQL → PostgreSQL) without changing user code

---

## 3. Inheritance

### What It Is
**Creating a hierarchy where a child class inherits properties and methods from a parent class, promoting code reuse.**

- Child class extends parent class: `class Dog extends Animal`
- Inherits all parent methods and fields
- Can override methods for specialized behavior
- Enables polymorphic behavior

### Real-Life Example
**Vehicle hierarchy**: Cars, motorcycles, and trucks are all vehicles. They share common features (wheels, engine, brakes) but have specific behaviors (trucks carry cargo, motorcycles are nimble).

```
Vehicle (parent)
├── Car (child)
├── Motorcycle (child)
└── Truck (child)

All inherit: start(), stop(), accelerate()
Truck overrides: carry()
Motorcycle overrides: lean()
```

### Coding Example

```java
// Parent class: common properties and methods
public class Animal {
    private String name;
    private int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void eat() {
        System.out.println(name + " is eating");
    }

    public void sleep() {
        System.out.println(name + " is sleeping");
    }

    public String getName() {
        return name;
    }
}

// Child class 1: inherits from Animal, adds specific behavior
public class Dog extends Animal {
    public Dog(String name, int age) {
        super(name, age);  // Call parent constructor
    }

    // Override parent method with dog-specific behavior
    @Override
    public void eat() {
        System.out.println(getName() + " is eating dog food");
    }

    // New method specific to Dog
    public void bark() {
        System.out.println(getName() + " says: Woof!");
    }
}

// Child class 2: inherits from Animal, different behavior
public class Cat extends Animal {
    public Cat(String name, int age) {
        super(name, age);
    }

    @Override
    public void eat() {
        System.out.println(getName() + " is eating cat food");
    }

    public void meow() {
        System.out.println(getName() + " says: Meow!");
    }
}

// Usage:
Animal dog = new Dog("Buddy", 3);
dog.eat();      // Output: "Buddy is eating dog food" (overridden)
dog.sleep();    // Output: "Buddy is sleeping" (inherited)

Animal cat = new Cat("Whiskers", 2);
cat.eat();      // Output: "Whiskers is eating cat food" (overridden)
cat.sleep();    // Output: "Whiskers is sleeping" (inherited)
```

### Benefits
- **Code Reuse**: Common behavior defined once in parent
- **Maintainability**: Changes to parent propagate to all children
- **Hierarchy**: Logical organization of related types

---

## 4. Polymorphism

### What It Is
**"Many forms"—ability of objects to take multiple forms or respond differently to the same message based on their type.**

Two types:
1. **Compile-time (Method Overloading)**: Same method name, different parameters
2. **Runtime (Method Overriding)**: Child class overrides parent method; actual behavior determined at runtime

### Real-Life Example
A **shape** can have a `calculateArea()` method. A rectangle calculates area one way (length × width), a circle calculates it differently (π × r²), a triangle yet another way (½ × base × height). Same method name, different implementations.

```
Shape polymorphism:
  Rectangle.calculateArea() → length * width
  Circle.calculateArea() → π * radius²
  Triangle.calculateArea() → 0.5 * base * height
```

### Coding Example: Runtime Polymorphism

```java
// Parent class with abstract method
public abstract class Shape {
    public abstract double calculateArea();
    
    // Common method
    public void printInfo() {
        System.out.println("Area: " + calculateArea());
    }
}

// Concrete implementations
public class Rectangle extends Shape {
    private double length;
    private double width;

    public Rectangle(double length, double width) {
        this.length = length;
        this.width = width;
    }

    @Override
    public double calculateArea() {
        return length * width;  // Rectangle-specific logic
    }
}

public class Circle extends Shape {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public double calculateArea() {
        return Math.PI * radius * radius;  // Circle-specific logic
    }
}

public class Triangle extends Shape {
    private double base;
    private double height;

    public Triangle(double base, double height) {
        this.base = base;
        this.height = height;
    }

    @Override
    public double calculateArea() {
        return 0.5 * base * height;  // Triangle-specific logic
    }
}

// Polymorphic usage: same code works with different types
public static void main(String[] args) {
    List<Shape> shapes = new ArrayList<>();
    shapes.add(new Rectangle(5, 10));
    shapes.add(new Circle(7));
    shapes.add(new Triangle(6, 8));

    // Loop works for ANY shape; actual method called depends on runtime type
    for (Shape shape : shapes) {
        shape.printInfo();  // Calls appropriate calculateArea() for each type
    }
    
    // Output:
    // Area: 50.0          (Rectangle)
    // Area: 153.93804...  (Circle)
    // Area: 24.0          (Triangle)
}
```

### Coding Example: Compile-time Polymorphism (Overloading)

```java
public class Calculator {
    // Same method name, different parameter types
    
    public int add(int a, int b) {
        return a + b;
    }

    public double add(double a, double b) {
        return a + b;
    }

    public String add(String a, String b) {
        return a + b;  // Concatenation
    }

    public int add(int a, int b, int c) {
        return a + b + c;
    }
}

// Usage:
Calculator calc = new Calculator();
System.out.println(calc.add(5, 10));           // 15 (int overload)
System.out.println(calc.add(5.5, 10.5));       // 16.0 (double overload)
System.out.println(calc.add("Hello", "World")); // HelloWorld (String overload)
System.out.println(calc.add(1, 2, 3));         // 6 (three int overload)
```

### Benefits
- **Flexibility**: Write code that works with many types
- **Extensibility**: Add new types without changing existing code
- **Maintainability**: Single loop/method handles multiple types
- **Loose Coupling**: Depend on abstract interfaces, not concrete classes

---

## 5. Composition (Has-A Relationship)

### What It Is
**An object contains other objects as members (has-a relationship), using them to build complex behavior.**

- Alternative to inheritance for code reuse
- More flexible than inheritance; avoids fragile base class problem
- "Favor composition over inheritance" is a design principle

### Real-Life Example
A **car** is composed of an engine, wheels, and transmission. Instead of inheriting from "Vehicle," a car HAS-A engine, HAS-A wheels.

```
Car composition:
  Car has-a Engine (not "Car extends Engine")
  Car has-a Wheels
  Car has-a Transmission
```

### Coding Example

```java
// Smaller, reusable components
public class Engine {
    private String type;  // "V6", "V8", etc.

    public Engine(String type) {
        this.type = type;
    }

    public void start() {
        System.out.println(type + " engine started");
    }

    public void stop() {
        System.out.println(type + " engine stopped");
    }
}

public class Wheels {
    private int count;
    private int size;

    public Wheels(int count, int size) {
        this.count = count;
        this.size = size;
    }

    public void rotate() {
        System.out.println(count + " wheels of size " + size + " rotating");
    }
}

public class Transmission {
    private String type;  // "Automatic", "Manual"

    public Transmission(String type) {
        this.type = type;
    }

    public void shift(String gear) {
        System.out.println("Shifting to " + gear + " with " + type);
    }
}

// Car uses composition: HAS-A Engine, HAS-A Wheels, HAS-A Transmission
public class Car {
    private Engine engine;
    private Wheels wheels;
    private Transmission transmission;
    private String model;

    public Car(String model, String engineType, int wheelSize, String transmissionType) {
        this.model = model;
        this.engine = new Engine(engineType);
        this.wheels = new Wheels(4, wheelSize);
        this.transmission = new Transmission(transmissionType);
    }

    public void start() {
        engine.start();
        wheels.rotate();
        System.out.println(model + " started");
    }

    public void drive(String gear) {
        transmission.shift(gear);
        wheels.rotate();
        System.out.println(model + " driving");
    }

    public void stop() {
        engine.stop();
        System.out.println(model + " stopped");
    }
}

// Usage:
Car myCar = new Car("Tesla Model 3", "Electric", 18, "Automatic");
myCar.start();
myCar.drive("Drive");
myCar.stop();

// Output:
// Electric engine started
// 4 wheels of size 18 rotating
// Tesla Model 3 started
// Shifting to Drive with Automatic
// 4 wheels of size 18 rotating
// Tesla Model 3 driving
// Electric engine stopped
// Tesla Model 3 stopped
```

### Composition vs Inheritance
| Aspect | Inheritance | Composition |
|---|---|---|
| **Relationship** | IS-A (Dog IS-A Animal) | HAS-A (Car HAS-A Engine) |
| **Flexibility** | Less flexible; rigid hierarchy | More flexible; combine components |
| **Reusability** | Methods inherited from parent | Components can be used independently |
| **Maintenance** | Changes to parent affect all children | Components isolated |
| **Use When** | Modeling "is-a" relationships | Modeling "has-a" relationships |

---

## 6. Abstraction vs Encapsulation

| Aspect | Abstraction | Encapsulation |
|---|---|---|
| **Purpose** | Hide complexity; show only essential features | Hide internal state; protect data |
| **Focus** | WHAT the object does | HOW it protects itself |
| **Example** | Abstract class Shape with calculateArea() | Private balance with public withdraw() |
| **Achieved By** | Abstract classes, interfaces, abstract methods | Private/protected access modifiers |
| **Benefit** | Simplifies usage; enables polymorphism | Maintains data integrity; prevents misuse |

---

## Interview Cheat Sheet

| Concept | Key Point | Real-World Use |
|---|---|---|
| **Encapsulation** | Private data + public methods = data protection | Bank account: balance is private, withdraw() is public |
| **Abstraction** | Hide complexity; show only essential interface | Car dashboard: don't see engine mechanics |
| **Inheritance** | Child extends parent; reuse code | Dog/Cat extend Animal; inherit eat(), sleep() |
| **Polymorphism** | Same method, many implementations | Shape.calculateArea() works for Circle, Rectangle, Triangle |
| **Composition** | Objects contain other objects | Car has Engine, Wheels, Transmission |

### Common Interview Questions

1. **"What's the difference between encapsulation and abstraction?"**
   - Encapsulation = hiding internal state via access modifiers
   - Abstraction = hiding complexity via interfaces/abstract classes

2. **"When would you use composition over inheritance?"**
   - When modeling "has-a" relationships
   - When inheritance hierarchy becomes complex or fragile
   - More flexible and maintainable for complex systems

3. **"Give an example of polymorphism."**
   - Method overriding: List<Shape> with Rectangle, Circle, Triangle
   - Method overloading: same method name, different parameters

4. **"Why encapsulate data?"**
   - Prevent invalid states (negative balance, invalid deposits)
   - Change internal implementation without breaking external code
   - Easier to add validation and logging

5. **"What's the advantage of using abstract classes?"**
   - Define interface; force children to implement specific methods
   - Enable polymorphic behavior through common interface
   - Share some common code via non-abstract methods
