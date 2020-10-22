// required plugins:
// - OAuth Credentials plugin, org.jenkins-ci.plugins:oauth-credentials:0.4
// - Google Container Registry Auth0, google-container-registry-auth:0.3



pipeline {
    agent none

    stages {
        stage('Setup') {
            agent {
                docker {
                    image 'stedolan/jq'
                    args '--entrypoint ""'
                }
            }
            steps {
                sh 'env'
                buildDescription "${env.GIT_BRANCH} ${env.GIT_COMMIT[0..8]}"
                script {
                    projectVersion = sh(returnStdout: true, script: '''jq .version package.json''').trim()
                }
            }
        }
        stage('Dockerimage') {
            agent {
                 label 'docker-image-builder'
            }
            steps {
                script {
                    def dockerImage = docker.build('eu.gcr.io/veo-projekt/veo-web', "--label org.opencontainers.image.version='$projectVersion' --label org.opencontainers.image.revision='$env.GIT_COMMIT' .")
                    // Finally, we'll push the image with several tags:
                    // Pushing multiple tags is cheap, as all the layers are reused.
                    withDockerRegistry(credentialsId: 'gcr:verinice-projekt@gcr', url: 'https://eu.gcr.io') {
                        dockerImage.push("git-${env.GIT_COMMIT}")
                        if (env.GIT_BRANCH == 'master') {
                            dockerImage.push("latest")
                            dockerImage.push("build-${env.BUILD_NUMBER}")
                        } else if (env.GIT_BRANCH == 'develop') {
                            dockerImage.push("develop")
                            dockerImage.push("build-${env.BUILD_NUMBER}")
                        }
                    }
                }
            }
        }
        stage('Trigger Deployment') {
            agent any
            when {
                anyOf { branch 'master'; branch 'develop' }
            }
            steps {
                build job: 'verinice-veo-deployment/master', parameters: [string(name: 'environment', value: ['master':'k8s', 'develop':'k8s-develop'][env.GIT_BRANCH])]
            }
        }
    }
}