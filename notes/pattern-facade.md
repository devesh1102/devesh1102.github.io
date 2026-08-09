# Facade Pattern (Interview Focus)

> **60-sec revision:** Put one simple class in front of several complex subsystems. The facade coordinates their calls so clients depend on one clear API instead of understanding every internal component.

## 1) What problem this solves
A workflow may require clients to call inventory, payment, order, and notification services in the correct sequence.  
Facade hides that coordination behind one meaningful operation.

## 2) Mental model
Think of a **hotel reception desk**: you ask one person to check in, while they coordinate the room, payment, keys, and housekeeping systems.

## 3) Structure
- Subsystem classes perform specialized work.
- `CheckoutFacade` depends on those subsystems.
- Client code calls one high-level facade method.
- The facade coordinates the workflow but does not replace domain logic owned by each subsystem.

## 4) Runtime flow
1. Client calls `checkout(...)`.
2. Facade checks inventory.
3. Facade processes payment and creates the order.
4. Facade sends the confirmation and returns the result.

> **Runtime idea:** The client sees one stable interface while the facade handles subsystem order and collaboration internally.

## 5) Python code

```python
class CheckoutFacade:
    def __init__(self, inventory, payment, orders, notifications):
        self.inventory = inventory
        self.payment = payment
        self.orders = orders
        self.notifications = notifications

    def checkout(self, user_id, item_id, amount):
        self.inventory.reserve(item_id)
        payment_id = self.payment.charge(user_id, amount)
        order = self.orders.create(user_id, item_id, payment_id)
        self.notifications.send_confirmation(order)
        return order
```

## 6) When to use / when not to use
**Use when**
- Clients must coordinate several subsystems.
- You want a simpler, stable entry point for a common workflow.

**Avoid when**
- Clients need direct access to different subsystem capabilities.
- The facade would become a large class containing all business logic.

## 7) Interview one-liner
"I chose Facade to expose one checkout operation while hiding the sequencing and coordination of multiple subsystems."

## 8) Trade-offs
**Pros**
- Simpler client code.
- Reduces coupling to subsystem details.

**Cons**
- Adds another abstraction layer.
- Can become a god class if too much logic is placed inside it.

## Interview Check

> **True or False:** "Facade is just another name for a big service class that coordinates multiple components."

**Answer: False (it's intentional & bounded).**

The key difference: a Facade *intentionally* wraps multiple subsystems to provide *one high-level operation* (checkout, hotel check-in). A "big service class" often grows chaotically without clear boundaries. A good facade has a narrow, meaningful contract. Say this: "Facade is a deliberate coordination point for a specific workflow; a god service is accidental complexity."
