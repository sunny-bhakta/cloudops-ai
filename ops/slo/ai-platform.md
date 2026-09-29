# CloudOps AI Platform — SLO / SLI

## Purpose

This document defines the initial Service Level Indicators (SLIs)
and Service Level Objectives (SLOs) for the CloudOps AI Platform.

These targets are initial engineering targets and should be reviewed
after sufficient production traffic and historical metrics are available.

---

## 1. API Availability

### SLI

Percentage of successful API requests handled by the platform.

### SLO

Target: 99.5% monthly availability.

### Measurement

Use:

- ALB request metrics
- ECS service health
- Application health endpoint

---

## 2. API Error Rate

### SLI

Percentage of API requests resulting in server-side errors.

### SLO

Target: less than 1% of requests.

### Measurement

Monitor:

- ALB HTTP 5xx
- Application errors
- CloudWatch logs

---

## 3. API Latency

### SLI

Time required for the API to respond to a request.

### SLO

Initial target:

- p95 < 2 seconds for non-AI API requests

AI requests are measured separately because model latency is variable.

---

## 4. AI Request Success Rate

### SLI

Percentage of `/ai/chat` requests completed successfully.

### SLO

Target: 99% successful AI requests.

### Measurement

Use:

- AI request metrics
- Application logs
- Groq/provider errors

---

## 5. AI Request Latency

### SLI

Time required to complete an `/ai/chat` request.

### SLO

Initial target:

- p95 < 10 seconds

This target should be reviewed after collecting real production
latency data.

---

## 6. ECS Service Health

### SLI

Percentage of desired ECS tasks that are running and healthy.

### SLO

Target:

- Desired task count should normally equal running task count.
- No persistent unhealthy ECS service state.

### Measurement

Use:

- ECS service metrics
- ALB target health
- CloudWatch alarms

---

## 7. Review Process

SLOs should be reviewed after sufficient traffic and operational
history are available.

Targets may be adjusted based on:

- Real latency
- Error rates
- AI provider performance
- Infrastructure cost
- Customer requirements