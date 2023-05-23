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
                    projectVersion = sh(returnStdout: true, script: '''jq -r .version package.json''').trim()
                }
                sh 'mkdir -p $WORKSPACE/out'
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
                script {
                    def outputDir = "$WORKSPACE/out/test"
                    sh "mkdir -p $outputDir"
                    try {
                        sh 'cd /usr/src/app && npm run test'
                    } finally {
                        dir (outputDir){
                            sh "cp /usr/src/app/junit.xml ."
                            junit 'junit.xml'
                            sh script: "cp /root/.npm/_logs/* .", returnStatus: true
                            archiveArtifacts artifacts: '*.log', allowEmptyArchive: true
                        }
                        sh "rm -fr $outputDir"
                    }
                }
            }
        }
        stage('Docker images') {
            agent {
                 label 'docker-image-builder'
            }
            steps {
                script {
                    timeout(time: 10, unit: 'MINUTES') {
                        def nodeEnv = env.GIT_BRANCH == 'develop' ? 'development' : 'production'
                        def isMasterBranch = env.GIT_BRANCH == 'master'
                        lock ('Build veo-web Docker images') {
                            if (isMasterBranch){
                                // we build two images from the master branch, one for staging and one for prod
                                def dockerImageProd = docker.build("eu.gcr.io/veo-projekt/veo-web:git-${env.GIT_COMMIT}",
                                   "--build-arg CI_COMMIT_SHORT_SHA='${env.GIT_COMMIT[0..6]}' \
                                    --build-arg CI_JOB_ID='${env.BUILD_NUMBER}' \
                                    --build-arg CI_COMMIT_TIMESTAMP='${new Date().time}' \
                                    --build-arg NODE_ENV=${nodeEnv} \
                                    --build-arg VEO_DEFAULT_API_URL='${env.API_URL_VEO_PROD}' \
                                    --build-arg VEO_FORMS_API_URL='${env.API_URL_VEO_FORMS_PROD}' \
                                    --build-arg VEO_HISTORY_API_URL='${env.API_URL_VEO_HISTORY_PROD}' \
                                    --build-arg VEO_REPORTING_API_URL='${env.API_URL_VEO_REPORTING_PROD}' \
                                    --build-arg VEO_ACCOUNTS_API_URL='${env.API_URL_VEO_ACCOUNTS_PROD}' \
                                    --build-arg VEO_OIDC_URL='${env.OIDC_URL_PROD}' \
                                    --build-arg VEO_OIDC_REALM='${env.OIDC_REALM_PROD}' \
                                    --build-arg VEO_OIDC_CLIENT='${env.OIDC_CLIENT_PROD}' \
                                    --label org.opencontainers.image.version='$projectVersion' \
                                    --label org.opencontainers.image.revision='${env.GIT_COMMIT}' \
                                    .")
                                withDockerRegistry(credentialsId: 'gcr:verinice-projekt@gcr', url: 'https://eu.gcr.io') {
                                    dockerImageProd.push("git-${env.GIT_COMMIT}")
                                    dockerImageProd.push("git-${env.GIT_COMMIT}-prod")
                                    dockerImageProd.push("latest-prod")
                                    dockerImageProd.push("${projectVersion}-prod")
                                    dockerImageProd.push("build-${env.BUILD_NUMBER}-prod")
                                }
                            } else {
                                def dockerImage = docker.build("eu.gcr.io/veo-projekt/veo-web:git-${env.GIT_COMMIT}",
                                   "--build-arg CI_COMMIT_SHORT_SHA='${env.GIT_COMMIT[0..6]}' \
                                    --build-arg CI_JOB_ID='${env.BUILD_NUMBER}' \
                                    --build-arg CI_COMMIT_TIMESTAMP='${new Date().time}' \
                                    --build-arg NODE_ENV=${nodeEnv} \
                                    --build-arg VEO_DEFAULT_API_URL='${env.API_URL_VEO_DEV}' \
                                    --build-arg VEO_FORMS_API_URL='${env.API_URL_VEO_FORMS_DEV}' \
                                    --build-arg VEO_HISTORY_API_URL='${env.API_URL_VEO_HISTORY_DEV}' \
                                    --build-arg VEO_REPORTING_API_URL='${env.API_URL_VEO_REPORTING_DEV}' \
                                    --build-arg VEO_ACCOUNTS_API_URL='${env.API_URL_VEO_ACCOUNTS_DEV}' \
                                    --build-arg VEO_OIDC_URL='${env.OIDC_URL_DEV}' \
                                    --build-arg VEO_OIDC_REALM='${env.OIDC_REALM_DEV}' \
                                    --build-arg VEO_OIDC_CLIENT='${env.OIDC_CLIENT_DEV}' \
                                    --build-arg VEO_DEBUG=true \
                                    --label org.opencontainers.image.version='$projectVersion' \
                                    --label org.opencontainers.image.revision='${env.GIT_COMMIT}' \
                                    .")
                                withDockerRegistry(credentialsId: 'gcr:verinice-projekt@gcr', url: 'https://eu.gcr.io') {
                                    dockerImage.push("git-${env.GIT_COMMIT}")
                                    dockerImage.push("develop")
                                }
                            }
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
                build job: 'verinice-veo-deployment/master'
            }
        }
    }
    post {
        always {
            node('') {
                dir ('out'){
                    deleteDir()
                }
            }
        }
        unsuccessful {
            node('') {
                script {
                  def buildLog = sh(script: "wget -q -O- ${BUILD_URL}/consoleText", returnStdout: true)
                  def lastLines = buildLog.readLines().takeRight(50).join('\n')
                  rocketSend channel: '#hack', message: "A veo front-end build failed", attachments: [
                    [ title: 'Build log excerpt', collapsed: true, text: "...\n${lastLines}" ]
                  ]
                }
            }
        }
    }
}
