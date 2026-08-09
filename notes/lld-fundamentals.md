# LLD Interview Framework

Use this as your **thinking structure during interviews**.

---

## Phase 1: Clarify Requirements (4-5 min)
**Goal:** avoid designing the wrong thing.

- Ask for core operations (create/update/delete/search/etc.).
- Confirm rules and constraints (limits, validations, error behavior).
- Define in-scope vs out-of-scope explicitly.

**Say:** "Before I design classes, let me confirm requirements and boundaries."

---

## Phase 2: Identify Core Entities (3-4 min)
**Goal:** convert requirements into domain objects.

- List key nouns (User, Order, Slot, Payment...).
- Decide ownership: who owns state and lifecycle?
- Sketch relations quickly (association/composition).

**Say:** "I will model entities around ownership of state and behavior."

---

## Phase 3: Define Class Contracts (8-10 min)
**Goal:** design clean APIs before coding.

- For each class: state, methods, invariants.
- Keep behavior close to data that owns it.
- Use interfaces only where variation is expected.

**Say:** "I'll expose intent-based methods, not raw data manipulation."

---

## Phase 4: Walk Through Happy Path + Edge Cases (8-10 min)
**Goal:** prove design correctness.

- Run one concrete scenario end-to-end.
- Then check 2-3 critical edge cases.
- Highlight where validation and state transitions happen.

**Say:** "I'll validate with one normal flow and then edge conditions."

---

## Phase 5: Extensibility and Trade-offs (3-5 min)
**Goal:** show senior-level design thinking.

- Explain where change is expected and why.
- Show one extension ("What if we add X?") with minimal impact.
- Mention trade-offs: simplicity vs flexibility, coupling vs abstraction.

**Say:** "This design optimizes for current scope while keeping extension points here."

---

## 30-Second LLD Interview Checklist

1. Did I confirm requirements and boundaries?
2. Are responsibilities clearly split across classes?
3. Are invariants enforced by the right class?
4. Did I validate with a scenario and edge cases?
5. Can I explain one extension without redesigning everything?
