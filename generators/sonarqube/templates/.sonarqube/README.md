## SonarQube

SonarQube is a static analysis tool which assists with improving and maintaining code quality. For this tool to work, you will need the SonarQube server, as well as an agent that runs the sonar-scanner (this can be local or in Jenkins).

### SonarQube Server Setup

To deploy a SonarQube server instance to our tools project we simply leverage the prebuilt server image provided by the BCDevOps organization found on the [BCDevOps SonarQube repository](https://github.com/BCDevOps/sonarqube).

This assumes that you have run the BCDK sonarqube generator in your tools namespace, let the pods completely spin up and you should have a default server running at `https://sonarqube-<$tools>.pathfinder.gov.bc.ca`. Once the pods have completed startup, you can set the admin password.

#### Admin Password

The SonarQube server instance is created with standard insecure credentials (User: `admin`, PW:). This should be reset to something stronger and stored in an OpenShift secret so authorized developers can find it.

Included in this sonarqube setup is a (Unix) shell script (updatesqadminpw.sh) to set a stronger password.

*You will need to be logged in to the tools namespace with admin credentials - same as when you setup sonarqube).*  

Simply run the following script and follow its instructions. Make sure you save the new password in an OpenShift secret or equivalent!  Ensure that the SonarQube app is fully deployed and operational before running this script.

```sh
chmod +x updatesqadminpw.sh && ./updatesqadminpw.sh
```

Go to `https://sonarqube-<$tools>.pathfinder.gov.bc.ca` and log in as `admin` with the new password (it is stored in sonarqube-admin-password secret).

### Add SonarQube to Pipeline

The following illustrates a simple way to add SonarQube test to your pipeline.  This assumes that you are using the properly configured slaves (includes SonarQube scanner and Node), and you are testing a node application properly configured to create coverage files.  

You will have to get your proper tools namespace into the script and confirm that your SonarQube URL.    

```sh
// Stash Names
def COVERAGE_STASH = 'test-coverage'

pipeline {
    agent none
    options {
        disableResume()
    }
    stages {
        stage('Build') {
            agent { label 'build' }
            steps {
                script {
                    def filesInThisCommitAsString = sh(script:"git diff --name-only HEAD~1..HEAD | grep -v '^.jenkins/' || echo -n ''", returnStatus: false, returnStdout: true).trim()
                    def hasChangesInPath = (filesInThisCommitAsString.length() > 0)
                    echo "${filesInThisCommitAsString}"
                    if (!currentBuild.rawBuild.getCauses()[0].toString().contains('UserIdCause') && !hasChangesInPath){
                        currentBuild.rawBuild.delete()
                        error("No changes detected in the path ('^.jenkins/')")
                    }
                }
                echo "Aborting all running jobs ..."
                script {
                    abortAllPreviousBuildInProgress(currentBuild)
                }
                echo "Building ..."
                sh "cd .pipeline && ./npmw ci && ./npmw run build -- --pr=${CHANGE_ID}"
            }
        }
        stage('SonarQube (Unit Test)') {
          agent any
          steps {
            script {
              dir('app/frontend') {
                try {
                  timeout(10) {
                    echo 'Installing NPM Dependencies...'
                    sh 'npm ci'

                    echo "Testing app/frontend..."
                    sh 'npm run test:unit'
                  }
                } catch (e) {
                  echo "testing app/frontend failed"
                  throw e
                }
              }
            }
          }
          post {
            success {
              stash name: COVERAGE_STASH, includes: 'app/frontend/coverage/**'

              echo 'All Tests passed'
            }
            failure {
              echo 'Some Tests failed'
            }
          }
        }

        stage('SonarQube (Publish)') {
          agent any
          steps {
            script {
              openshift.withCluster() {
                openshift.withProject('wfezkf-tools') {

                  unstash COVERAGE_STASH

                  echo 'Performing SonarQube static code analysis...'
                  sh """
                  sonar-scanner \
                    -Dsonar.host.url='http://sonarqube:9000' \
                    -Dsonar.projectKey='dgrsc-${CHANGE_ID}' \
                    -Dsonar.projectName='Document Generation Showcase (${CHANGE_ID.toUpperCase()})'
                  """
                }
              }
            }
          }
        }

        stage('Deploy (DEV)') {
            agent { label 'deploy' }
            steps {
                echo "Deploying ..."
                sh "cd .pipeline && ./npmw ci && ./npmw run deploy -- --pr=${CHANGE_ID} --env=dev"
            }
        }

        stage('Deploy (TEST)') {
            agent { label 'deploy' }
            when {
                expression { return env.CHANGE_TARGET == 'master';}
                beforeInput true
            }
            input {
                message "Should we continue with deployment to TEST?"
                ok "Yes!"
            }
            steps {
                echo "Deploying ..."
                sh "cd .pipeline && ./npmw ci && ./npmw run deploy -- --pr=${CHANGE_ID} --env=test"
            }
        }

        stage('Deploy (PROD)') {
            agent { label 'deploy' }
            when {
                expression { return env.CHANGE_TARGET == 'master';}
                beforeInput true
            }
            input {
                message "Should we continue with deployment to PROD?"
                ok "Yes!"
            }
            steps {
                echo "Deploying ..."
                sh "cd .pipeline && ./npmw ci && ./npmw run deploy -- --pr=${CHANGE_ID} --env=prod"
            }
        }
    }
}
```
