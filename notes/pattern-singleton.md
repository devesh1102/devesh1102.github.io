# Singleton Pattern (Interview Focus)

## 1) What problem this solves
Sometimes we need **exactly one shared object** for the entire app (for example, config store or in-memory registry).  
Singleton ensures every caller uses the same instance instead of creating duplicates.

## 2) Mental model
Think of this like a **building reception desk**: there is one desk everyone goes to for official information.

## 3) Structure
- `ConfigStore` class controls instance creation.
- First call creates the object.
- Later calls return the same object.

## 4) Runtime flow
1. Caller asks for `ConfigStore()`.
2. If instance does not exist, create it.
3. Return the same instance to all future callers.

## 5) Python code

```python
class ConfigStore:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.settings = {}
        return cls._instance
```

## 6) When to use / when not to use
**Use when**
- One shared state/object is truly required.
- Multiple instances can cause inconsistency.

**Avoid when**
- You want easy unit testing and isolated dependencies.
- Dependency injection can solve it more cleanly.

## 7) Interview one-liner
"I chose Singleton because this resource should have one shared instance across the app."

## 8) Trade-offs
**Pros**
- Consistent shared state.
- Simple global access point.

**Cons**
- Hidden coupling.
- Harder testing and concurrency concerns if overused.
