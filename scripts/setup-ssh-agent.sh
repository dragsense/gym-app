#!/bin/bash

# SSH Agent Setup Script for Windows Docker Containers
# This script helps configure SSH agent forwarding for GitHub access in Docker containers

echo "Setting up SSH agent forwarding for Docker containers..."

# Check if SSH agent is running
if [ -z "$SSH_AUTH_SOCK" ]; then
    echo "SSH agent is not running. Starting SSH agent..."
    
    # Start SSH agent
    eval "$(ssh-agent -s)"
    
    # Add your SSH key (replace with your key path)
    echo "Please add your SSH key:"
    echo "ssh-add ~/.ssh/id_rsa"
    echo "or"
    echo "ssh-add ~/.ssh/id_ed25519"
    
    echo ""
    echo "After adding your key, run:"
    echo "export SSH_AUTH_SOCK=\$SSH_AUTH_SOCK"
    echo "export SSH_AGENT_PID=\$SSH_AGENT_PID"
    
else
    echo "SSH agent is already running at: $SSH_AUTH_SOCK"
    echo "SSH agent PID: $SSH_AGENT_PID"
fi

echo ""
echo "To test GitHub SSH access:"
echo "ssh -T git@github.com"

echo ""
echo "To start Docker containers with SSH forwarding:"
echo "docker compose -f shared/docker-compose.yml up -d"

