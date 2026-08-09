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

### Coding Example (Python)

```python
class BikeGearSystem:
    def __init__(self):
        self.__current_sprocket = 1      # Private: hidden from user
        self.__chain_tension = 50         # Private: automatically managed
    
    # Public interface: Simple gear shifting
    def shift_up(self):
        if self.__current_sprocket < 21:
            self.__current_sprocket += 1
            self.__adjust_chain_tension()  # Internal: user doesn't call this
            print(f"Shifted to gear {self.__current_sprocket}")
    
    def shift_down(self):
        if self.__current_sprocket > 1:
            self.__current_sprocket -= 1
            self.__adjust_chain_tension()
            print(f"Shifted to gear {self.__current_sprocket}")
    
    def get_current_gear(self):
        return self.__current_sprocket    # Safe read-only access
    
    # Private method: HOW it works is HIDDEN
    def __adjust_chain_tension(self):
        if self.__current_sprocket < 10:
            self.__chain_tension = 45
        elif self.__current_sprocket < 15:
            self.__chain_tension = 50
        else:
            self.__chain_tension = 55

# Usage:
bike = BikeGearSystem()
bike.shift_up()                    # ✓ Allowed
bike.shift_down()                  # ✓ Allowed
print(bike.get_current_gear())     # Safe: returns 0 (started at 1, down to 0)
```

**Key insight:** User interacts with simple public methods. All complexity is hidden. If implementation changes, user code stays the same.

### Benefits
- **Simplicity**: Complex internals hidden behind simple public interface
- **Flexibility**: Implementation can change without affecting users
- **Protection**: Users can't break internal state
- **Maintenance**: Internal changes don't cascade

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

### Coding Example (Python)

```python
from abc import ABC, abstractmethod

# Abstract interface: users see only essential operations
class Database(ABC):
    @abstractmethod
    def connect(self):
        pass
    
    @abstractmethod
    def query(self, sql):
        pass
    
    @abstractmethod
    def disconnect(self):
        pass

# Concrete implementation: How it's really done
class MySQLDatabase(Database):
    def connect(self):
        print("Validating credentials...")
        print("TCP handshake, SSL negotiation...")
        print("Connected to MySQL")
    
    def query(self, sql):
        print(f"Executing: {sql}")
        return ["user1", "user2", "user3"]
    
    def disconnect(self):
        print("MySQL connection closed")

# Usage: User sees only essential methods
db = MySQLDatabase()
db.connect()
results = db.query("SELECT * FROM users")
db.disconnect()
```

### Benefits
- **Simplicity**: Complex systems become easy to use
- **Security**: Internal mechanisms protected from misuse
- **Flexibility**: Can swap implementations without changing user code

---

## 3. Inheritance

### What It Is
**Creating a hierarchy where a child class inherits properties and methods from a parent class, promoting code reuse.**

### Real-Life Example
**Vehicle hierarchy**: Cars, motorcycles, and trucks are all vehicles. They share common features (wheels, engine, brakes) but have specific behaviors.

```
Vehicle (parent)
├── Car (child)
├── Motorcycle (child)
└── Truck (child)

All inherit: start(), stop(), accelerate()
Truck overrides: carry()
Motorcycle overrides: lean()
```

### Coding Example (Python)

```python
# Parent class: common properties and methods
class Animal:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def eat(self):
        print(f"{self.name} is eating")
    
    def sleep(self):
        print(f"{self.name} is sleeping")

# Child class 1: inherits from Animal
class Dog(Animal):
    def eat(self):
        # Override parent method with dog-specific behavior
        print(f"{self.name} is eating dog food")
    
    def bark(self):
        print(f"{self.name} says: Woof!")

# Child class 2: inherits from Animal
class Cat(Animal):
    def eat(self):
        print(f"{self.name} is eating cat food")
    
    def meow(self):
        print(f"{self.name} says: Meow!")

# Usage:
dog = Dog("Buddy", 3)
dog.eat()      # "Buddy is eating dog food" (overridden)
dog.sleep()    # "Buddy is sleeping" (inherited)

cat = Cat("Whiskers", 2)
cat.eat()      # "Whiskers is eating cat food" (overridden)
cat.sleep()    # "Whiskers is sleeping" (inherited)
```

### Benefits
- **Code Reuse**: Common behavior defined once in parent
- **Maintainability**: Changes propagate to all children
- **Hierarchy**: Logical organization of related types

---

## 4. Polymorphism

### What It Is
**"Many forms"—ability of objects to respond differently to the same message based on their type.**

Two types:
1. **Runtime**: Child class overrides parent method
2. **Compile-time**: Same method name, different parameters (via *args in Python)

### Real-Life Example
A **shape** can have `calculate_area()`. Rectangle: length × width. Circle: π × r². Triangle: 0.5 × base × height. Same method, different logic.

### Coding Example: Runtime Polymorphism (Python)

```python
from abc import ABC, abstractmethod
import math

# Parent class with abstract method
class Shape(ABC):
    @abstractmethod
    def calculate_area(self):
        pass
    
    def print_info(self):
        print(f"Area: {self.calculate_area()}")

# Concrete implementations
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

# Polymorphic usage: same code works with different types
shapes = [
    Rectangle(5, 10),
    Circle(7),
    Triangle(6, 8)
]

for shape in shapes:
    shape.print_info()

# Output:
# Area: 50.0
# Area: 153.93804...
# Area: 24.0
```

### Benefits
- **Flexibility**: Write code that works with many types
- **Extensibility**: Add new types without changing existing code
- **Loose Coupling**: Depend on interfaces, not concrete classes

---

## 5. Composition (Has-A Relationship)

### What It Is
**An object contains other objects as members (has-a relationship), using them to build complex behavior.**

- Alternative to inheritance for code reuse
- More flexible than inheritance
- "Favor composition over inheritance" is a best practice

### Real-Life Example
A **car** is composed of an engine, wheels, and transmission. Instead of inheriting, a car HAS-A engine, HAS-A wheels.

### Coding Example (Python)

```python
# Smaller, reusable components
class Engine:
    def __init__(self, engine_type):
        self.type = engine_type
    
    def start(self):
        print(f"{self.type} engine started")
    
    def stop(self):
        print(f"{self.type} engine stopped")

class Wheels:
    def __init__(self, count, size):
        self.count = count
        self.size = size
    
    def rotate(self):
        print(f"{self.count} wheels of size {self.size} rotating")

class Transmission:
    def __init__(self, transmission_type):
        self.type = transmission_type
    
    def shift(self, gear):
        print(f"Shifting to {gear} with {self.type}")

# Car uses composition: HAS-A Engine, HAS-A Wheels, HAS-A Transmission
class Car:
    def __init__(self, model, engine_type, wheel_size, transmission_type):
        self.model = model
        self.engine = Engine(engine_type)
        self.wheels = Wheels(4, wheel_size)
        self.transmission = Transmission(transmission_type)
    
    def start(self):
        self.engine.start()
        self.wheels.rotate()
        print(f"{self.model} started")
    
    def drive(self, gear):
        self.transmission.shift(gear)
        self.wheels.rotate()
        print(f"{self.model} driving")
    
    def stop(self):
        self.engine.stop()
        print(f"{self.model} stopped")

# Usage:
my_car = Car("Tesla Model 3", "Electric", 18, "Automatic")
my_car.start()
my_car.drive("Drive")
my_car.stop()
```

### Composition vs Inheritance
| Aspect | Inheritance | Composition |
|---|---|---|
| **Relationship** | IS-A (Dog IS-A Animal) | HAS-A (Car HAS-A Engine) |
| **Flexibility** | Less flexible | More flexible |
| **Reusability** | Through parent class | Through components |
| **Use When** | "is-a" relationships | "has-a" relationships |

---

## Interview Cheat Sheet

| Concept | Key Point | Real-World Use |
|---|---|---|
| **Encapsulation** | Private data + public methods | Bike gears: complexity hidden |
| **Abstraction** | Hide complexity, show interface | Car dashboard: don't see engine |
| **Inheritance** | Child extends parent | Dog/Cat extend Animal |
| **Polymorphism** | Same method, many forms | Shape.calculate_area() for all shapes |
| **Composition** | Objects contain objects | Car has Engine, Wheels |

### Common Interview Questions

1. **"What's the difference between encapsulation and abstraction?"**
   - Encapsulation = hiding internal state
   - Abstraction = hiding complexity via interfaces

2. **"When use composition over inheritance?"**
   - For "has-a" relationships
   - More flexible and maintainable

3. **"Give an example of polymorphism."**
   - Shape.calculate_area() works for Circle, Rectangle, Triangle

4. **"Why encapsulate data?"**
   - Prevent invalid states
   - Change implementation without breaking code

5. **"Advantage of abstract classes?"**
   - Force children to implement methods
   - Enable polymorphic behavior
   - Share common code
