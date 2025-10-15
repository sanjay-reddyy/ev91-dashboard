# 🚀 EV91 Platform — AWS Deployment Guide (PowerShell-ready)

> Single document covering: **Local Docker testing → Build & push images → Create EKS → Kubernetes secrets/configmaps → Deploy → Ingress → Verify & troubleshoot**  
> All commands are PowerShell-friendly. Replace `<PLACEHOLDER>` values before running any commands.

---

## 🔧 Prerequisites

- AWS CLI configured (`aws configure`) with proper IAM user.
- `kubectl` installed and configured.
- `eksctl` installed.
- `helm` installed.
- `docker` (Docker Desktop) logged in to Docker Hub (`docker login`).
- `npx`, `node`, `npm`/`pnpm` available for migrations/seeding (inside pods).
- Recommended: `jq` for JSON parsing if needed (optional).

---

## 🧾 Set variables (edit these at top of script)

```powershell
# Edit these before running commands
$AWS_REGION = "ap-south-1"
$CLUSTER_NAME = "ev91-cluster"
$NODEGROUP_NAME = "ev91-nodes"
$NODE_TYPE = "t3.large"
$MIN_NODES = 3
$MAX_NODES = 5
$DOCKERHUB_USER = "sanjub07"
$RDS_ENDPOINT = "<your-rds-endpoint>.ap-south-1.rds.amazonaws.com"
$RDS_PORT = 5432
$RDS_USER = "postgres"
$RDS_PASSWORD = "<RDS_PASSWORD>"
$JWT_SECRET = "<CHANGE_ME_TO_A_STRONG_JWT_SECRET>"
$AWS_ACCESS_KEY_ID = "<YOUR_AWS_ACCESS_KEY_ID>"
$AWS_SECRET_ACCESS_KEY = "<YOUR_AWS_SECRET_ACCESS_KEY>"
```

> Security note: Never commit secrets to git. Use AWS Secrets Manager or SSM Parameter Store in production.

---

## 1) Local Docker setup (optional, for dev testing)

```powershell
# Create Docker network for local testing
docker network create ev91-network

# Start a local Postgres container for dev testing
docker run -d --name ev91-postgres --network ev91-network `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD="Sanju@123" `
  -e POSTGRES_DB=ev91dashboard `
  -p 5432:5432 `
  postgres:15
```

### Build local images (PowerShell - single line per build)

```powershell
docker build -t sanjub07/admin-portal:latest ./admin-portal
docker build -t sanjub07/api-gateway:latest ./api-gateway
docker build -t sanjub07/auth-service:latest ./auth-service
docker build -t sanjub07/client-store-service:latest ./client-store-service
docker build -t sanjub07/rider-service:latest ./rider-service
docker build -t sanjub07/spare-parts-service:latest ./spare-parts-service
docker build -t sanjub07/vehicle-service:latest ./vehicle-service
```

> Make sure each `Dockerfile` context path is correct (replace `./service-dir` if needed).

### Run containers locally (if you want quick smoke test)

```powershell
docker run -d --name admin-portal --network ev91-network -p 3003:3003 sanjub07/admin-portal:latest
docker run -d --name api-gateway --network ev91-network -p 8000:8000 sanjub07/api-gateway:latest
docker run -d --name auth-service --network ev91-network -p 4001:4001 sanjub07/auth-service:latest
docker run -d --name client-store-service --network ev91-network -p 3006:3006 sanjub07/client-store-service:latest
docker run -d --name rider-service --network ev91-network -p 4005:4005 sanjub07/rider-service:latest
docker run -d --name spare-parts-service --network ev91-network -p 4010:4010 `
  -e "DATABASE_URL=postgresql://$($RDS_USER)%40$($RDS_PASSWORD)@ev91-postgres:5432/ev91platform?schema=spare_parts" `
  -e "JWT_SECRET=$JWT_SECRET" `
  sanjub07/spare-parts-service:latest
docker run -d --name vehicle-service --network ev91-network -p 4004:4004 sanjub07/vehicle-service:latest
```

> URL-encoding note: when using `@` in URLs, encode to `%40`. Example shown above uses `%40` style for clarity.

---

## 2) Push images to Docker Hub

```powershell
# Tagging already used above; confirm login first
docker login

# Push
docker push sanjub07/auth-service:latest
docker push sanjub07/api-gateway:latest
docker push sanjub07/admin-portal:latest
docker push sanjub07/client-store-service:latest
docker push sanjub07/rider-service:latest
docker push sanjub07/spare-parts-service:latest
docker push sanjub07/vehicle-service:latest
```

---

## 3) Create EKS cluster (eksctl) — PowerShell friendly

```powershell
eksctl create cluster `
  --name $CLUSTER_NAME `
  --region $AWS_REGION `
  --nodegroup-name $NODEGROUP_NAME `
  --node-type $NODE_TYPE `
  --nodes $MIN_NODES `
  --nodes-min $MIN_NODES `
  --nodes-max $MAX_NODES
```

Associate OIDC provider and update VPC CNI addon:

```powershell
eksctl utils associate-iam-oidc-provider --cluster $CLUSTER_NAME --approve
eksctl update addon --cluster $CLUSTER_NAME --name vpc-cni
```

Verify nodes are Ready:

```powershell
kubectl get nodes
```

---

## 4) Quick DB connectivity test from cluster (debug pod)

```powershell
# Run an ephemeral debug pod with postgres client
kubectl run -it --rm debug --image=postgres -- bash
# inside container use psql (example)
# psql "postgres://$RDS_USER:$RDS_PASSWORD@$RDS_ENDPOINT:$RDS_PORT/<DB_NAME>"
```

---

## 5) Create namespace & Kubernetes Secrets (PowerShell safe)

```powershell
kubectl create namespace ev91
```

Create database secrets (single command). Replace `username:password` and DB names.

```powershell
kubectl create secret generic ev91-db-secrets -n ev91 `
  --from-literal=auth-service-db-url="postgres://<AUTH_DB_USER>:<AUTH_DB_PASS>@$RDS_ENDPOINT:$RDS_PORT/authdb" `
  --from-literal=client-store-service-db-url="postgres://<CLIENT_DB_USER>:<CLIENT_DB_PASS>@$RDS_ENDPOINT:$RDS_PORT/clientdb" `
  --from-literal=rider-service-db-url="postgres://<RIDER_DB_USER>:<RIDER_DB_PASS>@$RDS_ENDPOINT:$RDS_PORT/riderdb" `
  --from-literal=vehicle-service-db-url="postgres://<VEHICLE_DB_USER>:<VEHICLE_DB_PASS>@$RDS_ENDPOINT:$RDS_PORT/vehicledb" `
  --from-literal=spare-parts-service-db-url="postgres://<SPARE_DB_USER>:<SPARE_DB_PASS>@$RDS_ENDPOINT:$RDS_PORT/sparedb"
```

Create JWT secret:

```powershell
kubectl create secret generic ev91-jwt-secrets -n ev91 `
  --from-literal=jwt-secret="$JWT_SECRET"
```

Create AWS secret (if you need Kubernetes to access AWS APIs directly — consider IRSA instead):

```powershell
kubectl create secret generic ev91-aws-secrets -n ev91 `
  --from-literal=AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" `
  --from-literal=AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
```

Twilio and auth defaults:

```powershell
kubectl create secret generic ev91-twilio-secrets -n ev91 `
  --from-literal=twilio-account-sid="<TWILIO_SID>" `
  --from-literal=twilio-auth-token="<TWILIO_TOKEN>"

kubectl create secret generic ev91-auth-secrets -n ev91 `
  --from-literal=default-admin-email="admin@ev91.com" `
  --from-literal=default-admin-password="<ADMIN_PASSWORD>"
```

Verify secrets:

```powershell
kubectl get secrets -n ev91
kubectl describe secret ev91-db-secrets -n ev91
```

> **Security best practice:** For EKS use IRSA (IAM Roles for Service Accounts) where possible and keep AWS keys out of k8s secrets.

---

## 6) Install NGINX Ingress Controller (helm)

```powershell
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace
```

Check ingress controller pods:

```powershell
kubectl get pods -n ingress-nginx
```

---

## 7) Create ConfigMap for internal service URLs

```powershell
kubectl create configmap ev91-service-config -n ev91 `
  --from-literal=AUTH_SERVICE_URL="http://auth-service:4001" `
  --from-literal=RIDER_SERVICE_URL="http://rider-service:4005" `
  --from-literal=VEHICLE_SERVICE_URL="http://vehicle-service:4004" `
  --from-literal=CLIENT_STORE_SERVICE_URL="http://client-store-service:3006" `
  --from-literal=SPARE_PARTS_SERVICE_URL="http://spare-parts-service:4010"
```

---

## 8) Apply Kubernetes manifests (Deployments / Services / Ingress)

> Place your YAML manifests in the repo. Example filenames used below — ensure `metadata.namespace: ev91` or use `-n ev91` flag.

```powershell
kubectl apply -f ./k8s/admin-portal.yaml -n ev91
kubectl apply -f ./k8s/api-gateway.yaml -n ev91
kubectl apply -f ./k8s/auth-service.yaml -n ev91
kubectl apply -f ./k8s/client-store-service.yaml -n ev91
kubectl apply -f ./k8s/rider-service.yaml -n ev91
kubectl apply -f ./k8s/spare-parts-service.yaml -n ev91
kubectl apply -f ./k8s/vehicle-service.yaml -n ev91
kubectl apply -f ./k8s/ev91-ingress.yaml -n ev91
```

> Tip: use `kubectl apply -k ./kustomize` or Helm charts for repeatable deployments.

---

## 9) Rollout restart & run DB migrations / seeds inside pods

Restart deployments if you changed images or env:

```powershell
kubectl rollout restart deployment api-gateway -n ev91
kubectl rollout restart deployment admin-portal -n ev91
```

Run prisma generate / db push / seed inside a pod (example for auth-service). This uses `kubectl exec` to run commands inside the running container:

```powershell
# Get pod name (first pod matching the label)
$pod = kubectl get pods -n ev91 -l app=auth-service -o jsonpath="{.items[0].metadata.name}"
# Run migrations (adjust commands to your container's tooling)
kubectl exec -it $pod -n ev91 -- npx prisma generate
kubectl exec -it $pod -n ev91 -- npx prisma db push
kubectl exec -it $pod -n ev91 -- npx prisma db seed
```

> If container image doesn't include `npx` you may run a job or init container with the appropriate tooling.

---

## 10) Test & Port-forward for local checks

API Gateway health:

```powershell
kubectl port-forward svc/api-gateway 8000:8000 -n ev91
# On your local machine:
Invoke-RestMethod -Uri http://localhost:8000/api/health
# or use curl:
curl http://localhost:8000/api/health
```

Admin UI (port-forward):

```powershell
kubectl port-forward svc/admin-portal 3003:80 -n ev91
# Open in browser:
Start-Process "http://localhost:3003/admin"
```

---

## 11) Verify cluster resources & debug

```powershell
kubectl get pods -n ev91
kubectl get svc -n ev91
kubectl get ingress -n ev91

# Describe a pod
kubectl describe pod <pod-name> -n ev91

# Show logs (tail last 200 lines)
kubectl logs <pod-name> -n ev91 --tail=200

# For deployment rollout status
kubectl rollout status deployment/<deployment-name> -n ev91
```

Common useful PowerShell snippet to get a pod name then show logs:

```powershell
$pod = kubectl get pods -n ev91 -l app=api-gateway -o jsonpath="{.items[0].metadata.name}"
kubectl logs $pod -n ev91 --tail=200
```

---

## 12) Get Ingress external IP / Hostname and update DNS

```powershell
kubectl get ingress -n ev91
# Wait until EXTERNAL-IP is assigned (may be hostname if using AWS ALB/NLB)
```

When you have the IP/hostname, update your Admin Portal `.env` / DNS records accordingly. Then rebuild/push admin-portal if you changed domain-related config:

```powershell
docker build -t sanjub07/admin-portal:latest ./admin-portal
docker push sanjub07/admin-portal:latest
kubectl rollout restart deployment admin-portal -n ev91
```

---

## 13) Optional: Horizontal Pod Autoscaler (HPA)

```powershell
kubectl autoscale deployment api-gateway -n ev91 --min=2 --max=5 --cpu-percent=80
```

---

## 14) Cleanup (if you want to destroy dev cluster & resources)

```powershell
# Delete k8s resources
kubectl delete namespace ev91
helm uninstall ingress-nginx -n ingress-nginx

# Delete cluster (eksctl)
eksctl delete cluster --name $CLUSTER_NAME --region $AWS_REGION
```

> Double-check you are in the correct account/region before deleting.

---

## 15) Security & Production Best Practices (short checklist)

- Use **IRSA** (IAM Roles for Service Accounts) instead of embedding AWS keys in k8s secrets.  
- Use **AWS Secrets Manager** for DB passwords / API keys; mount via Secrets Store CSI driver or fetch at runtime.  
- Set resource requests/limits for every container.  
- Enable **PodDisruptionBudget** and **readiness/liveness probes**.  
- Use **NetworkPolicies** to restrict traffic between services.  
- Use **imagePullSecrets** for private registries.  
- Setup **monitoring & logging**: CloudWatch / Prometheus & Grafana, and centralize logs (Fluent Bit).  
- Configure **backup** for RDS and take regular snapshots.  
- Use **TLS** for ingress (use cert-manager + Let's Encrypt or ACM + ALB).  
- Use **CI/CD** (GitHub Actions/Jenkins) to automate builds, tests, and deployment (image tagging by SHA).

---

## 16) Troubleshooting tips

- `CrashLoopBackOff`: `kubectl describe pod <pod>` and `kubectl logs <pod>` to inspect.  
- `Image pull errors`: check `imagePullPolicy`, Docker Hub rate limits, or `imagePullSecrets`.  
- DB connection errors: ensure security group of RDS allows EKS nodegroup IPs or VPC peering; use correct DB endpoint + user + port.  
- Secrets not found: ensure manifest references `secretKeyRef` with correct names and namespace.  
- Ingress not getting external IP: confirm cloud provider controller is running, check `kubectl get svc -n ingress-nginx`.

---

## 17) Example: Minimal `auth-service` Deployment snippet (PowerShell YAML usage note)

> YAML files are applied with `kubectl apply -f`. Below is an example `auth-service.yaml` (place in `./k8s/auth-service.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: ev91
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
        - name: auth-service
          image: sanjub07/auth-service:latest
          ports:
            - containerPort: 4001
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: ev91-db-secrets
                  key: auth-service-db-url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: ev91-jwt-secrets
                  key: jwt-secret
          readinessProbe:
            httpGet:
              path: /api/health
              port: 4001
            initialDelaySeconds: 5
            periodSeconds: 10
```

> Apply with PowerShell:
```powershell
kubectl apply -f ./k8s/auth-service.yaml -n ev91
```

---

## ✅ Final Notes

- This document is **PowerShell-friendly** — backticks (`) used for line continuation and `$variables` for reusability.  
- Replace **every** `<PLACEHOLDER>` with your real values.  
- For production, migrate secrets to AWS Secrets Manager and enable IRSA.
