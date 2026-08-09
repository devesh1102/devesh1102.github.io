# Elevator System — Low-Level Design

Design an elevator system that accepts hall and car requests, selects an elevator, moves safely, and handles concurrent events.

## Requirements

- Support multiple elevators and floors.
- Accept hall requests with an up or down direction.
- Accept floor selections from inside an elevator.
- Choose an appropriate elevator for each hall request.
- Open and close doors safely.
- Prevent movement while doors are open.
- Support maintenance and emergency states.

## Core Model

```text
ElevatorSystem
  ├── ElevatorController
  │     └── ElevatorCar
  │           ├── Door
  │           └── RequestQueue
  └── DispatchStrategy
```

```java
enum Direction { UP, DOWN, IDLE }
enum ElevatorState { IDLE, MOVING, STOPPED, MAINTENANCE, EMERGENCY }
enum DoorState { OPEN, CLOSED, OPENING, CLOSING, BLOCKED }

record HallRequest(int floor, Direction direction) {}
record CarRequest(int destinationFloor) {}
```

## Elevator Car

```java
final class ElevatorCar {
    private final String id;
    private int currentFloor;
    private Direction direction = Direction.IDLE;
    private ElevatorState state = ElevatorState.IDLE;
    private final Door door;
    private final NavigableSet<Integer> upStops = new TreeSet<>();
    private final NavigableSet<Integer> downStops =
        new TreeSet<>(Comparator.reverseOrder());

    void addStop(int floor) { /* add to the direction-aware queue */ }
    void step() { /* perform one safe state transition */ }
}
```

The elevator owns its movement state and stop queues. Callers submit requests but cannot directly change its floor, direction, or door state.

## Dispatch Strategy

```java
interface DispatchStrategy {
    ElevatorCar select(HallRequest request, List<ElevatorCar> elevators);
}
```

A simple cost function can prefer:

1. An idle elevator close to the requested floor.
2. An elevator already moving toward the floor in the requested direction.
3. The available elevator with the lowest estimated delay.

```text
cost = distance
     + directionMismatchPenalty
     + queuedStopsPenalty
     + capacityPenalty
```

The Strategy pattern allows the scheduler to evolve without changing elevator behavior.

## Request Flow

### Hall Request

1. A floor panel creates a `HallRequest`.
2. The controller asks the dispatch strategy to select an elevator.
3. The controller assigns the pickup floor to that elevator.
4. The floor display receives the selected elevator and arrival updates.

### Car Request

1. A passenger selects a destination.
2. The elevator validates the floor.
3. The stop is added to the up or down queue.
4. The elevator continues serving stops in its current direction.

## Movement State Machine

```text
IDLE
  -> MOVING
  -> STOPPED
  -> DOOR OPENING
  -> DOOR OPEN
  -> DOOR CLOSING
  -> MOVING or IDLE
```

Important invariants:

- The elevator moves only when the door is fully closed.
- An elevator in maintenance or emergency mode accepts no normal requests.
- Door obstruction returns the door to the open state.
- Requests outside the building's floor range are rejected.

## Scheduling Stops

Maintain two ordered sets:

- `upStops`: ascending floors.
- `downStops`: descending floors.

While moving up, serve `upStops` in ascending order. When empty, switch direction and serve `downStops`. This is similar to the SCAN disk-scheduling algorithm and avoids frequent direction changes.

## Concurrency

Hall panels, car panels, sensors, and timers can emit events simultaneously. Process each elevator's events through a serialized queue or actor so its state transitions remain ordered.

The system-level controller may operate concurrently across elevators, but each individual elevator should have a single logical owner for mutable state.

## Failure and Safety Cases

- Door obstruction or sensor failure.
- Elevator overload.
- Emergency stop or fire mode.
- Power loss and recovery.
- Controller loses communication with one elevator.
- Duplicate button presses.

Safety events take priority over scheduling efficiency and should transition the elevator into an explicit restricted state.

## Extension Points

- Destination dispatch, where passengers choose a floor before entering.
- VIP or service modes.
- Energy-aware grouping and parking floors.
- Peak-hour strategies.
- Accessibility controls and voice announcements.
