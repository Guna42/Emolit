# 🚀 EC2 DEPLOYMENT CHEATSHEET

## 1. Prepare your EC2
Make sure Docker and Docker Compose are installed on your EC2 instance.

## 2. Environment File (.env)
Create a `.env` file on your EC2 in the same folder as your `docker-compose.yml`:
```env
MONGODB_URI="your_mongodb_atlas_uri"
MONGODB_DB="emolit"
OPENAI_API_KEY="your_api_key"
OPENAI_BASE_URL=https://openrouter.ai/api/v1
# For security, use a random string for this in production
JWT_SECRET_KEY="generate-a-random-secret-here"
```

## 3. Production Docker Compose
Create `docker-compose.yml` on EC2:
```yaml
version: '3.8'

services:
  backend:
    image: 418295688383.dkr.ecr.eu-north-1.amazonaws.com/emolit-backend:latest
    container_name: emolit-backend
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped

  frontend:
    image: 418295688383.dkr.ecr.eu-north-1.amazonaws.com/emolit-frontend:latest
    container_name: emolit-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

## 4. Run the App
```bash
# Login to AWS ECR
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 418295688383.dkr.ecr.eu-north-1.amazonaws.com

# Pull and Start
docker-compose pull
docker-compose up -d

# Verify
docker-compose ps
docker logs -f emolit-backend
```

## 5. AWS Security Group Settings
Ensure these Inbound Rules are set:
- **HTTP (80)**: 0.0.0.0/0
- **Custom TCP (8000)**: 0.0.0.0/0 (For API access)
- **SSH (22)**: Your IP only (For management)
