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

```python
from enum import Enum

class VehicleType(Enum):
    MOTORCYCLE = 1
    CAR = 2
    TRUCK = 3

class SpotType(Enum):
    MOTORCYCLE = 1
    COMPACT = 2
    LARGE = 3

class SpotStatus(Enum):
    AVAILABLE = 1
    OCCUPIED = 2
    OUT_OF_SERVICE = 3

class TicketStatus(Enum):
    ACTIVE = 1
    PAID = 2
    LOST = 3

class Vehicle:
    def __init__(self, registration_number, vehicle_type):
        self.registration_number = registration_number
        self.type = vehicle_type

class ParkingSpot:
    def __init__(self, spot_id, spot_type):
        self.id = spot_id
        self.type = spot_type
        self.status = SpotStatus.AVAILABLE
        self.vehicle = None

    def can_fit(self, candidate):
        """Check compatibility rules"""
        pass

    def occupy(self, candidate):
        """Validate and update atomically"""
        pass

    def release(self):
        """Clear vehicle and mark available"""
        pass
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

```python
from abc import ABC, abstractmethod
from typing import Optional, List

class SpotAllocationStrategy(ABC):
    @abstractmethod
    def allocate(self, vehicle, floors) -> Optional[ParkingSpot]:
        pass

class NearestSpotStrategy(SpotAllocationStrategy):
    def allocate(self, vehicle, floors) -> Optional[ParkingSpot]:
        for floor in floors:
            for spot in floor.available_spots():
                if spot.can_fit(vehicle):
                    return spot
        return None
```

The Strategy pattern allows nearest, cheapest, accessible, or reservation-aware allocation without changing entry logic.

## Park Vehicle Flow

1. Entry gate reads the vehicle details.
2. `ParkingService` asks the allocation strategy for a spot.
3. The selected spot is reserved atomically.
4. A ticket is created with entry time and spot ID.
5. Availability counters and the display board are updated.

```python
def park(vehicle):
    spot = allocator.allocate(vehicle, lot.get_floors())
    if not spot:
        raise NoSpotAvailableException()

    spot.occupy(vehicle)
    return ticket_repository.save(
        ParkingTicket.open(vehicle, spot, clock.now())
    )
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
