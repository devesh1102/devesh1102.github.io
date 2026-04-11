# Operating Systems - Interview Prep

## Core Concepts

### 1. **Process vs Thread**

**Process:**
* Independent program in execution
* Has its own memory space (heap, stack, code, data)
* Isolated from other processes
* Context switching is expensive (need to switch page tables, flush TLB)
* Inter-process communication requires special mechanisms (pipes, sockets, shared memory)

**Thread:**
* Lightweight unit of execution within a process
* Shares memory space with other threads in same process
* Has its own stack but shares heap, code, data segments
* Context switching is cheaper (only registers and stack pointer)
* Communication is easier (shared memory)
* Risk: One thread can corrupt another thread's data

```
PROCESS
┌─────────────────────────────────────────┐
│  Code Segment (Program Instructions)    │
├─────────────────────────────────────────┤
│  Data Segment (Global Variables)        │
├─────────────────────────────────────────┤
│  Heap (Dynamic Memory)                  │
│  ┌────────────────────┐                │
│  │  Shared by all     │                │
│  │  threads           │                │
│  └────────────────────┘                │
├─────────────────────────────────────────┤
│  Thread 1 Stack                         │
│  ┌────────────────────┐                │
│  │ Local variables    │                │
│  │ Function calls     │                │
│  └────────────────────┘                │
├─────────────────────────────────────────┤
│  Thread 2 Stack                         │
│  ┌────────────────────┐                │
│  │ Local variables    │                │
│  │ Function calls     │                │
│  └────────────────────┘                │
└─────────────────────────────────────────┘
```

### 2. **Process States**

```
          ┌─────────┐
          │   NEW   │  (Process created)
          └────┬────┘
               │
               ▼
          ┌─────────┐
     ┌───▶│  READY  │◀───┐  (Waiting for CPU)
     │    └────┬────┘    │
     │         │          │
     │         │ Scheduler│
     │         │ Dispatch │
     │         ▼          │
     │    ┌─────────┐    │
     │    │ RUNNING │────┘  (Executing on CPU)
     │    └────┬────┘
     │         │
     │         │ I/O Request
     │         │ or Wait
     │         ▼
     │    ┌─────────┐
     └────│ WAITING │  (Blocked on I/O or event)
          └────┬────┘
               │
               │ I/O Complete
               ▼
          ┌─────────┐
          │TERMINATED│  (Process finished)
          └─────────┘
```

### 3. **CPU Scheduling Algorithms**

#### FCFS (First Come First Serve)
* Non-preemptive
* Simple, easy to implement
* Poor average waiting time (convoy effect)
* No starvation

#### SJF (Shortest Job First)
* Can be preemptive (SRTF) or non-preemptive
* Optimal average waiting time
* Starvation possible for long processes
* Need to know burst time (hard to predict)

#### Round Robin
* Preemptive, time quantum based
* Fair to all processes
* Good response time
* Higher context switching overhead
* Performance depends on time quantum

#### Priority Scheduling
* Can be preemptive or non-preemptive
* Starvation possible (solution: aging)
* Can be combined with other algorithms

**Comparison Table:**
```
Algorithm     | Preemptive | Avg Wait | Starvation | Overhead
--------------|------------|----------|------------|----------
FCFS          | No         | High     | No         | Low
SJF           | Optional   | Optimal  | Yes        | Low
Round Robin   | Yes        | Medium   | No         | High
Priority      | Optional   | Medium   | Yes        | Medium
```

### 4. **Deadlock**

**Four Necessary Conditions (All must be true):**
1. **Mutual Exclusion**: Resource can be held by only one process
2. **Hold and Wait**: Process holds resource while waiting for another
3. **No Preemption**: Resource cannot be forcibly taken
4. **Circular Wait**: Circular chain of processes waiting for resources

```
Deadlock Example:

Process P1         Process P2
   │                  │
   │ Holds R1         │ Holds R2
   │                  │
   │ Requests R2      │ Requests R1
   │      ↓           │      ↓
   └──────┼───────────┴──────┤
          │                  │
          ▼                  ▼
        ┌────┐            ┌────┐
        │ R2 │            │ R1 │
        └────┘            └────┘
          ▲                  ▲
          └──────────────────┘
           Circular Wait!
```

**Deadlock Prevention:**
* Break one of the four conditions
  - No Mutual Exclusion: Make resources shareable (not always possible)
  - No Hold and Wait: Require all resources at once
  - Allow Preemption: Forcibly take resources
  - No Circular Wait: Order resources, request in order

**Deadlock Avoidance:**
* Banker's Algorithm: Check if resource allocation leaves system in safe state
* Need to know maximum resource requirements in advance

**Deadlock Detection & Recovery:**
* Periodically check for cycles in resource allocation graph
* Recovery: Kill processes or preempt resources

### 5. **Memory Management**

#### Virtual Memory
* Gives illusion of large contiguous memory
* Uses paging or segmentation
* Enables more processes than physical memory allows
* Memory protection between processes

#### Paging
```
Virtual Address = Page Number + Offset

Virtual Memory (32-bit address)
┌──────────┬──────────┐
│Page # (20)│Offset(12)│  = 4KB pages
└──────────┴──────────┘
      │
      │ Page Table Lookup
      ▼
┌─────────────────────┐
│   Page Table        │
│ ┌────┬─────────┐   │
│ │PN  │Frame #  │   │
│ ├────┼─────────┤   │
│ │ 0  │   5     │   │
│ │ 1  │   3     │   │
│ │ 2  │   7     │   │
│ └────┴─────────┘   │
└─────────────────────┘
      │
      ▼
Physical Memory
┌─────────────────┐
│  Frame 0        │
│  Frame 1        │
│  Frame 2        │
│  Frame 3 ◄──────┼── Page 1 maps here
│  Frame 4        │
│  Frame 5 ◄──────┼── Page 0 maps here
│  Frame 6        │
│  Frame 7 ◄──────┼── Page 2 maps here
└─────────────────┘
```

#### Page Replacement Algorithms

**FIFO (First In First Out):**
* Replace oldest page
* Can suffer from Belady's anomaly (more frames → more faults)
* Simple but not optimal

**LRU (Least Recently Used):**
* Replace page not used for longest time
* Good performance, approximates optimal
* Expensive to implement (need timestamps or stack)

**LFU (Least Frequently Used):**
* Replace page with lowest reference count
* Problem: Old pages never get replaced

**Optimal:**
* Replace page that won't be used for longest time in future
* Theoretical, requires future knowledge
* Used as benchmark

#### Thrashing
* System spends more time paging than executing
* Happens when too many processes, not enough memory
* Solution: Reduce degree of multiprogramming, increase memory, use working set model

### 6. **Synchronization Primitives**

#### Mutex (Mutual Exclusion)
```c
mutex_lock(&lock);
// Critical Section
// Only one thread can be here
mutex_unlock(&lock);
```
* Binary lock (0 or 1)
* Only lock holder can unlock
* Ownership concept

#### Semaphore
```c
// Binary Semaphore (mutex-like)
sem_wait(&sem);  // P() operation, decrement
// Critical Section
sem_post(&sem);  // V() operation, increment

// Counting Semaphore (resource pool)
semaphore pool(5);  // 5 resources available
```
* Counter-based (can be > 1)
* No ownership (any thread can signal)
* Can count resources

#### Condition Variable
```c
// Thread 1: Wait for condition
mutex_lock(&lock);
while (!condition)
    cond_wait(&cv, &lock);  // Releases lock, waits
// Condition met, lock reacquired
mutex_unlock(&lock);

// Thread 2: Signal condition
mutex_lock(&lock);
condition = true;
cond_signal(&cv);  // Wake up one waiter
mutex_unlock(&lock);
```
* Used with mutex for complex conditions
* Wait atomically releases lock
* Avoid spurious wakeups (always use while loop)

#### Monitor
* High-level synchronization construct
* Combines mutex + condition variables
* Only one thread active in monitor at a time
* Built into Java (synchronized keyword)

### 7. **Inter-Process Communication (IPC)**

```
┌─────────────────────────────────────────────────────┐
│                 IPC Mechanisms                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. Pipes                                           │
│     Process A ──────▶ │ Buffer │ ──────▶ Process B│
│     - Unidirectional (or bidirectional)             │
│     - Parent-child relationship usually             │
│                                                      │
│  2. Named Pipes (FIFO)                              │
│     - Exists as file in filesystem                  │
│     - Unrelated processes can communicate           │
│                                                      │
│  3. Message Queues                                  │
│     ┌──────────────────────┐                       │
│     │ Msg1│Msg2│Msg3│Msg4 │                       │
│     └──────────────────────┘                       │
│     - Messages have type/priority                   │
│     - Persistent across process lifecycle           │
│                                                      │
│  4. Shared Memory                                   │
│     Process A ◄──────▶ [ Shared Region ] ◄───▶ Process B│
│     - Fastest IPC method                            │
│     - Need synchronization (semaphores)             │
│                                                      │
│  5. Sockets                                         │
│     Process A ◄─────[ Network ]─────▶ Process B    │
│     - Works across network                          │
│     - TCP/UDP protocols                             │
│                                                      │
│  6. Signals                                         │
│     Process A ──────[ Signal ]──────▶ Process B    │
│     - Asynchronous notifications                    │
│     - Limited data (just signal number)             │
└─────────────────────────────────────────────────────┘
```

### 8. **File Systems**

#### inode (Index Node)
* Data structure storing file metadata
* Contains: permissions, owner, size, timestamps, pointers to data blocks
* Does NOT contain: filename (stored in directory)

```
inode Structure:
┌─────────────────────────────┐
│ Permissions: rwxr-xr--       │
│ Owner: user_id, group_id     │
│ Size: 10240 bytes            │
│ Timestamps: created, modified│
├─────────────────────────────┤
│ Direct Pointers (12)         │
│  [0] ──▶ Data Block 100      │
│  [1] ──▶ Data Block 101      │
│  ...                          │
│  [11] ─▶ Data Block 111      │
├─────────────────────────────┤
│ Indirect Pointer             │
│  [12] ─▶ Block of Pointers   │
├─────────────────────────────┤
│ Double Indirect Pointer      │
│  [13] ─▶ Block ──▶ Blocks    │
├─────────────────────────────┤
│ Triple Indirect Pointer      │
│  [14] ─▶ Block ──▶ Blocks ──▶│
└─────────────────────────────┘
```

#### Hard Link vs Soft Link (Symlink)

**Hard Link:**
* Multiple directory entries pointing to same inode
* Cannot cross filesystem boundaries
* Cannot link directories (prevents cycles)
* File deleted only when all hard links removed (reference counting)

**Soft Link (Symbolic Link):**
* Special file containing path to target file
* Can cross filesystem boundaries
* Can link directories
* If target deleted, symlink becomes "dangling"

```
Hard Link:
/home/file1  ──┐
               ├──▶ inode 1234 ──▶ Data Blocks
/home/file2  ──┘

Soft Link:
/home/link ──▶ inode 5678 ──▶ "/home/target"
                                     │
                                     ▼
                              /home/target ──▶ inode 9999 ──▶ Data
```

### 9. **Disk Scheduling Algorithms**

**FCFS:** Serve requests in order received
**SSTF (Shortest Seek Time First):** Serve nearest request (can cause starvation)
**SCAN (Elevator):** Move in one direction, serve all requests, then reverse
**C-SCAN (Circular SCAN):** Move in one direction, jump back to start
**LOOK:** Like SCAN but reverse when no more requests (don't go to end)

```
SCAN Disk Scheduling (Head starts at 50, moving left):

Requests: 98, 183, 37, 122, 14, 124, 65, 67

Track 0 ─────────────────────────────────── Track 199
         ↑        ↑  ↑  ↑     ↑   ↑    ↑     ↑
         14      37 50 65    98  122  124   183
                     ▲
                Start here (moving left)

Order: 50 → 37 → 14 → 0 → 65 → 67 → 98 → 122 → 124 → 183
Total head movement: 50+37+14+0+65+2+31+24+2+59 = 284 tracks
```

### 10. **Memory Allocation Strategies**

**First Fit:** Allocate first hole large enough
* Fast
* May leave small unusable holes at beginning

**Best Fit:** Allocate smallest hole that fits
* Slower (must search all)
* Leaves smallest leftover holes (can be too small to use)

**Worst Fit:** Allocate largest hole
* Slower (must search all)
* Leaves largest leftover holes (more usable)

**Buddy System:**
* Split memory into power-of-2 sized blocks
* Easy to coalesce (merge) on deallocation
* Internal fragmentation (waste within block)

## Critical Interview Questions

### 1. Producer-Consumer Problem
```
Shared buffer of size N

Semaphore empty = N;    // Empty slots
Semaphore full = 0;     // Filled slots
Mutex mutex = 1;        // Mutual exclusion

Producer:
    while(true) {
        item = produce();
        wait(empty);        // Wait for empty slot
        wait(mutex);        // Enter critical section
        buffer.add(item);
        signal(mutex);      // Exit critical section
        signal(full);       // Signal item available
    }

Consumer:
    while(true) {
        wait(full);         // Wait for item
        wait(mutex);        // Enter critical section
        item = buffer.remove();
        signal(mutex);      // Exit critical section
        signal(empty);      // Signal slot available
        consume(item);
    }
```

### 2. Reader-Writer Problem
```
Multiple readers can read simultaneously
Only one writer can write (exclusive access)

Semaphore mutex = 1;       // Protect read_count
Semaphore write_lock = 1;  // Exclusive write access
int read_count = 0;

Reader:
    wait(mutex);
    read_count++;
    if (read_count == 1)   // First reader locks writer
        wait(write_lock);
    signal(mutex);

    // Reading...

    wait(mutex);
    read_count--;
    if (read_count == 0)   // Last reader unlocks writer
        signal(write_lock);
    signal(mutex);

Writer:
    wait(write_lock);
    // Writing...
    signal(write_lock);
```

### 3. Dining Philosophers Problem
```
5 philosophers, 5 chopsticks
Each needs 2 chopsticks to eat
Risk of deadlock if all pick up left chopstick simultaneously

Solution 1: Asymmetric (odd/even pickup order)
Solution 2: Allow max 4 philosophers at table
Solution 3: Pick both chopsticks atomically
Solution 4: Priority/ordering on chopsticks
```

## System Calls

**Process Control:**
* `fork()` - Create new process (child)
* `exec()` - Replace process image
* `wait()` - Wait for child termination
* `exit()` - Terminate process

**File Operations:**
* `open()` - Open file, get file descriptor
* `read()` - Read from file descriptor
* `write()` - Write to file descriptor
* `close()` - Close file descriptor
* `lseek()` - Reposition file offset

**Memory Management:**
* `brk()`, `sbrk()` - Change data segment size
* `mmap()` - Map files/devices into memory
* `munmap()` - Unmap memory

## Context Switching

**What happens during context switch:**
1. Save current process state (registers, PC, stack pointer)
2. Update process state to READY or WAITING
3. Move process to appropriate queue
4. Select new process to run (scheduling)
5. Update new process state to RUNNING
6. Restore new process state (registers, PC, stack pointer)
7. Switch address space (flush TLB, load page table)

**Cost:**
* Direct: Saving/restoring registers (~microseconds)
* Indirect: Cache misses, TLB flush (can be milliseconds)
* More expensive than thread switch (no address space change)

## Memory Hierarchy

```
Faster, Smaller, More Expensive
         ↑
    ┌─────────┐
    │Registers│ ~1 cycle, bytes-KB
    ├─────────┤
    │L1 Cache │ ~4 cycles, 32-64 KB
    ├─────────┤
    │L2 Cache │ ~10 cycles, 256 KB - 1 MB
    ├─────────┤
    │L3 Cache │ ~40 cycles, 4-32 MB
    ├─────────┤
    │   RAM   │ ~100 cycles, GBs
    ├─────────┤
    │   SSD   │ ~10,000 cycles, 100s GB - TBs
    ├─────────┤
    │   HDD   │ ~1,000,000 cycles, TBs
    └─────────┘
         ↓
Slower, Larger, Cheaper
```

## Cache Coherence (Multi-core)

**Problem:** Multiple CPU cores, each with private cache, can have inconsistent views of memory

**MESI Protocol (Cache Coherence):**
* **M**odified: Cache line dirty, only copy
* **E**xclusive: Cache line clean, only copy
* **S**hared: Cache line clean, may have copies in other caches
* **I**nvalid: Cache line invalid

```
Core 1 writes to address X:
  Core 1 Cache: X = Modified
  Core 2 Cache: X = Invalid (invalidated)

Core 2 reads X:
  Core 1 Cache: X = Shared (must write back)
  Core 2 Cache: X = Shared (now has copy)
```

## Design Questions Involving OS Concepts

### 1. Design a Thread Pool
* **OS Concepts**: Threads, synchronization, scheduling
* **Key Points**: Work queue, worker threads, mutex/condition variables for queue

### 2. Design a Database (Storage Engine)
* **OS Concepts**: File systems, disk scheduling, caching, memory management
* **Key Points**: Buffer pool management, page replacement, write-ahead log

### 3. Design a Web Server
* **OS Concepts**: Processes, threads, I/O multiplexing, sockets
* **Key Points**: Multi-threading vs event-driven (epoll/kqueue), keep-alive connections

### 4. Design a Garbage Collector
* **OS Concepts**: Memory management, virtual memory
* **Key Points**: Mark-and-sweep, reference counting, generational collection

### 5. Design Process Scheduler
* **OS Concepts**: CPU scheduling, priorities, preemption
* **Key Points**: Multi-level feedback queue, priority inversion, real-time scheduling

### 6. Design Virtual Memory System
* **OS Concepts**: Paging, page replacement, TLB
* **Key Points**: Working set, demand paging, copy-on-write

### 7. Design Distributed Lock Manager
* **OS Concepts**: Deadlock detection, distributed synchronization
* **Key Points**: Two-phase locking, timeout-based detection, lease mechanism

### 8. Design Docker/Container Runtime
* **OS Concepts**: Namespaces, cgroups, chroot, copy-on-write filesystems
* **Key Points**: Process isolation, resource limits, layered file system

### 9. Design a Load Balancer
* **OS Concepts**: Sockets, epoll, multi-threading
* **Key Points**: Connection pooling, health checks, scheduling algorithms

### 10. Design Redis (In-Memory Store)
* **OS Concepts**: Memory management, persistence, I/O multiplexing
* **Key Points**: Single-threaded event loop (epoll), AOF/RDB persistence, fork for snapshots

## Best Practices & Tips

**For Interviews:**
1. Understand trade-offs (time vs space, simplicity vs performance)
2. Draw diagrams for complex concepts
3. Know real-world examples (Linux, Windows differences)
4. Practice coding synchronization problems
5. Understand when to use each IPC mechanism
6. Know performance characteristics (Big-O when applicable)

**Common Pitfalls:**
* Confusing process vs thread
* Forgetting to handle deadlock conditions
* Not considering race conditions in synchronization
* Mixing up hard link vs soft link
* Confusing virtual vs physical memory

## Performance Metrics

**Throughput:** Number of processes completed per unit time
**Turnaround Time:** Total time from submission to completion
**Waiting Time:** Time spent in ready queue
**Response Time:** Time from submission to first response
**CPU Utilization:** Percentage of time CPU is busy

## Key Formulas

**Page Number:** `page_num = virtual_address / page_size`
**Offset:** `offset = virtual_address % page_size`
**Number of Pages:** `num_pages = virtual_address_space / page_size`
**Page Table Size:** `num_pages * page_table_entry_size`
**Effective Access Time:** `(1 - page_fault_rate) * memory_access_time + page_fault_rate * page_fault_service_time`
