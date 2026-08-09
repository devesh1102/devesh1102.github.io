# Observer Pattern (Interview Focus)

> **60-sec revision:** Use when multiple components need to react to a single event. The publisher emits one notification, and every subscribed observer handles it independently.

## 1) What problem this solves
Without Observer, the event-producing class must directly call every interested component.  
Observer removes that hard-coded coupling by letting components subscribe to events.

## 2) Mental model
Think of a **YouTube channel**: the creator publishes once, and all subscribers receive the notification.

## 3) Structure
- `OrderEvents` is the publisher/subject.
- `OrderObserver` defines the observer interface.
- Email, analytics, and inventory classes implement it.
- The publisher knows only the observer interface, not concrete classes.

## 4) Runtime flow
1. Observers subscribe to the publisher.
2. An event occurs.
3. The publisher loops through its subscribers.
4. Each observer reacts independently.

> **Runtime idea:** New reactions can be added by registering another observer without changing the publisher.

## 5) Python code

```python
from abc import ABC, abstractmethod

class OrderObserver(ABC):
    @abstractmethod
    def update(self, order_id: str) -> None:
        pass

class EmailObserver(OrderObserver):
    def update(self, order_id: str) -> None:
        print(f"Email sent for order {order_id}")

class AnalyticsObserver(OrderObserver):
    def update(self, order_id: str) -> None:
        print(f"Analytics recorded for order {order_id}")

class OrderEvents:
    def __init__(self):
        self.observers = []

    def subscribe(self, observer: OrderObserver) -> None:
        self.observers.append(observer)

    def order_created(self, order_id: str) -> None:
        for observer in self.observers:
            observer.update(order_id)

events = OrderEvents()
events.subscribe(EmailObserver())
events.subscribe(AnalyticsObserver())
events.order_created("ORD-101")
```

## 6) When to use / when not to use
**Use when**
- Multiple independent components react to one event.
- Subscribers may be added or removed.

**Avoid when**
- Only one fixed action exists.
- Event ordering and failures require a durable message broker.

## 7) Interview one-liner
"I chose Observer because several independent components must react to the same event without coupling them to the publisher."

## 8) Trade-offs
**Pros**
- Loosely coupled publisher and subscribers.
- Easy to add new reactions.

**Cons**
- Event flow can become harder to trace.
- Slow or failing synchronous observers can affect the publisher.

## Interview Check

> **True or False:** "Observer is a good choice when you want multiple components to react to an event without tight coupling."

**Answer: True.**

Observer explicitly decouples the event source (publisher) from the reactions (subscribers). The publisher doesn't know or care who listens; subscribers don't know about each other. Perfect for events like "user signed up" where many services (email, analytics, logging) need to react independently.
