# Design Patterns for LLD

Design patterns are reusable collaboration models. Use them to solve a demonstrated design problem, not to make a design look sophisticated.

## Creational Patterns

### Factory

Centralizes object creation when the concrete type depends on input.

```python
def create(channel):
    match channel:
        case Channel.EMAIL:
            return EmailSender()
        case Channel.SMS:
            return SmsSender()
        case Channel.PUSH:
            return PushSender()
```

Use it when creation rules are changing or callers should not know concrete classes.

### Builder

Constructs objects with many optional fields while keeping validation readable.

```python
query = (SearchQuery.builder()
    .city("Bengaluru")
    .check_in(check_in)
    .check_out(check_out)
    .guests(2)
    .build())
```

### Singleton

Guarantees one process-local instance. Prefer dependency-injection container lifetimes because global state makes testing and concurrency harder.

## Structural Patterns

### Adapter

Converts an external or legacy API into the interface expected by the application.

```python
class StripePaymentAdapter(PaymentGateway):
    def __init__(self, stripe):
        self.stripe = stripe

    def charge(self, request):
        return map(self.stripe.create_charge(to_stripe_request(request)))
```

### Decorator

Wraps an implementation to add behavior such as metrics, retries, caching, or authorization without changing the core class.

### Facade

Provides a simple entry point over a complex subsystem. A `CheckoutFacade` may coordinate inventory, payment, order creation, and notifications.

## Behavioral Patterns

### Strategy

Encapsulates interchangeable algorithms. Common examples include pricing, allocation, ranking, and dispatch policies.

```python
class SpotAllocationStrategy:
    def find_spot(self, vehicle, available):
        raise NotImplementedError
```

### Observer

Notifies subscribers when an event occurs. It works well for in-process events; distributed systems usually require a durable broker instead.

### State

Moves state-specific behavior into separate objects when a large switch statement grows with every new status.

### Command

Represents an action as an object. It is useful for queues, undo, audit logs, retries, and scheduling.

### Chain of Responsibility

Passes a request through ordered handlers until one handles it or the chain ends. Common uses include validation, middleware, and approval flows.

## Pattern Selection Guide

| Problem | Pattern |
|---|---|
| Concrete type varies at creation time | Factory |
| Object has many optional construction parameters | Builder |
| External API does not match your interface | Adapter |
| Add behavior around an existing implementation | Decorator |
| Algorithm or policy varies | Strategy |
| Behavior changes significantly by state | State |
| Multiple listeners react to an event | Observer |
| Ordered handlers process a request | Chain of Responsibility |

## Common Mistakes

- Starting with a pattern before understanding requirements.
- Creating an interface for every class without a variation boundary.
- Using inheritance where composition is simpler.
- Combining business logic with persistence or transport code.
- Building generic frameworks for a single known use case.

The best pattern is the smallest one that makes the next expected change straightforward.
