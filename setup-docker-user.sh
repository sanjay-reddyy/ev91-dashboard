#!/bin/bash

# setup-docker-user.sh
# Author: Sanjay (EV91)
# Purpose: Allow current user to run Docker without sudo

echo "🚀 Starting Docker non-root setup..."

# Step 1: Create docker group if it doesn’t exist
sudo groupadd docker 2>/dev/null || echo "✅ Docker group already exists"

# Step 2: Add current user to docker group
sudo usermod -aG docker $USER
echo "✅ Added $USER to docker group"

# Step 3: Apply group change to current session
newgrp docker <<EONG
  echo "🔁 Group updated successfully"
EONG

# Step 4: Fix Docker socket permissions (safely)
sudo chmod 666 /var/run/docker.sock
echo "✅ Docker socket permissions updated"

# Step 5: Enable Docker to auto-start on reboot
sudo systemctl enable docker >/dev/null 2>&1 && echo "✅ Docker enabled on boot"

# Step 6: Restart Docker service
sudo systemctl restart docker
echo "🔄 Docker service restarted"

# Step 7: Test Docker access
docker ps >/dev/null 2>&1 && echo "🎉 Docker is ready to use without sudo!" || echo "⚠️ Please re-login or reboot once."

echo "✅ Setup completed successfully!"
