# Parking Lot — Low-Level Design

Design a multi-floor parking lot that supports different vehicle and spot types, ticketing, pricing, and payment.

## Requirements

- Park and unpark cars, motorcycles, and trucks.
- Allocate a compatible available spot.
- Issue a ticket at entry and calculate a fee at exit.
- Accept multiple payment methods.
- Show available spots by floor and type.
- Prevent the same spot from being assigned twice.

## Core Model

```text
ParkingLot
  └── ParkingFloor
        └── ParkingSpot

Vehicle -> ParkingTicket -> ParkingSpot
ParkingTicket -> PricingStrategy
ParkingTicket -> Payment
```

### Main Types

```java
enum VehicleType { MOTORCYCLE, CAR, TRUCK }
enum SpotType { MOTORCYCLE, COMPACT, LARGE }
enum SpotStatus { AVAILABLE, OCCUPIED, OUT_OF_SERVICE }
enum TicketStatus { ACTIVE, PAID, LOST }

record Vehicle(String registrationNumber, VehicleType type) {}

final class ParkingSpot {
    private final String id;
    private final SpotType type;
    private SpotStatus status;
    private Vehicle vehicle;

    boolean canFit(Vehicle candidate) { /* compatibility rules */ }
    void occupy(Vehicle candidate) { /* validate and update atomically */ }
    void release() { /* clear vehicle and mark available */ }
}
```

## Responsibilities

| Class | Responsibility |
|---|---|
| `ParkingLot` | Own floors and entry/exit services |
| `ParkingFloor` | Own spots and floor-level availability |
| `ParkingSpot` | Protect occupancy state and compatibility rules |
| `ParkingTicket` | Track vehicle, spot, entry time, and status |
| `SpotAllocationStrategy` | Select a compatible available spot |
| `PricingStrategy` | Calculate the parking fee |
| `PaymentProcessor` | Process a selected payment method |

## Allocation Strategy

```java
interface SpotAllocationStrategy {
    Optional<ParkingSpot> allocate(Vehicle vehicle, List<ParkingFloor> floors);
}

final class NearestSpotStrategy implements SpotAllocationStrategy {
    public Optional<ParkingSpot> allocate(
        Vehicle vehicle,
        List<ParkingFloor> floors
    ) {
        return floors.stream()
            .flatMap(floor -> floor.availableSpots().stream())
            .filter(spot -> spot.canFit(vehicle))
            .findFirst();
    }
}
```

The Strategy pattern allows nearest, cheapest, accessible, or reservation-aware allocation without changing entry logic.

## Park Vehicle Flow

1. Entry gate reads the vehicle details.
2. `ParkingService` asks the allocation strategy for a spot.
3. The selected spot is reserved atomically.
4. A ticket is created with entry time and spot ID.
5. Availability counters and the display board are updated.

```java
ParkingTicket park(Vehicle vehicle) {
    ParkingSpot spot = allocator.allocate(vehicle, lot.getFloors())
        .orElseThrow(NoSpotAvailableException::new);

    spot.occupy(vehicle);
    return ticketRepository.save(ParkingTicket.open(vehicle, spot, clock.now()));
}
```

## Exit and Payment Flow

1. Load and validate the active ticket.
2. Calculate the fee through `PricingStrategy`.
3. Process payment through `PaymentProcessor`.
4. Mark the ticket paid.
5. Release the spot and update availability.

Use idempotency on payment and exit operations so retries do not charge twice or release an already reassigned spot.

## Concurrency

Two gates may choose the same spot at the same time. Protect allocation with one of:

- A database conditional update: `AVAILABLE -> OCCUPIED`.
- A row lock around spot selection.
- A short-lived distributed lock when gates run on different nodes.

The final source of truth must enforce the state transition atomically.

## Extension Points

- Reservations and accessible parking.
- Electric vehicle charging spots.
- Lost-ticket pricing.
- Dynamic or event-based pricing.
- License-plate recognition.
- Multiple parking lots under one operator.

The domain objects should remain independent of database, gate hardware, and payment-provider implementations.
