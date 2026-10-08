# VectorShield Production Deployment & Operations Guide

This guide covers production deployment architectures, containerization, Kubernetes configurations, and reverse proxy hardening for **VectorShield**.

---

## 1. System Requirements & Architecture

### Minimum Production Sizing
* **CPU**: 4 vCPUs (Intel Xeon / AMD EPYC or Apple Silicon)
* **RAM**: 8 GB RAM (ChromaDB index storage & embedding cache)
* **Disk**: 50 GB NVMe SSD
* **OS**: Linux (Ubuntu 22.04 LTS / Debian 12 / RHEL 9) or Windows Server
* **Python Runtime**: Python 3.10, 3.11, or 3.12
* **Node.js**: Node 18+ (for building frontend static assets)

---

## 2. Docker & Docker Compose Deployment

VectorShield ships with a multi-stage production Docker architecture.

### Multi-Stage Dockerfile
```dockerfile
# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend
FROM python:3.11-slim AS production
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/
COPY start_app.py ./

# Copy compiled frontend from Stage 1 into backend static distribution
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["python", "start_app.py"]
```

### Docker Compose Configuration (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  vectorshield:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: vectorshield-app
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - HOST=0.0.0.0
      - ENVIRONMENT=production
      - CHROMA_PERSIST_DIR=/app/data/chroma
      - QUARANTINE_DIR=/app/data/quarantine
      - LOG_LEVEL=INFO
    volumes:
      - vectorshield_data:/app/data
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '1.0'
          memory: 2G

volumes:
  vectorshield_data:
    driver: local
```

Launch with:
```bash
docker compose up -d --build
```

---

## 3. Kubernetes Deployment (k8s Manifests)

For cloud native clusters (EKS, GKE, AKS):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vectorshield-deployment
  labels:
    app: vectorshield
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vectorshield
  template:
    metadata:
      labels:
        app: vectorshield
    spec:
      containers:
      - name: vectorshield
        image: ghcr.io/chinmayimagdum12/vectorshield:v1.0.0
        ports:
        - containerPort: 8000
        env:
        - name: ENVIRONMENT
          value: "production"
        resources:
          requests:
            cpu: "1000m"
            memory: "2Gi"
          limits:
            cpu: "2000m"
            memory: "4Gi"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: vectorshield-service
spec:
  type: ClusterIP
  selector:
    app: vectorshield
  ports:
  - port: 80
    targetPort: 8000
```

---

## 4. NGINX Hardened Reverse Proxy Configuration

Terminates TLS, enforces modern cipher suites, and sets strict security headers:

```nginx
server {
    listen 443 ssl http2;
    server_name vectorshield.internal.enterprise;

    ssl_certificate /etc/ssl/certs/vectorshield.crt;
    ssl_certificate_key /etc/ssl/private/vectorshield.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;" always;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Prometheus Metrics & Alerting

VectorShield exposes metrics formatted for Prometheus scraping at `/metrics`:
* `vectorshield_scanned_documents_total`: Cumulative counter of documents evaluated.
* `vectorshield_threats_quarantined_total`: Counter of quarantined threats partitioned by `threat_id`.
* `vectorshield_layer_latency_seconds`: Histogram of latency across Layers L0 through L5.
* `vectorshield_canary_leaks_prevented_total`: Counter of intercepted output prompt extraction attempts.
