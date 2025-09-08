pipeline {
    agent any

    environment {
        REGISTRY = 'docker.io'
        REGISTRY_NAMESPACE = 'ramm978'   // Docker Hub username
        IMAGE_NAME = 'myapp'
        K8S_NAMESPACE = 'demo'
    }

    options {
        ansiColor('xterm')
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.IMAGE_TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                }
                echo "Image tag: ${env.IMAGE_TAG}"
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    script {
                        sh '''
                        docker build -t $REGISTRY/$REGISTRY_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG .
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin $REGISTRY
                        docker push $REGISTRY/$REGISTRY_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG
                        docker logout $REGISTRY
                        '''
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    file(credentialsId: 'kubeconfig-file', variable: 'KUBECONFIG'),
                    usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')
                ]) {
                    script {
                        sh '''
                        set -euxo pipefail

                        # Ensure namespace exists
                        kubectl get ns $K8S_NAMESPACE || kubectl create ns $K8S_NAMESPACE

                        # Create/update imagePullSecret
                        kubectl -n $K8S_NAMESPACE create secret docker-registry regcred \
                            --docker-server=$REGISTRY \
                            --docker-username=$DOCKER_USER \
                            --docker-password=$DOCKER_PASS \
                            --docker-email=ci@example.com \
                            --dry-run=client -o yaml | kubectl apply -f -

                        # Apply manifests
                        kubectl -n $K8S_NAMESPACE apply -f k8s/

                        # Update deployment image
                        kubectl -n $K8S_NAMESPACE set image deployment/$IMAGE_NAME \
                            $IMAGE_NAME=$REGISTRY/$REGISTRY_NAMESPACE/$IMAGE_NAME:$IMAGE_TAG --record

                        # Wait for rollout
                        kubectl -n $K8S_NAMESPACE rollout status deployment/$IMAGE_NAME

                        # Show all resources
                        kubectl -n $K8S_NAMESPACE get all
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful: $IMAGE_NAME:$IMAGE_TAG"
        }
        failure {
            echo "❌ Deployment failed!"
        }
    }
}

