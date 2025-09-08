pipeline {
    agent any

    environment {
        REGISTRY          = 'docker.io'
        REGISTRY_NAMESPACE = 'ramm978' // 👈 your Docker Hub username
        IMAGE_NAME        = 'myapp'
        K8S_NAMESPACE     = 'demo'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    // Clean workspace to avoid corrupted/missing .git issues
                    deleteDir()

                    // Explicitly clone your repo
                    git branch: 'main',
                        url: 'https://github.com/1mohanr/myapp.git'
                }

                script {
                    // Generate short Git commit hash as image tag
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
                script {
                    sh "docker build -t ${REGISTRY}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} ."
                }
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
                script {
                    sh """
                        kubectl -n ${K8S_NAMESPACE} set image deployment/${IMAGE_NAME}-deployment ${IMAGE_NAME}=${REGISTRY}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${IMAGE_TAG} --record
                    """
                }
            }
        }
    }
}

