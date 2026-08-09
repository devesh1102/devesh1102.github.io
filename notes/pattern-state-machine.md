# State Machine Pattern (Interview Focus)

> **60-sec revision:** Use when an object's behavior depends on its current state and transitions get messy. Define valid states and transitions explicitly instead of scattering state checks across methods.

## 1) What problem this solves
Large if/else blocks make it difficult to understand which actions are valid in each state.  
A state machine centralizes transition rules and prevents invalid state changes.

## 2) Mental model
Think of a **traffic light**: green can move to yellow, yellow to red, and red to green. It cannot jump through arbitrary transitions.

## 3) Structure
- `OrderState` lists the possible states.
- A transition map defines which next states are valid.
- `Order` owns its current state.
- All state changes go through one transition method.

## 4) Runtime flow
1. An object starts in an initial state.
2. A caller requests a transition.
3. The object checks whether it is valid.
4. It changes state or rejects the request.

> **Runtime idea:** Current state controls which transitions and operations are allowed.

## 5) Python code

```python
from enum import Enum

class OrderState(Enum):
    CREATED = "created"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

ALLOWED_TRANSITIONS = {
    OrderState.CREATED: {OrderState.PAID, OrderState.CANCELLED},
    OrderState.PAID: {OrderState.SHIPPED, OrderState.CANCELLED},
    OrderState.SHIPPED: {OrderState.DELIVERED},
    OrderState.DELIVERED: set(),
    OrderState.CANCELLED: set(),
}

class Order:
    def __init__(self):
        self.state = OrderState.CREATED

    def transition_to(self, next_state: OrderState) -> None:
        if next_state not in ALLOWED_TRANSITIONS[self.state]:
            raise ValueError(
                f"Cannot transition from {self.state.value} "
                f"to {next_state.value}"
            )
        self.state = next_state
```

## 6) When to use / when not to use
**Use when**
- Behavior changes significantly by current state.
- Valid transitions must be enforced.

**Avoid when**
- There are only two simple states.
- A boolean or small validation is already clear.

## 7) Interview one-liner
"I chose a State Machine because behavior and valid operations depend on the current state, and transitions must be controlled."

## 8) Trade-offs
**Pros**
- Explicit, safe transitions.
- Easier reasoning and testing.

**Cons**
- Adds structure and boilerplate.
- The transition model must be updated when states change.

## Interview Check

> **True or False:** "State Machine and Strategy solve the same problem — handling multiple conditional behaviors."

**Answer: False (state machines track *history*).**

- **Strategy:** Choose a behavior based on inputs; no memory of what came before.
- **State Machine:** The object's behavior depends on its *current state*, and transitions are *explicit rules*. State Machine remembers history; Strategy does not.

Example: A vending machine's next valid action depends on its current state (Idle vs. MoneyReceived). An order's next allowed action depends on its state (Pending vs. Shipped vs. Delivered). Strategy doesn't capture this inherent state dependency.
