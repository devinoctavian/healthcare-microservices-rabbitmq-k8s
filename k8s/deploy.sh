#!/bin/bash

# ============================================
# Klinik Antrian - Kubernetes Deployment Script
# ============================================

set -e

NAMESPACE="klinik-antrian"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Build all Docker images
build_images() {
    print_status "Building Docker images..."
    
    docker build -t klinik/auth-service:latest "$PROJECT_DIR/auth-service"
    docker build -t klinik/doctor-service:latest "$PROJECT_DIR/doctor-service"
    docker build -t klinik/patient-service:latest "$PROJECT_DIR/patient-service"
    docker build -t klinik/queue-service:latest "$PROJECT_DIR/queue-service"
    docker build -t klinik/frontend:latest "$PROJECT_DIR/frontend"
    
    print_success "All images built successfully!"
}

# Load images to minikube (if using minikube)
load_to_minikube() {
    if command -v minikube &> /dev/null; then
        print_status "Loading images to Minikube..."
        minikube image load klinik/auth-service:latest
        minikube image load klinik/doctor-service:latest
        minikube image load klinik/patient-service:latest
        minikube image load klinik/queue-service:latest
        minikube image load klinik/frontend:latest
        print_success "Images loaded to Minikube!"
    fi
}

# Deploy all resources
deploy() {
    print_status "Deploying Klinik Antrian to Kubernetes..."
    
    # Create namespace first
    print_status "Creating namespace..."
    kubectl apply -f "$SCRIPT_DIR/namespace.yaml"
    
    # Apply configmap and secrets
    print_status "Applying ConfigMap and Secrets..."
    kubectl apply -f "$SCRIPT_DIR/configmap.yaml"
    kubectl apply -f "$SCRIPT_DIR/secret.yaml"
    
    # Deploy MySQL
    print_status "Deploying MySQL..."
    kubectl apply -f "$SCRIPT_DIR/mysql/"
    
    # Wait for MySQL to be ready
    print_status "Waiting for MySQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=mysql -n $NAMESPACE --timeout=120s || true
    
    # Deploy backend services
    print_status "Deploying backend services..."
    kubectl apply -f "$SCRIPT_DIR/auth-service/"
    kubectl apply -f "$SCRIPT_DIR/doctor-service/"
    kubectl apply -f "$SCRIPT_DIR/patient-service/"
    kubectl apply -f "$SCRIPT_DIR/queue-service/"
    
    # Deploy frontend
    print_status "Deploying frontend..."
    kubectl apply -f "$SCRIPT_DIR/frontend/"
    
    # Apply ingress (optional)
    print_status "Applying Ingress..."
    kubectl apply -f "$SCRIPT_DIR/ingress.yaml" || print_warning "Ingress failed - may need ingress controller"
    
    print_success "Deployment complete!"
    echo ""
    print_status "Checking deployment status..."
    kubectl get all -n $NAMESPACE
}

# Delete all resources
teardown() {
    print_warning "Removing all Klinik Antrian resources..."
    
    kubectl delete -f "$SCRIPT_DIR/ingress.yaml" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/frontend/" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/queue-service/" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/patient-service/" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/doctor-service/" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/auth-service/" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/mysql/" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/secret.yaml" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/configmap.yaml" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/namespace.yaml" --ignore-not-found
    
    print_success "All resources removed!"
}

# Show status
status() {
    print_status "Klinik Antrian Status:"
    echo ""
    kubectl get all -n $NAMESPACE 2>/dev/null || print_warning "Namespace not found"
    echo ""
    kubectl get pvc -n $NAMESPACE 2>/dev/null || true
    echo ""
    kubectl get ingress -n $NAMESPACE 2>/dev/null || true
}

# Get access URL
get_url() {
    if command -v minikube &> /dev/null; then
        print_status "Minikube URL:"
        minikube service frontend -n $NAMESPACE --url 2>/dev/null || true
    else
        print_status "NodePort URL:"
        NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}' 2>/dev/null || echo "localhost")
        echo "http://$NODE_IP:30080"
    fi
}

# Show logs
logs() {
    SERVICE=${2:-"all"}
    if [ "$SERVICE" == "all" ]; then
        print_status "Use: $0 logs <service-name>"
        echo "Available services: auth-service, doctor-service, patient-service, queue-service, frontend, mysql"
    else
        kubectl logs -f -l app=$SERVICE -n $NAMESPACE --all-containers
    fi
}

# Show help
show_help() {
    echo "Klinik Antrian - Kubernetes Deployment Script"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  build     Build all Docker images"
    echo "  up        Deploy all resources to Kubernetes"
    echo "  down      Remove all resources from Kubernetes"
    echo "  status    Show current deployment status"
    echo "  url       Get access URL"
    echo "  logs      Show logs (e.g., $0 logs auth-service)"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build          # Build all Docker images"
    echo "  $0 up             # Deploy to Kubernetes"
    echo "  $0 status         # Check status"
    echo "  $0 logs frontend  # View frontend logs"
    echo "  $0 down           # Remove everything"
}

# Main
case "${1:-help}" in
    build)
        build_images
        ;;
    load)
        load_to_minikube
        ;;
    up|deploy)
        deploy
        ;;
    down|teardown|delete)
        teardown
        ;;
    status)
        status
        ;;
    url)
        get_url
        ;;
    logs)
        logs "$@"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac