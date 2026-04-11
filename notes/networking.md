# Networking - Interview Prep

## OSI Model vs TCP/IP Model

```
OSI Model (7 Layers)          TCP/IP Model (4 Layers)
┌──────────────────┐
│  7. Application  │          ┌──────────────────┐
├──────────────────┤          │   Application    │
│  6. Presentation │          │   (HTTP, FTP,    │
├──────────────────┤          │    DNS, SMTP)    │
│  5. Session      │          └──────────────────┘
└──────────────────┘
┌──────────────────┐          ┌──────────────────┐
│  4. Transport    │          │   Transport      │
│  (TCP/UDP)       │          │   (TCP/UDP)      │
└──────────────────┘          └──────────────────┘
┌──────────────────┐          ┌──────────────────┐
│  3. Network      │          │   Internet       │
│  (IP)            │          │   (IP, ICMP)     │
└──────────────────┘          └──────────────────┘
┌──────────────────┐          ┌──────────────────┐
│  2. Data Link    │          │   Link/Network   │
├──────────────────┤          │   Access         │
│  1. Physical     │          │   (Ethernet)     │
└──────────────────┘          └──────────────────┘
```

**Layer Functions:**

**Application (L7):** User-facing protocols (HTTP, DNS, SMTP)
**Presentation (L6):** Data formatting, encryption (SSL/TLS)
**Session (L5):** Session management, connections
**Transport (L4):** End-to-end delivery (TCP/UDP)
**Network (L3):** Routing, IP addressing
**Data Link (L2):** Frame delivery on local network (MAC addresses)
**Physical (L1):** Bits on wire (electrical signals)

## TCP vs UDP

```
┌─────────────────────────────────────────────────────────────┐
│                    TCP vs UDP                                │
├──────────────────┬──────────────────────────────────────────┤
│   TCP            │   UDP                                     │
│   (Transmission  │   (User Datagram Protocol)               │
│    Control       │                                           │
│    Protocol)     │                                           │
├──────────────────┼──────────────────────────────────────────┤
│ Connection-      │ Connectionless                            │
│ oriented         │                                           │
├──────────────────┼──────────────────────────────────────────┤
│ Reliable         │ Unreliable (best effort)                 │
│ (guaranteed      │                                           │
│  delivery)       │                                           │
├──────────────────┼──────────────────────────────────────────┤
│ Ordered          │ No ordering guarantee                    │
├──────────────────┼──────────────────────────────────────────┤
│ Flow Control     │ No flow control                          │
│ (prevents        │                                           │
│  overflow)       │                                           │
├──────────────────┼──────────────────────────────────────────┤
│ Congestion       │ No congestion control                    │
│ Control          │                                           │
├──────────────────┼──────────────────────────────────────────┤
│ Header: 20-60    │ Header: 8 bytes (lightweight)            │
│ bytes            │                                           │
├──────────────────┼──────────────────────────────────────────┤
│ Slower           │ Faster (less overhead)                   │
├──────────────────┼──────────────────────────────────────────┤
│ Use Cases:       │ Use Cases:                               │
│ - HTTP/HTTPS     │ - DNS queries                            │
│ - Email (SMTP)   │ - Video streaming                        │
│ - File Transfer  │ - Online gaming                          │
│ - SSH            │ - VoIP                                   │
│                  │ - IoT sensors                            │
└──────────────────┴──────────────────────────────────────────┘
```

## TCP Three-Way Handshake

```
Client                                  Server
  │                                        │
  │         SYN (seq=100)                 │
  │──────────────────────────────────────▶│
  │                                        │
  │    SYN-ACK (seq=300, ack=101)        │
  │◀──────────────────────────────────────│
  │                                        │
  │         ACK (ack=301)                 │
  │──────────────────────────────────────▶│
  │                                        │
  │     Connection Established            │
  │◀─────────────────────────────────────▶│

Step 1: Client sends SYN with initial sequence number
Step 2: Server responds with SYN-ACK (its seq + ack of client's seq+1)
Step 3: Client sends ACK (acknowledges server's seq+1)
```

## TCP Four-Way Termination

```
Client                                  Server
  │                                        │
  │         FIN (seq=100)                 │
  │──────────────────────────────────────▶│
  │                                        │
  │         ACK (ack=101)                 │
  │◀──────────────────────────────────────│
  │                                        │
  │         FIN (seq=300)                 │
  │◀──────────────────────────────────────│
  │                                        │
  │         ACK (ack=301)                 │
  │──────────────────────────────────────▶│
  │                                        │
  │     Connection Closed                 │

Step 1: Client sends FIN (wants to close)
Step 2: Server ACKs FIN (acknowledges)
Step 3: Server sends FIN (ready to close)
Step 4: Client ACKs FIN (connection closed)

TIME_WAIT state: Client waits 2*MSL before fully closing
```

## HTTP Methods

```
┌────────┬──────────┬─────────────┬─────────────────────────┐
│Method  │Safe?     │Idempotent?  │Use Case                 │
├────────┼──────────┼─────────────┼─────────────────────────┤
│GET     │Yes       │Yes          │Retrieve resource        │
│POST    │No        │No           │Create resource          │
│PUT     │No        │Yes          │Update/Replace resource  │
│PATCH   │No        │No           │Partial update           │
│DELETE  │No        │Yes          │Delete resource          │
│HEAD    │Yes       │Yes          │GET without body         │
│OPTIONS │Yes       │Yes          │Get allowed methods      │
└────────┴──────────┴─────────────┴─────────────────────────┘

Safe: Does not modify server state
Idempotent: Multiple identical requests have same effect as one
```

## HTTP Status Codes

```
1xx: Informational
  100 Continue
  101 Switching Protocols

2xx: Success
  200 OK
  201 Created
  204 No Content

3xx: Redirection
  301 Moved Permanently
  302 Found (Temporary Redirect)
  304 Not Modified (Cache valid)
  307 Temporary Redirect
  308 Permanent Redirect

4xx: Client Error
  400 Bad Request
  401 Unauthorized (not authenticated)
  403 Forbidden (authenticated but no permission)
  404 Not Found
  405 Method Not Allowed
  408 Request Timeout
  409 Conflict
  429 Too Many Requests

5xx: Server Error
  500 Internal Server Error
  502 Bad Gateway
  503 Service Unavailable
  504 Gateway Timeout
```

## DNS (Domain Name System)

```
DNS Resolution Process:

User types "www.example.com"
    │
    ▼
┌─────────────┐
│Local Cache  │ Check browser/OS cache
└──────┬──────┘
       │ Miss
       ▼
┌─────────────┐
│Recursive    │ ISP's DNS server
│Resolver     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Root Server  │ "Ask .com server"
│     (.)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│TLD Server   │ "Ask example.com's nameserver"
│    (.com)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Authoritative│ "www.example.com = 93.184.216.34"
│Name Server  │
└──────┬──────┘
       │
       ▼
    IP Address

DNS Record Types:
- A: IPv4 address
- AAAA: IPv6 address
- CNAME: Canonical name (alias)
- MX: Mail exchange
- NS: Name server
- TXT: Text records (SPF, DKIM)
- SOA: Start of authority
```

## Load Balancing Algorithms

```
1. Round Robin
   Request 1 → Server A
   Request 2 → Server B
   Request 3 → Server C
   Request 4 → Server A (cycle)
   Simple, equal distribution

2. Least Connections
   Route to server with fewest active connections
   Good for long-lived connections

3. Least Response Time
   Route to server with lowest latency + fewest connections
   Performance-aware

4. IP Hash
   Hash(Client IP) % num_servers
   Same client always goes to same server
   Good for session persistence

5. Weighted Round Robin
   Server A (weight=3): Gets 3/6 requests
   Server B (weight=2): Gets 2/6 requests
   Server C (weight=1): Gets 1/6 requests
   Accounts for different server capacities

6. Random
   Randomly select server
   Simple, works well at scale
```

## CDN (Content Delivery Network)

```
How CDN Works:

User in Tokyo requests www.example.com/image.jpg
    │
    ▼
┌─────────────────┐
│  DNS Resolution │
│  Returns IP of  │
│  nearest CDN    │
│  edge server    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CDN Edge Server │ (Tokyo)
│  in Tokyo       │
└────────┬────────┘
         │
         ├─ HIT: Serve from cache ──────────┐
         │                                   ▼
         └─ MISS: ────────────────┐     User receives
                                  │     content
                                  ▼
                          ┌──────────────┐
                          │ Origin Server│
                          │  (US)        │
                          └──────┬───────┘
                                 │
                          Cache on edge ──┐
                          and serve       │
                                         ▼
                                     User receives
                                     content

Benefits:
- Lower latency (geographically closer)
- Reduced origin load
- DDoS protection
- Better availability
```

## HTTP/1.1 vs HTTP/2 vs HTTP/3

```
┌──────────────┬─────────────┬─────────────┬─────────────┐
│Feature       │HTTP/1.1     │HTTP/2       │HTTP/3       │
├──────────────┼─────────────┼─────────────┼─────────────┤
│Transport     │TCP          │TCP          │QUIC (UDP)   │
├──────────────┼─────────────┼─────────────┼─────────────┤
│Multiplexing  │No (6 conns  │Yes          │Yes          │
│              │per domain)  │             │             │
├──────────────┼─────────────┼─────────────┼─────────────┤
│Head-of-line  │Yes          │Partial      │No           │
│blocking      │             │(TCP level)  │             │
├──────────────┼─────────────┼─────────────┼─────────────┤
│Header        │Plain text   │Binary,      │Binary,      │
│compression   │             │HPACK        │QPACK        │
├──────────────┼─────────────┼─────────────┼─────────────┤
│Server Push   │No           │Yes          │Yes          │
├──────────────┼─────────────┼─────────────┼─────────────┤
│Priority      │No           │Yes          │Yes          │
├──────────────┼─────────────┼─────────────┼─────────────┤
│Encryption    │Optional     │De facto     │Mandatory    │
│              │(HTTPS)      │required     │             │
└──────────────┴─────────────┴─────────────┴─────────────┘

HTTP/1.1: 1 request per connection (or sequential)
HTTP/2: Multiple requests on single connection (multiplexing)
HTTP/3: Built on QUIC, faster connection setup, better mobile
```

## WebSocket vs HTTP

```
HTTP (Request-Response):
Client                Server
  │────Request───────▶│
  │◀───Response───────│
  Connection closed

WebSocket (Full-Duplex):
Client                Server
  │──Upgrade Request─▶│ (HTTP upgrade)
  │◀──101 Switching──│
  │                   │
  │◀─────Data────────▶│ (bidirectional)
  │◀─────Data────────▶│
  │◀─────Data────────▶│
  │                   │
  Connection stays open

WebSocket Benefits:
- Real-time bidirectional communication
- Lower latency (no HTTP overhead per message)
- Server can push data without client request
- Use cases: Chat, live feeds, gaming, collaborative editing
```

## HTTPS/TLS Handshake

```
Client                                          Server
  │                                                │
  │          ClientHello                          │
  │  (supported ciphers, TLS version)            │
  │──────────────────────────────────────────────▶│
  │                                                │
  │          ServerHello                          │
  │  (chosen cipher, certificate)                 │
  │◀──────────────────────────────────────────────│
  │                                                │
  │  Client verifies certificate                  │
  │  (check CA signature, validity)               │
  │                                                │
  │  Client generates pre-master secret           │
  │  Encrypts with server's public key            │
  │──────────────────────────────────────────────▶│
  │                                                │
  Both derive session keys from pre-master secret
  │                                                │
  │          Finished (encrypted)                 │
  │◀────────────────────────────────────────────▶│
  │                                                │
  │     Encrypted application data                │
  │◀────────────────────────────────────────────▶│

Symmetric encryption (AES) used for data after handshake
Asymmetric encryption (RSA/ECDHE) used for key exchange
```

## IP Addressing

### IPv4

```
32-bit address: 192.168.1.1

Binary: 11000000.10101000.00000001.00000001

Classes (Historical):
Class A: 0.0.0.0    - 127.255.255.255  (8-bit network)
Class B: 128.0.0.0  - 191.255.255.255  (16-bit network)
Class C: 192.0.0.0  - 223.255.255.255  (24-bit network)

Private Ranges (RFC 1918):
10.0.0.0/8        (10.0.0.0 - 10.255.255.255)
172.16.0.0/12     (172.16.0.0 - 172.31.255.255)
192.168.0.0/16    (192.168.0.0 - 192.168.255.255)

Special Addresses:
127.0.0.1         Loopback
0.0.0.0           Default route
255.255.255.255   Broadcast
```

### CIDR (Classless Inter-Domain Routing)

```
192.168.1.0/24

/24 = subnet mask = 255.255.255.0
= 24 bits for network, 8 bits for hosts
= 2^8 = 256 addresses (254 usable)

Example:
192.168.1.0/24
Network:   192.168.1.0
Usable:    192.168.1.1 - 192.168.1.254
Broadcast: 192.168.1.255

Subnet Mask Shorthand:
/8  = 255.0.0.0       (16,777,216 hosts)
/16 = 255.255.0.0     (65,536 hosts)
/24 = 255.255.255.0   (256 hosts)
/32 = 255.255.255.255 (1 host - single IP)
```

### NAT (Network Address Translation)

```
Private Network (192.168.1.0/24)
┌──────────────────────────────────┐
│  Host A: 192.168.1.10            │
│  Host B: 192.168.1.11            │
│  Host C: 192.168.1.12            │
└───────────┬──────────────────────┘
            │
            ▼
      ┌──────────┐
      │   NAT    │
      │ Router   │
      └────┬─────┘
           │ Public IP: 203.0.113.5
           │
           ▼
      Internet

NAT Translation Table:
Private IP:Port     →  Public IP:Port     →  Destination
192.168.1.10:5000  →  203.0.113.5:6000  →  1.2.3.4:80
192.168.1.11:5001  →  203.0.113.5:6001  →  5.6.7.8:443

Multiple private IPs share one public IP
Port translation distinguishes connections
```

## Subnetting Example

```
Given: 192.168.1.0/24, split into 4 subnets

Need 2 more bits for 4 subnets (2^2 = 4)
New mask: /26 (24 + 2)

Subnet 1: 192.168.1.0/26
  Range: 192.168.1.0 - 192.168.1.63
  Usable: 192.168.1.1 - 192.168.1.62 (62 hosts)

Subnet 2: 192.168.1.64/26
  Range: 192.168.1.64 - 192.168.1.127
  Usable: 192.168.1.65 - 192.168.1.126

Subnet 3: 192.168.1.128/26
  Range: 192.168.1.128 - 192.168.1.191
  Usable: 192.168.1.129 - 192.168.1.190

Subnet 4: 192.168.1.192/26
  Range: 192.168.1.192 - 192.168.1.255
  Usable: 192.168.1.193 - 192.168.1.254
```

## Routing

### Static vs Dynamic Routing

**Static Routing:**
* Manually configured routes
* Simple, predictable
* Doesn't adapt to network changes
* Good for small networks

**Dynamic Routing:**
* Routers share routing information
* Automatically adapt to topology changes
* Protocols: RIP, OSPF, BGP
* Good for large, complex networks

### Routing Table

```
Destination     Gateway         Mask            Interface
0.0.0.0         192.168.1.1     0.0.0.0         eth0  (Default route)
192.168.1.0     0.0.0.0         255.255.255.0   eth0  (Local network)
10.0.0.0        192.168.1.254   255.0.0.0       eth0  (Via gateway)

Most specific match wins (longest prefix match)
```

## ARP (Address Resolution Protocol)

```
Maps IP address to MAC address

Host A wants to send to 192.168.1.10 (Host B)
But only knows MAC addresses work on local network

┌─────────────────────────────────────────┐
│  1. ARP Request (Broadcast)              │
│     "Who has 192.168.1.10?"             │
│     Src MAC: AA:AA:AA:AA:AA:AA          │
│     Dst MAC: FF:FF:FF:FF:FF:FF (all)    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  All hosts receive │
         └────────┬───────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  2. ARP Reply (Unicast)                  │
│     "192.168.1.10 is at BB:BB:BB:BB:BB:BB"│
│     From Host B to Host A               │
└─────────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  ARP Cache     │
         │  192.168.1.10  │
         │  = BB:BB:BB... │
         └────────────────┘

ARP cache expires after timeout (typically minutes)
```

## ICMP (Internet Control Message Protocol)

```
Used for network diagnostics and errors

Common ICMP Messages:
- Echo Request/Reply (ping)
- Destination Unreachable
- Time Exceeded (TTL expired - traceroute)
- Redirect

Ping Example:
Host A ──Echo Request───▶ Host B
Host A ◀─Echo Reply──────  Host B

Traceroute Example:
Send packets with increasing TTL:
TTL=1 → First router responds "Time Exceeded"
TTL=2 → Second router responds "Time Exceeded"
TTL=3 → Third router responds "Time Exceeded"
...
TTL=n → Destination responds "Echo Reply"

Shows path packets take through network
```

## Firewall Types

```
1. Packet Filter (Layer 3/4)
   ├─ Checks: IP, port, protocol
   ├─ Fast, simple
   └─ No application awareness

2. Stateful Inspection
   ├─ Tracks connection state
   ├─ Remembers outbound requests
   └─ Allows return traffic automatically

3. Application Layer (Layer 7)
   ├─ Inspects application data
   ├─ Can block specific URLs, patterns
   └─ Slower but more secure

4. Next-Gen Firewall (NGFW)
   ├─ Deep packet inspection
   ├─ Intrusion prevention
   ├─ Application awareness
   └─ Malware detection
```

## Common Ports

```
┌──────┬─────────────────────────────────┐
│Port  │Service                          │
├──────┼─────────────────────────────────┤
│  20  │FTP (data)                       │
│  21  │FTP (control)                    │
│  22  │SSH                              │
│  23  │Telnet                           │
│  25  │SMTP (email sending)             │
│  53  │DNS                              │
│  80  │HTTP                             │
│  110 │POP3 (email retrieval)           │
│  143 │IMAP (email)                     │
│  443 │HTTPS                            │
│  3306│MySQL                            │
│  3389│RDP (Remote Desktop)             │
│  5432│PostgreSQL                       │
│  6379│Redis                            │
│  8080│HTTP Alternate                   │
│  9200│Elasticsearch                    │
│ 27017│MongoDB                          │
└──────┴─────────────────────────────────┘

Ports 0-1023: Well-known (system) ports
Ports 1024-49151: Registered ports
Ports 49152-65535: Dynamic/private ports
```

## Socket Programming Basics

```
TCP Server:
  socket()      → Create socket
  bind()        → Bind to address/port
  listen()      → Mark as passive socket
  accept()      → Block until client connects
  recv()/send() → Exchange data
  close()       → Close connection

TCP Client:
  socket()      → Create socket
  connect()     → Connect to server
  send()/recv() → Exchange data
  close()       → Close connection

UDP (no connection):
  socket()        → Create socket
  bind()          → Bind to address/port (server)
  recvfrom()      → Receive with sender info
  sendto()        → Send to specific address
  close()         → Close socket
```

## Network Latency Components

```
Total Latency = Propagation + Transmission + Queuing + Processing

1. Propagation Delay
   Time for signal to travel through medium
   = Distance / Speed of light in medium
   Example: 1000 km fiber = ~5ms

2. Transmission Delay
   Time to push all bits onto link
   = Packet size / Bandwidth
   Example: 1500 bytes on 100 Mbps = 0.12ms

3. Queuing Delay
   Time waiting in router queues
   Variable, depends on congestion

4. Processing Delay
   Time for router to process packet header
   Usually negligible (~microseconds)

Bandwidth vs Latency:
- Bandwidth: How much data per second (throughput)
- Latency: How long for first bit to arrive (delay)
- High bandwidth doesn't mean low latency!
```

## TCP Congestion Control

```
Slow Start → Congestion Avoidance → Fast Retransmit → Fast Recovery

Congestion Window (cwnd) Growth:
┌────────────────────────────────────────────┐
│ Slow Start: Exponential growth             │
│ cwnd = 1                                   │
│ After 1 RTT: cwnd = 2                      │
│ After 2 RTT: cwnd = 4                      │
│ After 3 RTT: cwnd = 8                      │
├────────────────────────────────────────────┤
│ Congestion Avoidance: Linear growth        │
│ (after reaching ssthresh)                  │
│ cwnd += 1 per RTT                          │
├────────────────────────────────────────────┤
│ Packet Loss Detected:                      │
│ - 3 duplicate ACKs: Fast Retransmit        │
│   ssthresh = cwnd/2                        │
│   cwnd = ssthresh + 3                      │
│ - Timeout: More severe                     │
│   ssthresh = cwnd/2                        │
│   cwnd = 1 (restart slow start)            │
└────────────────────────────────────────────┘

TCP Variants:
- TCP Reno: Classic implementation
- TCP Cubic: Default in Linux (aggressive)
- TCP BBR: Bottleneck bandwidth-based (Google)
```

## REST API Best Practices

```
1. Use HTTP Methods Correctly
   GET    /users        → List users
   GET    /users/123    → Get user 123
   POST   /users        → Create user
   PUT    /users/123    → Update user 123 (full)
   PATCH  /users/123    → Update user 123 (partial)
   DELETE /users/123    → Delete user 123

2. Use Plural Nouns for Resources
   ✓ /users, /orders, /products
   ✗ /user, /getUsers, /createOrder

3. Use Status Codes Correctly
   200 OK               → Success
   201 Created          → Resource created
   204 No Content       → Success, no body
   400 Bad Request      → Client error
   401 Unauthorized     → Authentication required
   403 Forbidden        → No permission
   404 Not Found        → Resource doesn't exist
   500 Internal Error   → Server error

4. Versioning
   /api/v1/users
   /api/v2/users

5. Filtering, Sorting, Pagination
   GET /users?status=active&sort=created_at&page=2&limit=20

6. Use HATEOAS (Hypermedia)
   Include links to related resources in response

7. Security
   - Use HTTPS
   - Authentication (JWT, OAuth)
   - Rate limiting
   - Input validation
```

## Design Questions Involving Networking

### 1. Design a URL Shortener
* **Concepts**: HTTP redirects (301/302), DNS, load balancing
* **Key Points**: Hash collision handling, redirect types, caching

### 2. Design Netflix/Video Streaming
* **Concepts**: CDN, adaptive bitrate, TCP vs UDP
* **Key Points**: HLS/DASH protocols, buffering, P2P for live

### 3. Design WhatsApp/Chat Application
* **Concepts**: WebSocket, long polling, message queues
* **Key Points**: Bidirectional communication, offline messages, push notifications

### 4. Design API Gateway
* **Concepts**: Reverse proxy, load balancing, rate limiting
* **Key Points**: Request routing, authentication, circuit breaker

### 5. Design CDN
* **Concepts**: DNS, caching, anycast
* **Key Points**: Cache invalidation, geo-routing, origin shield

### 6. Design Web Crawler
* **Concepts**: HTTP, robots.txt, DNS, politeness
* **Key Points**: Distributed crawling, URL frontier, duplicate detection

### 7. Design Load Balancer
* **Concepts**: Layer 4 vs Layer 7, health checks, algorithms
* **Key Points**: Session persistence, SSL termination, failover

### 8. Design Real-time Gaming Backend
* **Concepts**: UDP for game state, TCP for chat, latency optimization
* **Key Points**: Client-side prediction, lag compensation, dedicated servers vs P2P

### 9. Design VPN Service
* **Concepts**: Tunneling, encryption (IPSec, WireGuard), NAT
* **Key Points**: Split tunneling, kill switch, server selection

### 10. Design Email Service
* **Concepts**: SMTP, IMAP, POP3, SPF/DKIM/DMARC
* **Key Points**: Spam filtering, attachment handling, encryption

## Network Troubleshooting Commands

```
ping         → Test reachability, measure RTT
traceroute   → Show path packets take
nslookup/dig → DNS queries
netstat      → Network connections, routing table
ifconfig/ip  → Network interface configuration
tcpdump      → Packet capture and analysis
wireshark    → GUI packet analyzer
curl         → HTTP client for testing APIs
telnet       → Test port connectivity
ss           → Socket statistics (modern netstat)
mtr          → Continuous ping + traceroute
iperf        → Network bandwidth testing
```

## Common Network Issues

**High Latency:**
* Cause: Geographic distance, routing, congestion
* Debug: ping, traceroute, mtr
* Solution: CDN, better routing, caching

**Packet Loss:**
* Cause: Congestion, faulty hardware, wireless interference
* Debug: ping with packet loss %, mtr
* Solution: QoS, better hardware, wired connection

**DNS Issues:**
* Cause: DNS server down, misconfiguration, cache poisoning
* Debug: nslookup, dig, check /etc/resolv.conf
* Solution: Alternate DNS (8.8.8.8), flush cache

**Connection Timeout:**
* Cause: Firewall, server down, wrong port
* Debug: telnet, nc (netcat), check firewall rules
* Solution: Open ports, check server status

**SSL/TLS Errors:**
* Cause: Certificate expired, wrong hostname, untrusted CA
* Debug: openssl s_client, check certificate chain
* Solution: Renew cert, fix hostname, add CA to trust store

## Performance Optimization

**Reduce Latency:**
* Use CDN (geographically closer)
* Connection pooling (reuse TCP connections)
* HTTP/2 or HTTP/3 (multiplexing)
* Reduce DNS lookups (DNS prefetch)
* Use TCP Fast Open

**Increase Throughput:**
* Compression (gzip, brotli)
* Minification (JS, CSS)
* Image optimization
* Caching (browser, CDN, server)
* Parallel connections (domain sharding for HTTP/1.1)

**Optimize API Calls:**
* Batching requests
* GraphQL (fetch only needed fields)
* Pagination (don't fetch all data)
* Caching (Redis, CDN)
* Rate limiting (prevent abuse)

## Security Concepts

**DDoS Protection:**
* Rate limiting per IP
* Anycast routing (distribute load)
* Challenge-response (CAPTCHA)
* Blackholing (drop traffic)
* CDN with DDoS protection (Cloudflare, Akamai)

**Man-in-the-Middle (MITM):**
* Use HTTPS/TLS (encryption)
* Certificate pinning
* HSTS (HTTP Strict Transport Security)
* Avoid public WiFi or use VPN

**SQL Injection:**
* Parameterized queries (prepared statements)
* Input validation
* Least privilege database user
* Web Application Firewall (WAF)

**XSS (Cross-Site Scripting):**
* Output encoding
* Content Security Policy (CSP)
* HttpOnly cookies
* Input sanitization

## Key Formulas

**Bandwidth-Delay Product:** `BDP = Bandwidth * RTT`
* Amount of data "in flight" on network

**Throughput:** `Throughput ≤ Window Size / RTT`
* Max throughput limited by TCP window and RTT

**Utilization:** `U = L / (L + RTT * Bandwidth)`
* Where L = packet size

**DNS Query Time:** `Total = Recursive lookups * RTT per lookup`

**HTTP Response Time:** `Total = DNS + TCP + TLS + Request + Server + Response`
