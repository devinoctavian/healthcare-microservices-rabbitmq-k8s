# 🏥 Sistem Antrian Puskesmas — EAI Microservices

> **Enterprise Application Integration (EAI)** project — a clinic queue management system built with a **microservices architecture**, **RabbitMQ** as a message broker, and deployable via **Docker Compose** or **Kubernetes**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Tech Stack](#tech-stack)
- [EAI Patterns Implemented](#eai-patterns-implemented)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Run with Docker Compose](#run-with-docker-compose)
  - [Run with Kubernetes](#run-with-kubernetes)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)

---

## Overview

This system digitizes the patient queue process at a community health center (Puskesmas). Patients can register, log in, and take a queue number for a specific doctor on a specific date. Administrators can manage doctors and monitor the queue status in real time.

The system demonstrates key **Enterprise Application Integration** concepts:

- **Message-Oriented Middleware (MOM)** via RabbitMQ
- **Message Translator** pattern (JSON → Canonical XML)
- **Publish/Subscribe (Event-Driven)** choreography
- **Dead Letter Queue (DLQ)** for reliable messaging
- **API Gateway** routing via Kubernetes Ingress

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Port 3000)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│ auth-service │  │doctor-service│  │ patient-service  │
│   :5001      │  │   :5002      │  │     :5003        │
└──────────────┘  └──────────────┘  └────────┬─────────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                    ┌──────▼──────┐
                    │queue-service│  ──── publishes events ────►
                    │   :5004     │                              │
                    └─────────────┘                             │
                                                       ┌────────▼────────┐
                                                       │    RabbitMQ     │
                                                       │  Exchange:      │
                                                       │ puskesmas_events│
                                                       └────────┬────────┘
                                                                │
                                                    ┌───────────▼──────────┐
                                                    │  transformer-service  │
                                                    │  (Message Translator) │
                                                    └──────────────────────┘

All services share a single MySQL instance with isolated databases:
  auth_db | doctor_db | patient_db | queue_db
```

---

## Services

| Service | Port | Description |
|---|---|---|
| **auth-service** | `5001` | Admin authentication (login, JWT issuance) |
| **doctor-service** | `5002` | Doctor CRUD — admin-only write, authenticated read |
| **patient-service** | `5003` | Patient registration & login |
| **queue-service** | `5004` | Queue registration, status updates, publishes RabbitMQ events |
| **transformer-service** | — | Subscribes to RabbitMQ, transforms JSON → Canonical XML |
| **frontend** | `3000` | Web UI (served via Nginx in Docker/K8s) |
| **MySQL** | `3312` | Relational database (4 isolated databases) |
| **RabbitMQ** | `5672` / `15672` | Message broker + management UI |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express.js |
| ORM | Sequelize |
| Database | MySQL 8.0 |
| Message Broker | RabbitMQ 3 (with Management Plugin) |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Containerization | Docker + Docker Compose |
| Orchestration | Kubernetes (Minikube compatible) |
| Ingress | NGINX Ingress Controller |
| XML Processing | xml2js |

---

## EAI Patterns Implemented

### 1. 📨 Message Translator (JSON → Canonical XML)
When a queue is created, `queue-service` publishes a JSON event to RabbitMQ. The `transformer-service` consumes it and translates it into a **Canonical XML** format with a custom namespace (`http://puskesmas.eai/canonical/v1`).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<AntrianEvent xmlns="http://puskesmas.eai/canonical/v1">
  <EventType>QUEUE_CREATED</EventType>
  <Timestamp>2024-01-01T08:00:00.000Z</Timestamp>
  <Source>queue-service</Source>
  <Payload>
    <QueueId>1</QueueId>
    <QueueNumber>3</QueueNumber>
    <PatientName>John Doe</PatientName>
    <DoctorName>Dr. Smith</DoctorName>
    <ScheduleDate>2024-01-01</ScheduleDate>
    <Status>waiting</Status>
  </Payload>
</AntrianEvent>
```

### 2. 📡 Publish/Subscribe (Event-Driven Choreography)
The `queue-service` publishes two event types to a **topic exchange** (`puskesmas_events`):
- `queue.created` — fires when a patient registers for a queue
- `queue.status.updated` — fires when queue status changes (e.g., `waiting` → `called` → `done`)

### 3. 🛡️ Reliable Messaging with Dead Letter Queue (DLQ)
Failed messages are automatically routed to a Dead Letter Exchange (`puskesmas_dlx`) and stored in `queue.created.dlq`, preventing message loss on processing errors.

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- (For K8s) [kubectl](https://kubernetes.io/docs/tasks/tools/) + [Minikube](https://minikube.sigs.k8s.io/)

### Run with Docker Compose

```bash
# 1. Clone the repository
git clone <repo-url>
cd Puskesmas-antrian-eai

# 2. Start all services
docker compose up --build -d

# 3. Seed the admin user (run once after first start)
docker exec klinik-auth-service node seedAdmin.js
```

**Service URLs after startup:**

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Auth Service | http://localhost:5001 |
| Doctor Service | http://localhost:5002 |
| Patient Service | http://localhost:5003 |
| Queue Service | http://localhost:5004 |
| RabbitMQ Management UI | http://localhost:15672 (guest / guest) |

```bash
# Stop all services
docker compose down

# Stop and remove volumes (reset DB)
docker compose down -v
```

### Run with Kubernetes

> Tested with **Minikube**. Requires the NGINX Ingress Controller.

```bash
# 1. Start Minikube
minikube start

# 2. Enable Ingress addon
minikube addons enable ingress

# 3. Navigate to the k8s scripts directory
cd k8s

# 4. Build and load Docker images into Minikube
./deploy.sh build
./deploy.sh load

# 5. Deploy all resources
./deploy.sh up

# 6. Check deployment status
./deploy.sh status

# 7. Get access URL
./deploy.sh url
```

**Ingress host:** Add `klinik.local` to your `/etc/hosts` (or `C:\Windows\System32\drivers\etc\hosts`) pointing to the Minikube IP:
```
<minikube-ip>   klinik.local
```

Then access the app at **http://klinik.local**

**Other deploy.sh commands:**
```bash
./deploy.sh logs <service>   # e.g., ./deploy.sh logs queue-service
./deploy.sh down             # Teardown all K8s resources
```

---

## API Reference

All endpoints require a `Bearer <JWT>` token in the `Authorization` header unless marked as **Public**.

### Auth Service — `/auth` (port 5001)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Admin login |

### Doctor Service — `/doctors` (port 5002)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/doctors` | Authenticated | List all doctors |
| `POST` | `/doctors` | Admin only | Create a doctor |
| `PUT` | `/doctors/:id` | Admin only | Update a doctor |
| `DELETE` | `/doctors/:id` | Admin only | Delete a doctor |

### Patient Service — `/patients` (port 5003)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/patients/register` | Public | Register new patient |
| `POST` | `/patients/login` | Public | Patient login |
| `GET` | `/patients/me` | Authenticated | Get current patient profile |

### Queue Service — `/queues` (port 5004)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/queues` | Authenticated | Register for a queue |
| `GET` | `/queues/me` | Authenticated | Get my queues |
| `GET` | `/queues/all` | Authenticated | Get all queues (admin view) |
| `GET` | `/queues/stats` | Authenticated | Get queue statistics |
| `PUT` | `/queues/:id/status` | Authenticated | Update queue status |
| `GET` | `/queues/patient/:name` | Public | Search queues by patient name |

---

## Project Structure

```
Puskesmas-antrian-eai/
├── auth-service/            # Admin authentication
│   ├── config/              # Sequelize DB config
│   ├── middleware/          # JWT auth middleware
│   ├── models/              # Admin model
│   ├── routes/              # Auth routes
│   ├── seedAdmin.js         # Admin user seed script
│   └── server.js
│
├── doctor-service/          # Doctor management
│   ├── middleware/          # Auth + role middleware
│   ├── models/              # Doctor model
│   ├── routes/              # Doctor CRUD routes
│   └── server.js
│
├── patient-service/         # Patient registration & auth
│   ├── middleware/
│   ├── models/              # Patient model
│   ├── routes/              # Patient routes
│   └── server.js
│
├── queue-service/           # Queue management + event publisher
│   ├── middleware/
│   ├── models/              # Queue model
│   ├── routes/              # Queue routes
│   ├── utils/
│   │   └── rabbitmq.js      # RabbitMQ publish utility
│   └── server.js
│
├── transformer-service/     # RabbitMQ consumer + Message Translator
│   └── server.js
│
├── frontend/                # Web UI
│
├── k8s/                     # Kubernetes manifests
│   ├── auth-service/
│   ├── doctor-service/
│   ├── patient-service/
│   ├── queue-service/
│   ├── frontend/
│   ├── mysql/
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── namespace.yaml
│   ├── ingress.yaml
│   └── deploy.sh            # Helper deployment script
│
├── init-db.sql              # MySQL database initialization
└── docker-compose.yml       # Full local stack definition
```

---

## 👥 Authors

Tugas Besar — **Enterprise Application Integration (EAI)**  
Program Studi Informatika · Institut Teknologi Bandung (or your institution)
