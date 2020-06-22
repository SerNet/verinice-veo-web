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
                            dockerImage.push(env.BUILD_NUMBER)
                        } else if (env.GIT_BRANCH ==~ /PR-\d+/) { // we only want to build pull requests
                            // Note that '/' is not allowed in docker tags.
                            def dockertag = env.GIT_BRANCH.replace("/","-")
                            dockerImage.push("${dockertag}")
                            dockerImage.push("${dockertag}-${env.BUILD_NUMBER}")
                        }
                    }
                }
            }
        }
    }
}