// required plugins:
// - OAuth Credentials plugin, org.jenkins-ci.plugins:oauth-credentials:0.4
// - Google Container Registry Auth0, google-container-registry-auth:0.3

def withDockerNetwork(Closure inner) {
  try {
    networkId = UUID.randomUUID().toString()
    sh "docker network create ${networkId}"
    inner.call(networkId)
  } finally {
    sh "docker network rm ${networkId}"
  }
}

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
        stage('Test') {
            agent {
                dockerfile {
                    filename 'test.Dockerfile'
                    args '--entrypoint "" -u 0'
                }
            }
            steps {
                sh 'cd /usr/src/app && npm run test'
                sh "cp /usr/src/app/junit.xml $WORKSPACE"
                junit 'junit.xml'
            }
        }
        stage('Dockerimage') {
            agent {
                 label 'docker-image-builder'
            }
            steps {
                script {
                    def dockerImage = docker.build("eu.gcr.io/veo-projekt/veo-web:git-${env.GIT_COMMIT}", "--build-arg CI_COMMIT_SHA='${env.GIT_COMMIT}' --build-arg CI_JOB_ID='${env.BUILD_NUMBER}' --build-arg CI_COMMIT_TIMESTAMP='${new Date().time}' --label org.opencontainers.image.version='$projectVersion' --label org.opencontainers.image.revision='$env.GIT_COMMIT' .")
                    // Finally, we'll push the image with several tags:
                    // Pushing multiple tags is cheap, as all the layers are reused.
                    withDockerRegistry(credentialsId: 'gcr:verinice-projekt@gcr', url: 'https://eu.gcr.io') {
                        dockerImage.push("git-${env.GIT_COMMIT}")
                        if (env.GIT_BRANCH == 'master') {
                            dockerImage.push("latest")
                            dockerImage.push("build-${env.BUILD_NUMBER}")
                        } else if (env.GIT_BRANCH == 'develop') {
                            dockerImage.push("develop")
                        }
                    }
                }
            }
        }
        stage('End-to-end tests') {
            agent any
            steps {
                sh 'mkdir -p $WORKSPACE/out'
                script {
                    withDockerRegistry(credentialsId: 'gcr:verinice-projekt@gcr', url: 'https://eu.gcr.io') {
                        withDockerNetwork{ n ->
                            docker.image("eu.gcr.io/veo-projekt/veo-web:git-${env.GIT_COMMIT}").withRun("--network ${n} --name veo-web-${n}") {
                                docker.build('veo-web-e2e-tests', '-f e2e.Dockerfile .').inside("--network ${n} -w $WORKSPACE -e no_proxy=localhost,127.0.0.1,veo-web-${n} -e LANG=de_DE.UTF-8") {
                                    catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                                        sh "node --version"
                                        sh "npm --version"
                                        sh "npm install"
                                        def cypressOptions = [ reporter:'junit',
                                                               reporterOptions: [
                                                                 mochaFile: 'out/junit.xml'
                                                               ],
                                                               baseUrl: "http://veo-web-${n}:5000",
                                                               video: false,
                                                               screenshotsFolder: 'out/screenshots',
                                                               defaultCommandTimeout: 10000
                                                             ]
                                        def cypressOptionsStr = groovy.json.JsonOutput.toJson(cypressOptions)
                                        sh "npm run test:e2e -- --config '${cypressOptionsStr}'"
                                    }
                                    sh script: "cp -rt . /home/appuser/.npm/_logs/", returnStatus: true
                                }
                            }
                        }
                    }
                }
            }
            post {
                always {
                    dir ('out'){
                        archiveArtifacts artifacts: '_logs/*,screenshots/**/*.png', allowEmptyArchive: true
                        junit testResults: 'junit.xml'
                        deleteDir()
                    }
                }
                failure {
                    script {
                      def buildLog = sh(script: "wget -q -O- ${BUILD_URL}/consoleText", returnStdout: true)
                      def lastLines = buildLog.readLines().takeRight(50).join('\n')
                      rocketSend channel: '#frontend', message: "A veo front-end build failed", attachments: [
                        [ title: 'Build log excerpt', collapsed: true, text: "...\n${lastLines}" ]
                      ]
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
                build job: 'verinice-veo-deployment/master'
            }
        }
    }
}
