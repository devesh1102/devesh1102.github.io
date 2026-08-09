# Builder Pattern (Interview Focus)

## 1) What problem this solves
When an object has many optional parameters, constructors become hard to read and easy to misuse.  
Builder creates the object step-by-step and validates required fields in one place.

## 2) Mental model
Think of this like **ordering a custom burger**: choose base, toppings, extras, then finalize the order.

## 3) Structure
- Core model: `RideRequest`.
- Separate builder: `RideRequestBuilder`.
- Builder collects values and calls `build()` after validation.

## 4) Runtime flow
1. Caller sets fields one by one through fluent methods.
2. `build()` checks required data.
3. Valid object is created once all rules pass.

## 5) Python code

```python
class RideRequest:
    def __init__(self, pickup, drop, rider_id, vehicle_type="auto", coupon=None):
        self.pickup = pickup
        self.drop = drop
        self.rider_id = rider_id
        self.vehicle_type = vehicle_type
        self.coupon = coupon

class RideRequestBuilder:
    def __init__(self):
        self._pickup = None
        self._drop = None
        self._rider_id = None
        self._vehicle_type = "auto"
        self._coupon = None

    def pickup(self, value):
        self._pickup = value
        return self

    def drop(self, value):
        self._drop = value
        return self

    def rider(self, rider_id):
        self._rider_id = rider_id
        return self

    def vehicle(self, vehicle_type):
        self._vehicle_type = vehicle_type
        return self

    def coupon(self, code):
        self._coupon = code
        return self

    def build(self):
        if not self._pickup or not self._drop or not self._rider_id:
            raise ValueError("pickup, drop, and rider_id are required")
        return RideRequest(
            self._pickup, self._drop, self._rider_id, self._vehicle_type, self._coupon
        )
```

## 6) When to use / when not to use
**Use when**
- Too many optional fields hurt readability.
- You need centralized construction validation.

**Avoid when**
- Object is small/simple.
- A normal constructor is already clear.

## 7) Interview one-liner
"I chose Builder to keep object construction readable and enforce validation at creation time."

## 8) Trade-offs
**Pros**
- Readable creation flow.
- Better validation and fewer constructor mistakes.

**Cons**
- Extra boilerplate.
- More code than simple constructors.

## Interview Check

> **True or False:** "Builder is better than Factory for all cases of object construction."

**Answer: False.**

Builder is great when you have many optional fields and want a readable fluent interface. Factory is better when you want to polymorphically choose *which* class to instantiate. Use the right tool for the job:
- **Builder:** Complex objects with optional fields / readable construction.
- **Factory:** Deciding which implementation class to instantiate.
