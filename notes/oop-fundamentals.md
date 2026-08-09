# OOP Fundamentals

**Concise Definition**: "Object-Oriented Programming organizes code into objects that combine data and behavior, enabling modularity, reusability, and maintainability through encapsulation, inheritance, polymorphism, and abstraction."

**Architectural Definition**: "OOP provides a blueprint for designing systems by modeling entities as self-contained objects with well-defined interfaces, reducing coupling, improving testability, and enabling scalable design patterns commonly used in large-scale systems."

---

## 🚴 Running Example: Bike System

Throughout these concepts, we'll use a **bicycle** as our consistent example. A bike has multiple interacting parts, making it perfect for illustrating OOP principles:

- **Gear System** (Encapsulation)
- **Wheel Component** (Abstraction)
- **Component Hierarchy** (Inheritance)
- **Brake Types** (Polymorphism)
- **Full Bike Assembly** (Composition)

---

## 1. Encapsulation

### What It Is
**Bundling data (state) and methods (behavior) together, hiding internal details from the outside world.**

- Data members are private; controlled access via public methods
- Protects object integrity by preventing invalid state changes
- Reduces coupling between components

### Real-Life Example: Bike Gear System
You shift gears using a simple lever. Internally, complex mechanisms (derailleur, chain, sprockets) automatically adjust—but you don't need to know HOW they work.

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

### Coding Example (Python)

```python
class BikeGearSystem:
    def __init__(self):
        self.__current_sprocket = 1      # Private: hidden from user
        self.__chain_tension = 50         # Private: automatically managed
        self.__max_gears = 21
    
    # Public interface: Simple gear shifting
    def shift_up(self):
        if self.__current_sprocket < self.__max_gears:
            self.__current_sprocket += 1
            self.__adjust_chain_tension()  # Internal: user doesn't call this
            print(f"✓ Shifted to gear {self.__current_sprocket}")
        else:
            print("✗ Already at max gear")
    
    def shift_down(self):
        if self.__current_sprocket > 1:
            self.__current_sprocket -= 1
            self.__adjust_chain_tension()
            print(f"✓ Shifted to gear {self.__current_sprocket}")
        else:
            print("✗ Already at min gear")
    
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
        print(f"  ↳ Chain tension auto-adjusted to {self.__chain_tension}")

# Usage:
gears = BikeGearSystem()
gears.shift_up()                    # ✓ Allowed
gears.shift_up()                    # ✓ Allowed
print(gears.get_current_gear())     # Returns: 2
# gears.__current_sprocket = 100    # ✗ ERROR! Private - can't access directly
```

**Key insight:** User interacts with simple public methods. All complexity (`__adjust_chain_tension`) is hidden. If implementation changes, user code stays the same.

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

### Real-Life Example: Bike Wheel
You care about: "Does it spin?", "Does it brake?". You don't care about: spoke tension, rim pressure, bearing friction, hub mechanics.

```
What user sees: A wheel that spins and brakes
Hidden complexity: Spoke arrangement, bearing type, rim material, braking friction
User just: Pedals and brakes without understanding wheel mechanics
```

### Coding Example (Python)

```python
from abc import ABC, abstractmethod

# Abstract: Define WHAT the wheel should do
class BicycleWheel(ABC):
    @abstractmethod
    def spin(self, speed_kmh):
        """How fast the wheel rotates"""
        pass
    
    @abstractmethod
    def brake(self, force):
        """How much braking force to apply"""
        pass
    
    @abstractmethod
    def get_speed(self):
        """Get current speed"""
        pass

# Concrete: Mountain Bike Wheel - HOW it works
class MountainBikeWheel(BicycleWheel):
    def __init__(self):
        self.__speed = 0
        self.__friction = 0.8          # Heavy tread = more friction
    
    def spin(self, speed_kmh):
        self.__speed = speed_kmh
        print(f"🚴 Mountain wheel spinning at {speed_kmh} km/h (rugged tread)")
    
    def brake(self, force):
        deceleration = force * self.__friction
        self.__speed = max(0, self.__speed - deceleration)
        print(f"  ↳ Braked! Speed now: {self.__speed} km/h")
    
    def get_speed(self):
        return self.__speed

# Concrete: Road Bike Wheel - HOW it works (differently!)
class RoadBikeWheel(BicycleWheel):
    def __init__(self):
        self.__speed = 0
        self.__friction = 0.5          # Smooth tread = less friction (faster)
    
    def spin(self, speed_kmh):
        self.__speed = speed_kmh
        print(f"🚴 Road wheel spinning at {speed_kmh} km/h (smooth tire)")
    
    def brake(self, force):
        deceleration = force * self.__friction
        self.__speed = max(0, self.__speed - deceleration)
        print(f"  ↳ Braked! Speed now: {self.__speed} km/h")
    
    def get_speed(self):
        return self.__speed

# Usage: Both wheels implement same interface, but behave differently
print("=== Mountain Bike ===")
mtb_wheel = MountainBikeWheel()
mtb_wheel.spin(20)
mtb_wheel.brake(5)

print("\n=== Road Bike ===")
road_wheel = RoadBikeWheel()
road_wheel.spin(25)
road_wheel.brake(5)

# User doesn't need to know: bearing mechanics, rim materials, spoke tension
# User just calls: spin(), brake(), get_speed()
```

**Key insight:** Users see only essential methods. Implementation details are completely hidden. Same interface, different behaviors.

### Benefits
- **Simplicity**: Users see only essential operations
- **Flexibility**: Can have different implementations (mountain vs road wheel)
- **Separation of concerns**: Interface separate from implementation
- **Easy swapping**: Replace one wheel with another without changing bike code

---

## 3. Inheritance

### What It Is
**Creating a hierarchy where a child class inherits properties and methods from a parent class, promoting code reuse.**

### Real-Life Example: Bike Component Hierarchy
A bike has many components. Some are wheels, some are not. But all components share common properties:

```
BikeComponent (parent)
├── Wheel (child)
├── Frame (child)
├── Handlebar (child)
└── Seat (child)

All inherit: install(), weight, material
Wheel overrides: spin()
Frame overrides: absorb_impact()
```

### Coding Example (Python)

```python
# Parent class: common properties for all bike components
class BikeComponent:
    def __init__(self, name, weight_grams, material):
        self.name = name
        self.weight_grams = weight_grams
        self.material = material
        self.installed = False
    
    def install(self):
        self.installed = True
        print(f"✓ {self.name} installed ({self.weight_grams}g, {self.material})")
    
    def get_weight(self):
        return self.weight_grams

# Child class 1: Wheel-specific behavior
class Wheel(BikeComponent):
    def __init__(self, size_inches):
        super().__init__(f"{size_inches}\" Wheel", 1200, "Aluminum")
        self.size = size_inches
        self.pressure_psi = 80
    
    def spin(self):
        print(f"⚡ Wheel spinning at {self.size} inches")
    
    def inflate(self, psi):
        self.pressure_psi = psi
        print(f"  ↳ Inflated to {psi} PSI")

# Child class 2: Frame-specific behavior
class Frame(BikeComponent):
    def __init__(self):
        super().__init__("Frame", 2500, "Carbon Fiber")
        self.stiffness = "high"
    
    def absorb_impact(self):
        print(f"💪 Frame absorbs impact (stiffness: {self.stiffness})")

# Usage: Children inherit install(), get_weight() from parent
print("=== Installing Components ===")
wheel = Wheel(26)
wheel.install()                     # Inherited from BikeComponent
wheel.spin()                        # Specific to Wheel

frame = Frame()
frame.install()                     # Inherited from BikeComponent
frame.absorb_impact()               # Specific to Frame

print(f"\nWheel weight: {wheel.get_weight()}g")  # Inherited method
print(f"Frame weight: {frame.get_weight()}g")    # Inherited method
```

**Key insight:** Common behavior (`install()`, `get_weight()`) defined once in parent. Each child adds its own specific behavior (`spin()`, `absorb_impact()`).

### Benefits
- **Code Reuse**: Common behavior defined once in parent
- **Maintainability**: Changes to `install()` affect all components
- **Hierarchy**: Logical organization of related types
- **DRY Principle**: Don't Repeat Yourself

---

## 4. Polymorphism

### What It Is
**"Many forms"—ability of objects to respond differently to the same message based on their type.**

Two types:
1. **Runtime (Method Overriding)**: Child class overrides parent method
2. **Compile-time (Method Overloading)**: Same method name, different parameters

### Real-Life Example: Bike Brake Types
Different brake types respond to the same `brake()` call, but differently:

- **Disc Brake**: Uses hydraulic pads to grip a rotor (modern, powerful)
- **Rim Brake**: Squeezes wheel rim directly (classic, simple)
- **Coaster Brake**: Brakes when pedaling backward (beach cruiser)

Same method call, different behavior!

### Coding Example (Python)

```python
from abc import ABC, abstractmethod

# Abstract: Define common brake interface
class Brake(ABC):
    def __init__(self, name):
        self.name = name
    
    @abstractmethod
    def brake(self, force):
        """Apply braking force - implementation varies by type"""
        pass

# Concrete 1: Disc Brake (modern mountain bikes)
class DiscBrake(Brake):
    def __init__(self):
        super().__init__("Disc Brake")
        self.rotor_temperature = 30  # Celsius
    
    def brake(self, force):
        # Hydraulic pads grip rotor
        deceleration = force * 2.0   # Very powerful!
        self.rotor_temperature += force * 5
        print(f"🛑 {self.name}: Hydraulic pads grip rotor")
        print(f"  ↳ Deceleration: {deceleration} m/s² (Rotor: {self.rotor_temperature}°C)")

# Concrete 2: Rim Brake (classic road bikes)
class RimBrake(Brake):
    def __init__(self):
        super().__init__("Rim Brake")
        self.pad_wear = 0
    
    def brake(self, force):
        # Rubber pads squeeze wheel rim
        deceleration = force * 1.2   # Moderate power
        self.pad_wear += force * 0.5
        print(f"🛑 {self.name}: Rubber pads squeeze wheel rim")
        print(f"  ↳ Deceleration: {deceleration} m/s² (Pad wear: {self.pad_wear:.1f}%)")

# Concrete 3: Coaster Brake (beach cruisers)
class CoasterBrake(Brake):
    def __init__(self):
        super().__init__("Coaster Brake")
        self.resistance = 0.8
    
    def brake(self, force):
        # Pedal backward to brake
        deceleration = force * self.resistance
        print(f"🛑 {self.name}: Pedal backward to brake")
        print(f"  ↳ Deceleration: {deceleration} m/s²")

# Usage: Same brake() call, different behavior!
print("=== Different Brake Types ===\n")
brakes = [DiscBrake(), RimBrake(), CoasterBrake()]

for brake in brakes:
    brake.brake(force=5)
    print()

# Polymorphism in action: Each brake responds differently
# User just calls: bike.brake(force)
# System decides: which brake type to use
```

**Key insight:** All brakes implement `brake()`, but each responds differently. Code using brakes doesn't need to know the type—it just calls `brake()`.

### Benefits
- **Flexibility**: Can add new brake types without changing existing code
- **Extensibility**: Easy to extend with DiscBrake, RimBrake, etc.
- **Simplicity**: Bike code doesn't care which brake type it uses
- **Loose coupling**: Brake implementations are independent

---

## 5. Composition

### What It Is
**Building complex objects by combining simpler objects (PREFER over inheritance).**

- Bike is composed of: Wheel, Frame, Brake, Gear System
- Bike IS-NOT a Wheel (no inheritance)
- Bike HAS-A Wheel, HAS-A Frame (composition)

**Rule of thumb:** Use Inheritance for "IS-A", use Composition for "HAS-A"

### Real-Life Example: Building a Complete Bike
Instead of inheriting from multiple classes (impossible in single-inheritance), compose a bike from independent components.

```
Bike IS composed of:
├── 2x Wheel
├── 1x Frame
├── 1x Brake (front)
├── 1x Brake (rear)
├── 1x GearSystem
└── 1x Handlebar
```

### Coding Example (Python)

```python
class BikeGearSystem:
    def __init__(self):
        self.__gear = 1
    
    def shift_up(self):
        if self.__gear < 21:
            self.__gear += 1
        return self.__gear
    
    def get_gear(self):
        return self.__gear

class Wheel:
    def __init__(self, size):
        self.size = size
        self.speed = 0
    
    def spin(self, force):
        self.speed = force * 10
        return self.speed

class Brake:
    def __init__(self, position):
        self.position = position  # 'front' or 'rear'
    
    def brake(self, force):
        print(f"🛑 {self.position.upper()} brake applied (force: {force})")

class Handlebar:
    def __init__(self):
        self.angle = 0
    
    def turn(self, angle):
        self.angle = angle
        print(f"↻ Handlebar turned {angle}°")

# COMPOSITION: Bike is made OF these components
class Bike:
    def __init__(self):
        self.front_wheel = Wheel(26)      # HAS-A Wheel
        self.rear_wheel = Wheel(26)       # HAS-A Wheel
        self.gears = BikeGearSystem()     # HAS-A GearSystem
        self.front_brake = Brake('front') # HAS-A Brake
        self.rear_brake = Brake('rear')   # HAS-A Brake
        self.handlebar = Handlebar()      # HAS-A Handlebar
    
    def ride(self):
        print("🚴 Starting to ride...")
        self.front_wheel.spin(5)
        self.rear_wheel.spin(5)
        self.gears.shift_up()
        print(f"  ↳ Speed: {self.front_wheel.speed} km/h")
        print(f"  ↳ Gear: {self.gears.get_gear()}")
    
    def stop(self):
        print("🛑 Stopping...")
        self.front_brake.brake(10)
        self.rear_brake.brake(10)

# Usage:
bike = Bike()
bike.ride()
bike.handlebar.turn(45)
bike.stop()
```

**Key insight:** Bike is composed of independent components. Each component does one thing well. Bike orchestrates them together.

### Benefits
- **Flexibility**: Can swap components (upgrade wheel, change brake type)
- **Reusability**: Wheel, Brake, Handlebar can be used in other vehicles
- **Testability**: Each component is independently testable
- **Simplicity**: No complex inheritance hierarchies
- **Real-world match**: How bikes are actually built!

---

## 6. Comparison: When to Use Which

| Concept | Use Case | Bike Example | When to Choose |
|---------|----------|--------------|-----------------|
| **Encapsulation** | Hide internal state | GearSystem hides `__current_sprocket` | Always! Protects data integrity |
| **Abstraction** | Hide complexity behind interface | BicycleWheel abstract class | When implementation varies (MountainWheel vs RoadWheel) |
| **Inheritance** | Share common behavior | BikeComponent parent for Wheel, Frame, Seat | "IS-A" relationship (Wheel IS-A BikeComponent) |
| **Polymorphism** | Same interface, different behavior | Brake subclasses (Disc, Rim, Coaster) | Multiple implementations of same interface |
| **Composition** | Build from parts | Bike composed of Wheel + Frame + Brake | "HAS-A" relationship (Bike HAS-A Wheel) PREFER! |

### Decision Tree for Bike Design

```
Should Frame extend BikeComponent?
├─ YES (IS-A): Use Inheritance
│  └─ Frame IS-A BikeComponent
│
Should Bike contain multiple components?
├─ YES (HAS-A): Use Composition
│  └─ Bike HAS-A Wheel, Frame, Brake
│
Should different brakes behave differently?
├─ YES: Use Polymorphism
│  └─ DiscBrake vs RimBrake vs CoasterBrake
│
Should GearSystem hide internal state?
├─ YES: Use Encapsulation
│  └─ Hide __current_sprocket, __chain_tension
│
Should BicycleWheel hide complexity?
├─ YES: Use Abstraction
│  └─ Abstract interface with concrete implementations
```

### Complete Bike Example: All 5 Concepts Together

```python
# 1. ENCAPSULATION: Gear system hides state
class BikeGearSystem:
    def __init__(self):
        self.__gear = 1
    
    def shift_up(self):
        if self.__gear < 21:
            self.__gear += 1

# 2. ABSTRACTION: Wheel hides complexity
class BicycleWheel(ABC):
    @abstractmethod
    def spin(self): pass

# 3. INHERITANCE: Wheel/Frame inherit from Component
class Wheel(BikeComponent): pass
class Frame(BikeComponent): pass

# 4. POLYMORPHISM: Different brake types
class DiscBrake(Brake):
    def brake(self, force): # Hydraulic power
class RimBrake(Brake):
    def brake(self, force): # Rim squeeze

# 5. COMPOSITION: Bike orchestrates all
class Bike:
    def __init__(self):
        self.wheel = Wheel()           # HAS-A
        self.frame = Frame()           # HAS-A
        self.gears = BikeGearSystem()  # HAS-A
        self.brake = DiscBrake()       # HAS-A
```

---

## Interview Cheat Sheet

### Encapsulation
- **Q**: How do you protect object state?
- **A**: Make members private (`__variable`), provide public getter/setter methods
- **Example**: BikeGearSystem hides `__current_sprocket`

### Abstraction
- **Q**: How do you hide implementation complexity?
- **A**: Define abstract interface, provide concrete implementations
- **Example**: BicycleWheel abstract class, MountainBikeWheel concrete class

### Inheritance
- **Q**: How do you share code across classes?
- **A**: Create parent class with common behavior, child classes override/extend
- **Example**: BikeComponent parent, Wheel/Frame children

### Polymorphism
- **Q**: How do different objects respond to same method?
- **A**: Child classes override parent method with their own implementation
- **Example**: DiscBrake, RimBrake, CoasterBrake all implement `brake()` differently

### Composition
- **Q**: When should you use composition over inheritance?
- **A**: When you have "HAS-A" relationships (Bike HAS-A Wheel, not Bike IS-A Wheel)
- **Example**: Bike class composed of Wheel, Frame, Brake, GearSystem

### Which to Use?
- **Need to hide state?** → Encapsulation
- **Complex implementation?** → Abstraction
- **Share common behavior?** → Inheritance (IS-A)
- **Different behaviors, same interface?** → Polymorphism
- **Build from parts?** → Composition (HAS-A)
