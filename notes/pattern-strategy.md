# Strategy Pattern (Interview Focus)

> **60-sec revision:** Use when you're replacing if/else logic with interchangeable behaviors. Define one interface, put each behavior in a separate implementation, and select the required implementation at runtime.

## 1) What problem this solves
When behavior can change (pricing, ranking, allocation), big if/else chains become hard to maintain.  
Strategy moves each behavior into a separate class so we can swap behavior cleanly.

## 2) Mental model
Think of this like **choosing a route in maps**: fastest route, cheapest route, or shortest route are different strategies.

## 3) Structure
- One interface/abstract contract: `PricingStrategy`.
- Multiple implementations: `RegularPricing`, `SurgePricing`.
- Main flow uses the interface type, not concrete classes.

## 4) Runtime flow
1. Main service receives a `PricingStrategy`.
2. It calls `strategy.price(...)`.
3. Selected implementation decides the behavior at runtime.

> **Runtime idea:** Main class depends on interface. Implementations provide behavior.  
> At runtime, any implementation can be injected without changing main logic.

## 5) Python code

```python
from abc import ABC, abstractmethod

class PricingStrategy(ABC):
    @abstractmethod
    def price(self, base_amount: float) -> float:
        pass

class RegularPricing(PricingStrategy):
    def price(self, base_amount: float) -> float:
        return base_amount

class SurgePricing(PricingStrategy):
    def __init__(self, factor: float):
        self.factor = factor

    def price(self, base_amount: float) -> float:
        return base_amount * self.factor
```

## 6) When to use / when not to use
**Use when**
- You already have multiple policies.
- New policies are expected.

**Avoid when**
- There is only one fixed behavior.
- Extra abstraction adds noise without benefit.

## 7) Interview one-liner
"I chose Strategy because policy varies, and I want runtime swap without editing the calling flow."

## 8) Trade-offs
**Pros**
- Open for extension.
- Cleaner than long conditional branches.

**Cons**
- More classes/indirection.
- Slightly higher conceptual overhead for small cases.

## Strategy vs Factory (common trap question)

> **Myth:** "Factory is used to swap behavior at runtime after objects already exist."
> **False.** That is **Strategy**. Factory only decides *which object gets instantiated* — it makes that call **once**, at creation time.

**Factory is about creation. Strategy is about behavior.**

| | Strategy | Factory |
|---|---|---|
| Question it answers | "Which behavior should I **run**?" | "Which object should I **create**?" |
| When it decides | **After** the object exists | At **instantiation** |
| Category | Behavioral | Creational |
| Swappable later? | Yes — inject a different strategy anytime | No — the type is fixed once built |
| Output | An executed behavior | An instance |

### Side by side

```python
# STRATEGY: object exists; behavior is swapped afterwards.
checkout = CheckoutService(RegularPricing())
checkout.pricing = SurgePricing(1.8)   # same object, new behavior
checkout.total(500)

# FACTORY: decides WHICH object to build, once.
sender = NotificationFactory.create(Channel.SMS)   # decision happens here
sender.send("U-101", "Hi")                          # type is now fixed
```

### They compose well
A factory often **creates the strategy** you then plug in:

```python
strategy = PricingFactory.create(hour_of_day)   # Factory: which strategy object
checkout = CheckoutService(strategy)            # Strategy: how pricing behaves
```

**Say this in an interview:** "Factory picks the implementation at construction time; Strategy lets me change behavior after construction. I use Factory to build the Strategy."

## Interview Check

> **True or False:** "Strategy and Factory do the same thing — they both choose an implementation via polymorphism."

**Answer: False (they compose, not duplicate).**

Both use polymorphism, but they answer different questions:
- **Factory:** "Which object should I instantiate?" (decision at *construction*)
- **Strategy:** "Which behavior should I run?" (decision *after* object exists, swappable)

They often work together: a factory creates the strategy you inject. But they solve different problems.
