node{
    
    stage('Checkout') {
        git url: 'https://github.com/ozzann/client-server-app.git'
    }
    
    stage('Build server app') {
      sh "cd server-app; ./run_tests.sh"
    }
    
    stage('Build client app') {
      sh "cd client-app; ./run_tests.sh"
    }
    
    stage('Deploy') {
        sh "sshpass -p vagrant rsync -r client-app/ vagrant@192.168.56.110:/etc/puppet/files/client-app; sshpass -p vagrant rsync -r server-app/ vagrant@192.168.56.110:/etc/puppet/files/server-app; sshpass -p vagrant rsync puppet/manifests/site.pp vagrant@192.168.56.110:/etc/puppet/manifests; sshpass -p vagrant rsync -r puppet/modules/ vagrant@192.168.56.110:/etc/puppet; sshpass -p vagrant rsync docker-compose.yml vagrant@192.168.56.110:/etc/puppet/files"
    }
}
