# UML & Class Diagrams (Interview Focus)

> **60-sec revision:** You get ~3 minutes to draw. Boxes = classes, arrows = relationships. Learn 5 arrows: inheritance, realization, composition, aggregation, association. Say the relationship out loud as you draw it.

## Why this matters
In an LLD round you are judged on whether the interviewer can **read your design in 10 seconds**.
A clean box-and-arrow sketch does that. A wall of text does not.

---

## 1) The class box

Draw three sections. Skip the bottom section if you are short on time.

```text
+---------------------------+
|        ParkingSpot        |   <- name
+---------------------------+
| - id: str                 |   <- state (attributes)
| - status: SpotStatus      |
+---------------------------+
| + occupy(vehicle): void   |   <- behavior (methods)
| + release(): void         |
+---------------------------+
```

Visibility markers: `+` public, `-` private, `#` protected.

---

## 2) The 5 arrows you actually need

| Relationship | Arrow | Meaning | Say this |
|---|---|---|---|
| **Inheritance** | `<|——` solid line, hollow triangle | Subclass **is-a** parent | "Car is-a Vehicle" |
| **Realization** | `<|- - -` dashed line, hollow triangle | Class **implements** interface | "EmailSender implements NotificationSender" |
| **Composition** | `◆——` filled diamond | Owner controls part's **lifecycle** | "Delete the Order, its OrderItems die too" |
| **Aggregation** | `◇——` hollow diamond | Whole **has-a** part, part survives alone | "Team has Players, players outlive the team" |
| **Association** | `——>` plain arrow | One class **uses/knows** another | "Order uses PaymentProcessor" |

### Composition vs Aggregation — the one-line test
**"If I delete the whole, does the part still make sense?"**
- No → composition (filled diamond).
- Yes → aggregation (hollow diamond).

### Dependency (bonus)
`- - ->` dashed arrow: a **temporary** use, usually a method parameter or local variable — not a stored field.

---

## 3) Multiplicity

Write the numbers on the line ends. Interviewers look for this.

```text
ParkingLot  1 ◆———— 1..*  ParkingFloor
ParkingFloor 1 ◆———— 0..*  ParkingSpot
ParkingSpot  1 ————— 0..1  Vehicle
```

| Notation | Meaning |
|---|---|
| `1` | exactly one |
| `0..1` | optional |
| `1..*` | one or more |
| `0..*` or `*` | any number |

---

## 4) ASCII class diagram you can draw fast

```text
                 <<interface>>
                PricingStrategy
                      ^
                      | (realization, dashed)
        +-------------+-------------+
        |                           |
  HourlyPricing               FlatRatePricing


   ParkingLot
       |◆ 1..*
       v
  ParkingFloor
       |◆ 0..*
       v
  ParkingSpot  <----- association -----  ParkingTicket
```

Mark interfaces with `<<interface>>` above the name. Mark abstract classes as `<<abstract>>` or italicize.

---

## 5) Sequence diagram (when they ask "walk me through the flow")

Use this for the happy path. Columns are objects, arrows are calls, time flows down.

```text
Gate        ParkingService     Allocator      Spot        TicketRepo
 |                |               |            |              |
 |--park(veh)---->|               |            |              |
 |                |--allocate()-->|            |              |
 |                |<---spot-------|            |              |
 |                |----------occupy(veh)------>|              |
 |                |--------------save(ticket)----------------->|
 |<---ticket------|               |            |              |
```

Keep it to 4-5 participants. More than that and it stops being readable.

---

## 6) State diagram (when behavior depends on status)

```text
   [start]
      |
      v
   CREATED ---pay()---> PAID ---ship()---> SHIPPED ---deliver()---> DELIVERED
      |                  |
      +----cancel()------+---> CANCELLED
```

Use this whenever you say "it depends on the state" — it pairs directly with the State Machine pattern.

---

## 7) Interview drawing order (do it in this sequence)

1. **Boxes first.** Drop every core entity as a plain box. No details yet.
2. **Arrows next.** Connect them and say the relationship out loud.
3. **Multiplicity.** Add `1`, `1..*`, `0..*` on the lines.
4. **Fill key fields/methods.** Only for the 2-3 most important classes.
5. **Mark extension points.** Circle where an interface allows variation.

---

## 8) Common mistakes

- Using inheritance arrows where it is really **composition** (most common error).
- Drawing every getter and setter — noise, wastes time.
- Detailing all 10 classes instead of the 3 that matter.
- Never labelling multiplicity, so the interviewer can't tell 1:1 from 1:many.
- Drawing silently. **Narrate as you draw** — the reasoning is what is scored.

---

## Interview cheat sheet

| You want to show | Draw |
|---|---|
| Structure of the system | Class diagram |
| How a request flows | Sequence diagram |
| Behavior changes by status | State diagram |
| "is-a" | Hollow triangle, solid line |
| "implements interface" | Hollow triangle, dashed line |
| "owns, dies together" | Filled diamond |
| "has, survives apart" | Hollow diamond |
| "just uses" | Plain arrow |
