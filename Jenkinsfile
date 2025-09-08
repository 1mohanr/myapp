pipeline {
    agent any

    environment {
        REGISTRY           = 'docker.io'
        REGISTRY_NAMESPACE = 'ramm978' // Replace with your Docker Hub username
        IMAGE_NAME         = 'myapp'
        K8S_NAMESPACE      = 'demo'
    }

    stages {
        stage('Cleanup') {
            steps {
                echo "Cleaning workspace before starting..."
                deleteDir()   // wipes the workspace at the start of every build
            }
        }

        stage('Checkout') {
            steps {
                script {
                    git branch: 'main',
                        url: 'https://github.com/1mohanr/myapp.git'
                }

                script {
                    env.IMAGE_TAG = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                }

                echo "Image tag will be: ${env.IMAGE_TAG}"
            }
        }

        stage('Build Image') {
            steps {
                sh "docker build -t ${REGISTRY}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Login & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PWD')]) {
                    sh """
                        echo $DH_PWD | docker login -u $DH_USER --password-stdin $REGISTRY
                        docker push ${REGISTRY}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    kubectl -n ${K8S_NAMESPACE} set image deployment/${IMAGE_NAME}-deployment ${IMAGE_NAME}=${REGISTRY}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} --record
                """
            }
        }
    }

    post {
        always {
            echo "Cleaning workspace after build..."
            cleanWs()   // requires 'Workspace Cleanup Plugin'
        }
    }
}

