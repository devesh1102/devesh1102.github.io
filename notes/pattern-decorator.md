# Decorator Pattern (Interview Focus)

> **60-sec revision:** Start with a basic pizza and wrap it with topping objects. Each topping implements the same `Pizza` interface, adds its own description and price, and delegates to the pizza inside it.

## 1) What problem this solves
Adding every combination of optional behavior through inheritance creates too many subclasses.  
Decorator adds behavior by wrapping an existing object, so features can be combined at runtime.

## 2) Mental model
Think of ordering a **pizza with toppings**: start with a plain pizza, then add cheese, mushrooms, or olives. Each topping adds something without changing the original pizza class.

## 3) Structure
- `Pizza` defines the common interface.
- `PlainPizza` provides the base description and price.
- Each topping implements `Pizza` and holds another `Pizza`.
- Client code uses `Pizza`, so it can receive a plain pizza or any combination of toppings.

## 4) Runtime flow
1. Create a `PlainPizza`.
2. Wrap it with `CheeseTopping`.
3. Wrap that result with `MushroomTopping`.
4. The outer topping adds its value and delegates to the pizza inside it.

> **Runtime idea:** Because the pizza and every topping share the same interface, toppings can be combined in any order at runtime.

## 5) Python code

```python
from abc import ABC, abstractmethod

class Pizza(ABC):
    @abstractmethod
    def description(self) -> str:
        pass

    @abstractmethod
    def cost(self) -> int:
        pass

class PlainPizza(Pizza):
    def description(self) -> str:
        return "Plain pizza"

    def cost(self) -> int:
        return 200

class PizzaTopping(Pizza):
    def __init__(self, pizza: Pizza):
        self.pizza = pizza

class CheeseTopping(PizzaTopping):
    def description(self) -> str:
        return f"{self.pizza.description()}, cheese"

    def cost(self) -> int:
        return self.pizza.cost() + 50

class MushroomTopping(PizzaTopping):
    def description(self) -> str:
        return f"{self.pizza.description()}, mushrooms"

    def cost(self) -> int:
        return self.pizza.cost() + 40

pizza = MushroomTopping(CheeseTopping(PlainPizza()))
print(pizza.description())  # Plain pizza, cheese, mushrooms
print(pizza.cost())         # 290
```

## 6) When to use / when not to use
**Use when**
- Features must be combined independently at runtime.
- Modifying the original class is undesirable.

**Avoid when**
- Behavior is fixed and simple.
- Many wrapper layers would make execution difficult to trace.

## 7) Interview one-liner
"I chose Decorator because toppings must be combined at runtime without changing the base pizza or creating a subclass for every topping combination."

## 8) Trade-offs
**Pros**
- Flexible runtime composition.
- Keeps each added responsibility focused.

**Cons**
- Creates several small wrapper objects.
- Deep wrapping can make debugging harder.

## Interview Check

> **When should you use Decorator instead of creating subclasses for every combination of behaviors?**
>
> Options:
> 1. When all behavior combinations are known at compile time
> 2. **When you want to compose behaviors at runtime without subclass explosion** ✓
> 3. When each behavior combination needs its own specific implementation
> 4. When there are only two variations of behavior

**Why:** Decorator helps avoid the subclass explosion problem (LoggedEmailNotification, EncryptedEmailNotification, LoggedEncryptedEmailNotification, etc.). Instead, you wrap the base object with decorator layers that can be combined in any order at runtime.
