# Factory Pattern (Interview Focus)

> **60-sec revision:** Use when the concrete class to create depends on input, and callers should not know the concrete types. Move the `if/switch` on type into one factory so creation rules live in a single place.

## 1) What problem this solves
Callers end up doing `if channel == "email": EmailSender() elif ...` in many places.
Every new type forces you to hunt down and edit each of those call sites.
Factory puts that decision in one class, so callers just ask for what they need.

## 2) Mental model
Think of a **coffee machine**: you press "latte" or "espresso". You don't assemble the drink yourself, and you don't care which internal recipe object runs.

## 3) Structure
- `NotificationSender` is the interface callers depend on.
- `EmailSender`, `SmsSender`, `PushSender` implement it.
- `NotificationFactory` owns the mapping from input to concrete class.
- The caller depends on the interface and the factory, never on concrete classes.

## 4) Runtime flow
1. Caller passes a type/enum to the factory.
2. Factory decides which concrete class to build.
3. Factory returns it as the interface type.
4. Caller uses it without knowing which implementation it got.

> **Runtime idea:** Adding a new type means editing one factory, not every call site.

## 5) Python code

```python
from abc import ABC, abstractmethod
from enum import Enum

class Channel(Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"

class NotificationSender(ABC):
    @abstractmethod
    def send(self, user_id: str, message: str) -> None:
        pass

class EmailSender(NotificationSender):
    def send(self, user_id: str, message: str) -> None:
        print(f"Email to {user_id}: {message}")

class SmsSender(NotificationSender):
    def send(self, user_id: str, message: str) -> None:
        print(f"SMS to {user_id}: {message}")

class PushSender(NotificationSender):
    def send(self, user_id: str, message: str) -> None:
        print(f"Push to {user_id}: {message}")

class NotificationFactory:
    _registry = {
        Channel.EMAIL: EmailSender,
        Channel.SMS: SmsSender,
        Channel.PUSH: PushSender,
    }

    @classmethod
    def create(cls, channel: Channel) -> NotificationSender:
        sender_cls = cls._registry.get(channel)
        if sender_cls is None:
            raise ValueError(f"Unsupported channel: {channel}")
        return sender_cls()

sender = NotificationFactory.create(Channel.SMS)
sender.send("U-101", "Your order shipped")
```

## 6) When to use / when not to use
**Use when**
- The concrete type is decided by input at runtime.
- Creation rules are repeated across the codebase.
- Callers should stay decoupled from concrete classes.

**Avoid when**
- There is only one implementation.
- Construction is trivial and unlikely to change.

## 7) Interview one-liner
"I chose Factory because the concrete sender depends on the channel, and I want that decision in one place instead of scattered across callers."

## 8) Trade-offs
**Pros**
- One place to change creation rules.
- Callers depend only on the interface.

**Cons**
- One more indirection layer.
- The factory itself can grow if too many types are added.

## Factory vs Builder (common follow-up)

| Question | Factory | Builder |
|---|---|---|
| What varies? | **Which class** to create | **How to configure** one class |
| Driven by | A type/enum input | Many optional fields |
| Returns | One of several subtypes | One fully-built object |

## Factory vs Strategy (common trap question)

> **Myth:** "Factory is used to swap behavior at runtime after objects already exist."
> **False.** That is Strategy. Factory decides *which object gets created* — it makes the decision **once, at creation time**, and returns the right type.

**Factory is about creation. Strategy is about behavior.**

| | Factory | Strategy |
|---|---|---|
| Question it answers | "Which object should I **create**?" | "Which behavior should I **run**?" |
| When it decides | At **instantiation** | **After** the object already exists |
| Category | Creational | Behavioral |
| Can you swap later? | No — the object is already built | Yes — inject a different strategy anytime |
| Output | An instance | An executed behavior |

### Side by side

```python
# FACTORY: decides WHICH object to build, once.
sender = NotificationFactory.create(Channel.SMS)   # decision happens here
sender.send("U-101", "Hi")                          # type is now fixed

# STRATEGY: object exists; behavior is swapped afterwards.
checkout = CheckoutService(RegularPricing())
checkout.pricing = SurgePricing(1.8)   # swapped at runtime, same object
checkout.total(500)
```

### They compose well
A factory often **creates the strategy** you then plug in:

```python
strategy = PricingFactory.create(hour_of_day)   # Factory: which strategy object
checkout = CheckoutService(strategy)            # Strategy: how pricing behaves
```

**Say this in an interview:** "Factory picks the implementation at construction time; Strategy lets me change behavior after construction. I use Factory to build the Strategy."

---

## Quiz: True or False?

> **"Factory pattern is used to swap behavior at runtime after objects already exist."**

**Answer: False.**

Factory decides *which object to instantiate* — the decision is made **once, at creation time**, and the type is then fixed. That's exactly what Strategy does (swap behavior after the object exists). The two are often confused because both use polymorphism, but they answer different questions:
- Factory: "Which class should I **build**?"
- Strategy: "Which behavior should I **run**?"
