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
          sh "sshpass -p vagrant rsync -re 'ssh -o StrictHostKeyChecking=no' client-app/ vagrant@192.168.56.110:/etc/puppet/files/client-app";
          sh "sshpass -p vagrant rsync -re 'ssh -o StrictHostKeyChecking=no'  server-app/ vagrant@192.168.56.110:/etc/puppet/files/server-app";
          sh "sshpass -p vagrant rsync -e 'ssh -o StrictHostKeyChecking=no' puppet/manifests/site.pp vagrant@192.168.56.110:/etc/puppet/manifests";
          sh "sshpass -p vagrant rsync -re 'ssh -o StrictHostKeyChecking=no'  puppet/modules/* vagrant@192.168.56.110:/etc/puppet/modules";
          sh "sshpass -p vagrant rsync -e 'ssh -o StrictHostKeyChecking=no' docker-compose.yml vagrant@192.168.56.110:/etc/puppet/files";
  }
}
