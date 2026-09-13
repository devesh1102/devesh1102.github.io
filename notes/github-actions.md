# GitHub Actions — High-Level System Design

## TL;DR
* **Core challenge**: Turn every Git push into a reliable, observable workflow while safely executing untrusted code at massive scale.
* **Kafka + job scheduler**: Kafka buffers workflow events and runnable jobs; the scheduler consumes them, applies dependencies, labels, quotas, priority, and capacity rules, then assigns each job or subtask to a compatible runner.
* **Workflow orchestration**: The orchestrator parses the workflow into a DAG, tracks job dependencies, and releases downstream jobs only after their prerequisites complete.
* **Execution isolation**: Each job runs in an ephemeral container or VM with strict CPU, memory, filesystem, network, and secret boundaries.
* **Reliable state and logs**: A durable database stores workflow state, object storage retains logs, and Redis supports short-lived leases, heartbeats, cancellation signals, and live-log delivery.
* **Failure model**: Leases, retries, idempotency keys, and immutable job attempts provide at-least-once execution without losing workflow history.

---

## Step 1: Problem Statement

Design a GitHub Actions–style workflow execution platform that supports:

### Functional Requirements

1. Users can trigger a workflow on each Git push using the workflow file defined in the repository.
2. Workflows execute in isolated, sandboxed environments with access only to permitted repository secrets.
3. Users can observe workflow execution in near real time:
   - Overall workflow status
   - Per-job / per-step status
   - Live logs
4. Support cancellation and retry of workflow jobs.

### System Scale

- ~10M repositories
- ~10 pushes/sec average
- ~100 pushes/sec during 10x bursts
- ~100K concurrently executing jobs at peak

---

## Step 2: Key Design Insight

The most important observation is:

> **Git push is a control-plane event; workflow execution is a large-scale distributed job-scheduling problem.**

Therefore, separate the system into:

- **Control plane** — accepts events, stores workflow state, orchestrates workflows, schedules jobs.
- **Execution plane** — runs arbitrary workflow code in isolated environments.

The key execution flow is:

```text
Git Push
   |
   v
Webhook / Commit Service
   |
   v
Kafka
   |
   v
Workflow Orchestrator
   |
   v
Job Scheduler
   |
   v
Runner Manager
   |
   v
Isolated Runner / Sandbox
```

---

## Step 3: High-Level Architecture

```text
                         +-------------+
                         |   Client    |
                         +------+------+
                                |
                                v
                         +-------------+
                         | API Gateway |
                         +------+------+
                                |
                +---------------+----------------+
                |                                |
                v                                v
        +---------------+                  +-----------+
        | Commit/Webhook|                  | Query API |
        | Service       |                  |           |
        +-------+-------+                  +-----+-----+
                |                                |
                v                                v
        +---------------+                  +-----------+
        | Kafka         |                  | DB        |
        +-------+-------+                  +-----------+
                |
                v
        +---------------+
        | Orchestrator  |
        +-------+-------+
                |
                v
        +---------------+
        | Job Scheduler |
        +-------+-------+
                |
          +-----+-----+
          |           |
          v           v
    +-----------+ +-----------+
    | Runner    | | Runner    |
    | Pool      | | Pool      |
    +-----+-----+ +-----+-----+
          |             |
          v             v
      +-------+     +-------+
      |Sandbox|     |Sandbox|
      +---+---+     +---+---+
          |             |
          +------+------+
                 |
          +------+------+
          |             |
          v             v
        S3/Object     Log Service
        Storage          |
                         v
                      Redis
                         |
                         v
                     WebSocket
                         |
                         v
                       Client


              +------------------+
              | Secrets Service  |
              +--------+---------+
                       |
                       v
                     Runner
```

---

## Step 4: Why Kafka?

Kafka decouples workflow ingestion from execution.

Without Kafka:

```text
Git Push
   |
   v
Execute Workflow
```

A burst of 100 pushes/sec could overwhelm the execution infrastructure.

With Kafka:

```text
Git Push
   |
   v
Kafka
   |
   +---- 100 events/sec burst
   |
   v
Orchestrator
   |
   v
Scheduler
   |
   v
Available runner capacity
```

Kafka provides:

- Buffering
- Replay
- Consumer scaling
- Backpressure
- Decoupling between ingestion and execution
- Ordering within a partition

The system can absorb bursts without immediately requiring equivalent runner capacity.

---

## Step 5: Workflow Orchestrator

The orchestrator converts a workflow definition into executable jobs.

Example workflow:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest

  test:
    needs: build
    runs-on: ubuntu-latest

  deploy:
    needs: test
    runs-on: ubuntu-latest
```

The orchestrator builds a DAG:

```text
       build
         |
         v
        test
         |
         v
       deploy
```

For independent jobs:

```text
       build
      /     \
     v       v
   test     lint
      \     /
       v   v
       deploy
```

The orchestrator should:

1. Fetch the workflow file.
2. Validate and parse it.
3. Create a workflow run.
4. Build the job dependency graph.
5. Identify runnable jobs.
6. Submit runnable jobs to the scheduler.
7. React to job completion/failure.
8. Unlock dependent jobs.
9. Update overall workflow status.

---

## Step 6: Job Scheduler

This is one of the most important components.

The scheduler answers:

> **Which runner should execute this job?**

A job can specify:

```yaml
runs-on: ubuntu-latest
```

or:

```yaml
runs-on: windows-latest
```

or:

```yaml
runs-on: [self-hosted, gpu]
```

Therefore, scheduling may depend on:

- OS
- CPU architecture
- Runner labels
- CPU/memory requirements
- Availability
- Repository permissions
- Organization permissions
- Runner capacity
- Priority
- Tenant quota
- Concurrency limits

Architecture:

```text
                 Job Scheduler
                       |
       +---------------+---------------+
       |               |               |
       v               v               v
    Linux pool     Windows pool     ARM pool
       |               |               |
       v               v               v
    Runners         Runners         Runners
```

---

## Step 7: Runner Architecture

Do not let a generic worker process execute arbitrary repository code directly.

Workflow code is untrusted and potentially malicious.

Use:

```text
Scheduler
    |
    v
Runner Manager
    |
    v
Runner
    |
    v
Sandbox
```

Example:

```text
Runner Host

+-----------------------------------+
| Runner                            |
|                                   |
|   +---------------------------+   |
|   | Job Container / VM        |   |
|   |                           |   |
|   | checkout                  |   |
|   | npm install               |   |
|   | npm test                  |   |
|   | build                     |   |
|   +---------------------------+   |
|                                   |
+-----------------------------------+
```

For stronger isolation:

```text
VM per job
```

For higher density:

```text
Container per job
```

The trade-off is:

- Containers: faster startup and better density.
- VMs: stronger isolation, higher startup/cost overhead.

For arbitrary untrusted code, isolation is a first-class requirement.

---

## Step 8: Database Design

Use a durable database as the source of truth.

### Repository

```text
Repository
-----------
repo_id
owner_id
workflow_config
permissions
```

### Workflow Run

```text
WorkflowRun
-----------
run_id
repo_id
commit_sha
status
created_at
started_at
completed_at
```

### Job

```text
Job
-----------
job_id
run_id
name
status
runner_requirements
attempt
```

### Step

```text
Step
-----------
step_id
job_id
name
status
started_at
completed_at
```

### Job Attempt

```text
JobAttempt
-----------
attempt_id
job_id
runner_id
status
started_at
completed_at
```

Large logs should NOT be stored in the primary database.

---

## Step 9: Redis

Redis should be used for ephemeral/fast-changing state rather than as the system of record.

Good use cases:

- Runner heartbeats
- Job leases
- Active job state
- Cancellation signals
- Rate limiting
- Temporary log streaming
- WebSocket/session state

Example runner heartbeat:

```text
runner:A -> TTL 30 seconds
```

Runner periodically renews:

```text
heartbeat
heartbeat
heartbeat
```

If the TTL expires:

```text
Runner considered dead
        |
        v
Job lease expires
        |
        v
Scheduler retries job
```

---

## Step 10: Log Architecture

Do not store large workflow logs in Redis or the primary DB.

Use two paths:

### Real-time path

```text
Runner
   |
   v
Log Service
   |
   v
Redis / PubSub
   |
   v
WebSocket
   |
   v
Client
```

### Durable path

```text
Runner
   |
   v
Object Storage (S3)
```

This gives the user live logs while also retaining logs for historical viewing.

Example UI:

```text
Build #182

✓ Checkout
✓ Install dependencies
⟳ Running tests

stdout:
-------------------------
Running test 1...
Running test 2...
Running test 3...
-------------------------
```

---

## Step 11: Secrets

Secrets require special security treatment.

Architecture:

```text
                +------------------+
                | Secrets Service  |
                +--------+---------+
                         |
                         v
                       Runner
```

The runner should only receive secrets authorized for that repository/workflow.

Prefer short-lived credentials/tokens where possible rather than distributing long-lived credentials.

Important protections:

- Encryption at rest
- Encryption in transit
- RBAC
- Repository/organization-level authorization
- Secret masking in logs
- Never persist secrets unnecessarily
- Sandbox/network isolation

---

## Step 12: Multi-Tenancy

With 10M repositories, infrastructure must be shared.

However, one organization should not be able to consume all runner capacity.

Example:

```text
Organization A
    |
    +--> quota: 500 concurrent jobs

Organization B
    |
    +--> quota: 100 concurrent jobs
```

The scheduler should support:

- Tenant quotas
- Fair scheduling
- Priority
- Concurrency limits
- Per-repository limits
- Organization-level limits

A useful mental model is:

```text
                    Scheduler
                        |
          +-------------+-------------+
          |             |             |
       Tenant A      Tenant B      Tenant C
       quota 500     quota 100     quota 50
```

---

## Step 13: Scaling to 100K Concurrent Jobs

Avoid a single scheduler/worker.

Scale horizontally:

```text
                    Scheduler
                        |
          +-------------+-------------+
          |             |             |
       Queue 1       Queue 2       Queue N
          |             |             |
       Workers        Workers       Workers
          |             |             |
       Runners        Runners       Runners
```

Potential partitioning dimensions:

- Region
- Runner type
- Priority
- Tenant
- Queue partition

The goal is to ensure no single component becomes a bottleneck.

---

## Step 14: Failure Handling

A major interview topic is what happens when a runner dies.

Example:

```text
Job
 |
 v
Runner
 |
 X Runner crashes
```

Use a lease:

```text
Job status = RUNNING
Lease = 30 seconds
```

Runner periodically renews the lease.

If the runner disappears:

```text
Lease expires
      |
      v
Scheduler detects failure
      |
      v
Retry job
```

However, job execution should generally be treated as:

> **At-least-once execution, not exactly-once execution.**

Example failure:

```text
Runner completes job
        |
        X
Runner crashes before reporting SUCCESS
```

The scheduler may retry the job even though the first attempt actually completed.

Therefore, workflows and external operations should ideally be idempotent where possible.

---

## Step 15: Cancellation

Cancellation flow:

```text
Client
  |
  v
API
  |
  v
DB
  |
  v
Cancellation Event
  |
  v
Scheduler
  |
  v
Runner
  |
  v
Terminate Sandbox
```

The scheduler/control plane should own the authoritative job state.

Do not rely only on the API directly communicating with a runner.

---

## Step 16: Why Separate Orchestrator, Scheduler and Runner?

This is an important interview question.

Instead of:

```text
Kafka
  |
  v
Worker
```

use:

```text
Kafka
  |
  v
Workflow Orchestrator
  |
  v
Job Scheduler
  |
  v
Runner Manager
  |
  v
Isolated Runner
```

### Orchestrator

Understands:

- Workflow
- DAG
- Dependencies
- Workflow state

### Scheduler

Understands:

- Runner availability
- Labels
- Capacity
- Quotas
- Priority
- Fairness

### Runner

Understands:

- Executing shell commands
- Containers/VMs
- Checkout
- Step execution
- Log production

This separation allows each layer to scale independently.

---

## Step 17: Capacity Estimation

Start the interview with:

```text
10 pushes/sec average
100 pushes/sec burst
100K concurrent jobs
```

Then estimate:

### Job arrival rate

If one push creates an average of N jobs:

```text
jobs/sec = pushes/sec × average jobs per workflow
```

For example, if:

```text
10 pushes/sec
×
5 jobs/workflow
=
50 jobs/sec
```

During a 10x burst:

```text
100 pushes/sec
×
5
=
500 jobs/sec
```

### Runner requirement

If average job duration is D seconds:

```text
Concurrent jobs ≈ job arrival rate × average duration
```

For example:

```text
50 jobs/sec × 200 sec
≈ 10,000 concurrent jobs
```

The peak requirement is constrained by the stated maximum of ~100K concurrent jobs.

The exact numbers should be validated during the interview because job count and duration are important missing assumptions.

---

## Step 18: Reliability

Important failure scenarios:

| Failure | Handling |
|---|---|
| Kafka unavailable | Replication + producer retries |
| Orchestrator crashes | Stateless instances + durable DB/Kafka |
| Scheduler crashes | Multiple scheduler instances + persisted state |
| Runner crashes | Lease expiry + retry |
| DB failure | Replication/failover |
| Redis failure | Reconstruct ephemeral state from durable systems |
| Duplicate push | Idempotency key / commit SHA + event ID |
| Job timeout | Scheduler terminates runner |
| Client disconnects | Workflow continues; reconnect reads persisted state |
| Cancellation race | State machine + idempotent cancellation |

---

## Step 19: Idempotency

Distributed systems will produce duplicate events.

Example:

```text
Git Push
   |
   v
Kafka
   |
   +----> Event delivered
   |
   +----> Same event delivered again
```

Use an event ID:

```text
event_id
repo_id
commit_sha
workflow_id
```

Before creating a new workflow run:

```text
if event already processed:
    return existing run
```

This prevents duplicate workflow executions.

---

## Step 20: Workflow State Machine

A useful model:

```text
QUEUED
  |
  v
RUNNING
  |
  +----------+
  |          |
  v          v
SUCCESS    FAILED
  |
  v
COMPLETED
```

Cancellation:

```text
QUEUED/RUNNING
      |
      v
CANCEL_REQUESTED
      |
      v
CANCELLED
```

Retries should be represented by attempts rather than overwriting the history.

```text
Job
 |
 +-- Attempt 1 -> FAILED
 |
 +-- Attempt 2 -> SUCCESS
```

---

## Step 21: Security

Because arbitrary code is executed, security is critical.

### Isolation

- Container/VM sandbox
- CPU/memory limits
- Filesystem isolation
- Network restrictions
- Process isolation

### Authentication

- User authentication
- Repository authorization
- Runner authentication

### Secrets

- Least privilege
- Short-lived credentials
- Secret masking
- No accidental persistence

### Runner security

A runner should authenticate with the control plane and receive only jobs it is authorized to execute.

---

## Step 22: Interview Discussion Flow

For a 45–60 minute system design interview:

### 0–5 min: Requirements

Clarify:

- What triggers a workflow?
- How many jobs can a workflow contain?
- What does real-time mean?
- Hosted or self-hosted runners?
- Required isolation?
- Retry behavior?

### 5–10 min: Capacity Estimation

Start with:

```text
10 pushes/sec average
100 pushes/sec burst
100K concurrent jobs
```

Estimate:

- Jobs/sec
- Average job duration
- Runner count
- Kafka throughput
- Log volume
- DB writes
- Object-storage volume

### 10–20 min: Core Architecture

Explain:

```text
Push
 ↓
Kafka
 ↓
Orchestrator
 ↓
Scheduler
 ↓
Runner
```

### 20–30 min: Deep Dive

Choose one or two:

- Scheduler
- Runner isolation
- Kafka
- Workflow DAG
- Logs
- Secrets

Do not deep-dive every component.

### 30–40 min: Reliability

Discuss:

- Retries
- Duplicate events
- Runner crashes
- Scheduler crashes
- Kafka failure
- DB failure
- Job timeout
- Cancellation

### 40–50 min: Scale + Security

Discuss:

- 100K concurrent jobs
- Multi-tenancy
- Fair scheduling
- Quotas
- Sandboxing
- Secrets
- Regional deployment

---

## Step 23: Final Interview Summary

If asked to summarize the design:

> "I would separate the system into a control plane and an execution plane. Git pushes enter through the webhook/commit service and are buffered in Kafka so bursts don't overload execution. The workflow orchestrator parses the workflow DAG and creates jobs. A horizontally scalable scheduler matches jobs to available runners based on labels, capacity, quotas and priority. Each job executes in an isolated container or VM because workflow code is untrusted. Job state is stored durably in a database, while Redis handles ephemeral state such as leases and heartbeats. Logs have a real-time streaming path through a log service/WebSocket and a durable path to object storage. Secrets are provided through a dedicated secrets service with least-privilege access. Runner leases, retries, idempotency and state machines provide resilience against distributed failures. This architecture can scale independently across ingestion, orchestration, scheduling and execution to support bursts and roughly 100K concurrent jobs."

---

## Step 24: The Most Important Diagram to Remember

```text
             CONTROL PLANE

 Git Push
    |
    v
+-----------+
| API       |
| Gateway   |
+-----+-----+
      |
      v
+-----------+
| Commit /  |
| Webhook   |
+-----+-----+
      |
      v
+-----------+
| Kafka     |
+-----+-----+
      |
      v
+-----------+
| Workflow  |
| Orch.     |
+-----+-----+
      |
      v
+-----------+
| Job       |
| Scheduler |
+-----+-----+
      |
      v
+-----------+
| Runner    |
| Manager   |
+-----+-----+

          EXECUTION PLANE
                |
       +--------+--------+
       |        |        |
       v        v        v
    Runner   Runner   Runner
       |        |        |
       v        v        v
    Sandbox  Sandbox  Sandbox
       |
       +----------+-----------+
                  |
             +----+----+
             |         |
             v         v
            S3       Logs
                       |
                       v
                    Redis
                       |
                       v
                   WebSocket
                       |
                       v
                     Client


        +-------------------+
        | Secrets Service   |
        +---------+---------+
                  |
                  v
                Runner
```

**The three components to emphasize in the interview are:**

```text
Orchestrator → Scheduler → Runner
```

That is the core of the GitHub Actions system. 

