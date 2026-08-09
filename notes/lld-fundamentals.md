# Low-Level Design Fundamentals

Low-Level Design (LLD) converts requirements into classes, interfaces, methods, and object relationships that are easy to understand, test, and extend.

## HLD vs LLD

| Area | HLD | LLD |
|---|---|---|
| Focus | Services, databases, queues, and data flow | Classes, interfaces, methods, and object collaboration |
| Primary concern | Scale, availability, and architecture | Maintainability, extensibility, and correctness |
| Typical output | Architecture and sequence diagrams | Class diagrams, APIs, and interaction flows |
| Common trade-off | Consistency vs availability | Simplicity vs flexibility |

## A Repeatable LLD Process

1. Clarify the functional requirements and constraints.
2. Identify the core entities and their responsibilities.
3. Define relationships and lifecycle ownership.
4. Model important states and state transitions.
5. Introduce interfaces where behavior can vary.
6. Walk through the main use cases with sequence flows.
7. Check edge cases, concurrency, errors, and testability.

Avoid creating classes directly from every noun. A class should own meaningful state or behavior.

## OOP Building Blocks

### Encapsulation

Keep an object's state private and expose operations that preserve its invariants. For example, an `Order` should expose `cancel()` rather than allowing callers to set its status directly.

### Abstraction

Expose what a component does while hiding how it does it. A `PaymentProcessor` interface lets the checkout flow work without knowing Stripe- or bank-specific details.

### Inheritance

Use inheritance only for a genuine **is-a** relationship with stable shared behavior. Deep inheritance trees make change risky.

### Polymorphism

Different implementations can satisfy the same contract:

```python
from abc import ABC, abstractmethod

class PricingStrategy(ABC):
    @abstractmethod
    def calculate(self, ticket):
        pass

class HourlyPricing(PricingStrategy):
    def calculate(self, ticket):
        return Money.of_hours(ticket.duration)
```

### Composition

Prefer assembling behavior from small collaborators. A `CheckoutService` can compose inventory, payment, and notification interfaces instead of inheriting from them.

## SOLID Principles

| Principle | Practical meaning |
|---|---|
| Single Responsibility | A class should have one reason to change |
| Open/Closed | Add new behavior through extension instead of editing stable code |
| Liskov Substitution | Implementations must preserve the promises of their base contract |
| Interface Segregation | Prefer small, focused interfaces over large general-purpose ones |
| Dependency Inversion | Depend on abstractions at boundaries where implementations vary |

SOLID is guidance, not a target class count. Apply it where it reduces coupling and makes expected changes safer.

## UML Relationships

- **Association:** one object uses or knows another.
- **Aggregation:** a weak whole-part relationship; the part can exist independently.
- **Composition:** the whole owns the part's lifecycle.
- **Dependency:** an object temporarily uses another object.
- **Inheritance:** a subtype specializes a parent type.
- **Realization:** a class implements an interface.

## Model State Explicitly

If behavior depends heavily on status, model valid transitions instead of scattering conditionals:

```text
CREATED -> CONFIRMED -> IN_PROGRESS -> COMPLETED
    |           |
    +--------> CANCELLED
```

Reject invalid transitions at the domain boundary. This keeps invariants close to the object that owns them.

## Design for Change

Introduce an abstraction when at least one of these is true:

- Multiple implementations already exist.
- A variation is an explicit requirement.
- The dependency crosses an external boundary.
- Isolating it significantly improves testing.

Do not add factories, interfaces, or patterns only because they may be useful someday.

## Interview Checklist

- Are responsibilities clearly assigned?
- Are important invariants protected?
- Can expected variations be added without large rewrites?
- Are invalid states and transitions prevented?
- Are concurrency-sensitive operations identified?
- Can core logic be tested without external systems?
- Can you explain why each pattern or abstraction exists?
