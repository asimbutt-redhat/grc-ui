pipeline {
    agent {
        docker {
            image 'quay.io/rhn_support_abutt/centos8-nodejs12'
            args '--network host -u 0:0 -p 3000:3000'
        }
    }
    parameters {
        string(name:'OC_IDP', defaultValue: 'kube:admin', description: 'Identity Provider')
        string(name:'OC_CLUSTER_USER', defaultValue: 'kubeadmin', description: 'OCP Hub User Name')
        string(name:'OC_HUB_CLUSTER_PASS', defaultValue: '', description: 'OCP Hub Password')
        string(name:'OC_HUB_CLUSTER_API_URL', defaultValue: 'https://api.apps.abutt-mycluster01.dev09.red-chesterfield.com:6443', description: 'OCP Hub API URL')
        string(name:'BASE_URL', defaultValue: 'https://multicloud-console.apps.abutt-mycluster01.dev09.red-chesterfield.com', description: 'ACM Console Password')
    }
    environment {
        CI = 'true'
    }
    stages {
        stage('Build') {
            steps {                
                sh '''       
                npm config set unsafe-perm true                    
                npm install
                npm ci
                npx browserslist@latest --update-db
                '''
            }
        }
        stage('Test') {
            steps {
                sh """
                export CYPRESS_OC_IDP="${params.OC_IDP}"
                export CYPRESS_OC_CLUSTER_USER="${params.OC_CLUSTER_USER}"
                export CYPRESS_OC_HUB_CLUSTER_PASS="${params.OC_HUB_CLUSTER_PASS}"
                export CYPRESS_OC_HUB_CLUSTER_URL="${params.OC_HUB_CLUSTER_API_URL}"
                export CYPRESS_BASE_URL="${params.BASE_URL}"
                export CYPRESS_OPTIONS_HUB_USER="${params.OC_CLUSTER_USER}"
                export CYPRESS_OPTIONS_HUB_PASSWORD="${params.OC_HUB_CLUSTER_PASS}"
                if [[ -z "${CYPRESS_OC_CLUSTER_USER}" || -z "${CYPRESS_OC_HUB_CLUSTER_PASS}" || -z "${CYPRESS_OC_HUB_CLUSTER_URL}" ]]; then
                    echo "Aborting test.. OCP/ACM connection details are required for the test execution"
                    exit 1
                else
                    rm -rf test-output/cypress
                    ./setup-script.sh
                    npx cypress run --headless --spec tests/cypress/tests/RolePolicy_governance.spec.js || echo "Continuing with next test"
                    npx cypress run --headless --spec tests/cypress/tests/Namespace_governance.spec.js 
                fi
                """
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'test-output/*', followSymlinks: false
            junit 'test-output/*.xml'
        }
    }
}