# GoldPet Infrastructure Deployment Guide

## 1. Setup Directory
Move this entire `infra` folder to your server (e.g., via SCP or Git).
We assume you place it at `~/goldpet-infra`.

```bash
# Example
mkdir -p ~/goldpet-infra
# Copy files into this directory...
cd ~/goldpet-infra
```

## 2. Docker Services (DB, Redis, MinIO, Jenkins)
Start the backend services first.

1.  **Configure Secrets**:
    Copy `.env` and set your real passwords.
    ```bash
    cp .env .env.production
    nano .env.production # Edit passwords!
    ```

2.  **Start Containers**:
    ```bash
    docker compose --env-file .env.production up -d
    ```

3.  **Verify**:
    ```bash
    docker compose ps
    # Should see: goldpet-db, goldpet-redis, goldpet-minio, goldpet-jenkins
    ```

## 3. Host Nginx Configuration
Connect your domains to the services.

1.  **Copy Configs**:
    Open `nginx_host_configs.conf` in this folder. It contains server blocks for `app`, `api`, `jenkins`, `www`.
    You should split them into separate files or copy strictly what you need to `/etc/nginx/sites-available/goldpet.conf`.

    ```bash
    sudo nano /etc/nginx/sites-available/goldpet.conf
    # Paste the content of nginx_host_configs.conf here
    ```

2.  **Enable Site**:
    ```bash
    sudo ln -s /etc/nginx/sites-available/goldpet.conf /etc/nginx/sites-enabled/
    ```

3.  **Test & Reload**:
    ```bash
    sudo nginx -t
    sudo systemctl reload nginx
    ```

## 4. Verification URLs
- Frontend: `https://app.ciccosoft.co.kr`
- API: `https://api.ciccosoft.co.kr/health` (Assuming your Spring Boot is running)
- Jenkins: `https://jenkins.ciccosoft.co.kr`
- MinIO Console: Access via port `:9001` or configure Nginx proxy if needed.
