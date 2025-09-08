pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ramm978"
        IMAGE_NAME = "myapp"
        KUBECONFIG = "/var/lib/jenkins/.kube/config"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER} ."
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh """
                        echo $PASS | docker login -u $USER --password-stdin
                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withEnv(["KUBECONFIG=${KUBECONFIG}"]) {
                    // Automatically update Deployment with new image
                    sh "kubectl set image deployment/myapp-deployment myapp=${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER} -n default"

                    // Apply any updated YAMLs in repo (manifests change automation)
                    sh "kubectl apply -f k8s/"
                }
            }
        }
    }
}

