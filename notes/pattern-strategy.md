# Strategy Pattern (Interview Focus)

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
