pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ramm978"
        IMAGE_NAME = "myapp"
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
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh """
                        echo $PASS | docker login -u $USER --password-stdin
                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER}
                        docker tag ${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER} ${DOCKERHUB_USER}/${IMAGE_NAME}:latest
                        docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl set image deployment/myapp-deployment myapp=${DOCKERHUB_USER}/${IMAGE_NAME}:${BUILD_NUMBER} -n default
                        kubectl apply -f k8s/
                    """
                }
            }
        }
    }
}

