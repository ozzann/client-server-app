## The client-server application demonstrating wide stack of technologies for CI and CD

This repo contains two applications written in different languages and the pipeline for their deployment with different technologies like Docker, Jenkins, Puppet and Vagrant. The goal of this project is to demonstrate advantages of every of these tools. As an example, simple client-server application is considered.

## Provisioning

### Prerequisites

In order to be able to run the application you have to have [Vagrant](https://www.vagrantup.com/downloads.html) and [VirtualBox](https://www.virtualbox.org/wiki/Downloads) installed.

### Usage

The tool which allows you to have all the system including required virtual machines on your computer is Vagrant. So, to provision the system you have to clone the repo, then go to vagrant directory and run simple command 'vagrant up':

		cd vagrant
        vagrant up
        
As a result three virtual machines will be created: one **jenkins.vm** is for Jenkins, the second one **puppet.vm** is a Puppet master and the last one **production.vm** is a simplified analog of production virtual machine.

Then after all VMs had successfully set up, you have to build Jenkins **client-server-app** job and after that synchronize Puppet master and Puppet Client manually by running these commands:

- run puppet agent on **production.vm**:

		sudo puppet agent -t
        
- at **puppet.vm** to reassure there is a certificate for **production.vm**:

		sudo puppet cert list --all 
        
- sign all certificates at **puppet.vm** including just created certificate from **production.vm**:

		sudo puppet cert sign --all
        
- run agent to apply puppet manifests at **production.vm**:

		sudo puppet agent -t
        
        
After that one can check if application are running. In order to do this just go to **http://localhost:3000** on **production.vm**. The client app web-page is presented there, so you can check if the server's running at this page.



## Server application

### Overview

Server application is a Java application. It was created with very powerful [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) framework. Dropwizard contains many useful libraries. In this case the most important are libraries for REST API, HTTP server and JSON features. As a result they allow us to create a server listening on 8080 port where we can send some simple requests:

		GET /hello-world 
    	GET /hello-world?name=Anna

Both of them respond with JSON in this format:
		
    	{"id":24;"content":"Hello, Anna!"}
        
where **id** field is the number of request, the **content** is just greeting. By default when a name is not defined the server responds with this content: "Hello, world!".



### Dockerfile

The Dockerfile for the server app is quite simple. It's based on java-8 image. Then it just copies files of the app in a corresponding directory, exposes ports and runs the app with a single command. Here is a snippet demonstrating how it looks like put all together:

		FROM java:8

        COPY . /usr/src/server-app
        WORKDIR /usr/src/server-app

        EXPOSE 8080 8081

        CMD java -jar hello-world-1.0.0.jar server config.yml 



## Client application

### Overview

Client application is quite a simple one-page Node.js application. It listens to a port number 3000 and also implements REST API and provides a web-interface to ping the server.
Node.js provides many very useful frameworks and modules which significantly simplify the process of development. In this the following list of frameworks is used:

- **Express framework** makes the client listening to a 3000 port
- **Request module** simplifies HTTP requests. Here is just one GET request to the server.
- **Nock module** is a nice tool for testing HTTP requests. It allows us to mock some requests which we can't send directly while testing. For instance, it's not possible to send direct request to our server because it may not be available, so nock can mock this request with any desirable response, like so:

        nock("http://172.18.0.22:8080")
          .defaultReplyHeaders({
              'Content-Type': 'application/json'
            })
            .get('/hello-world')
            .reply(200, {
              "id": 1,
              "content": "Hello, world!"
            });
        
- **Supertest module** provides a high-level abstraction for testing HTTP
- **Chai** is a BDD/TDD assertion library
- **Mocha** is a JavaScript testing framework

Web-interface is build with Bootstrap framework.



### Dockerfile

Because it's a Node.js application, it requires using npm commands in its Dockerfile. Therefore the base image is node image. The application is running on 3000 port, that's why it's exposing in the Dockerfile. To run the application one has to perform **npm install** command and then **node client.js** command. So, here is all these instructions put together in the Dockerfile:

    	FROM node:4-onbuild

    	ADD . /usr/src/app
    	RUN npm install  

    	EXPOSE 3000

    	CMD ["node","client.js"] 



## Docker-compose as a glue

Docker itself is a powerful tool which allows to run any application in a container anywhere. Docker-compose is its extension which allows to run multi-container Docker applications. In addition for Dockerfiles for each application, there is docker-composer.yml file defining the configuration of applications' services.  

The tricky part in setting two containers working properly is to set up a network properly. There is [a good article](http://windsock.io/tag/docker-proxy/) explaining what is under hood of docker networking and how containers communicate with each other. Briefly, Docker creates a virtual ethernet bridge (called docker0), attaches each container's network interface to the bridge, and uses network address translation (NAT) to reach containers outside. Assuming that while creating containers from this project, it can be assigne with random IP addresses, it may be impossible for the client to ping the server. So, it was decided to assign the server with static specific IP address **172.18.0.22app_net** and put two these containers into one network. The configuration of the network is described in docker-compose file as followingcreated:

    networks:
        app_net:
            ipam:
                config:
                -  subnet: "172.18.0.0/16"

Then the choosen IP addres is assigned for the server:

    server:
          ...
          networks:
            app_net:
              ipv4_address: 172.18.0.22
              
As a result the server can be reachable from outside as **localhost:9080** or **localhost:9081** to get its metrics. But the client container can communicate it only by **172.18.0.22:8080**.




## Jenkins builds

Jenkins is a powerful tool for Continuous Integration. It allows you run tests almost immediately after commiting changes. Moreover, Jenkins has just a huge set of different plugins for any purpose.

In this case Jenkins is bound to GitHub repository by using just one plugin called **GitHub Plugin**.

There are two ways to detect commits and then run builds: polling SCM or set GitHub webhook so after every commit Jenkins build could run immediately. In our case polling SCM is chosen, it's scheduled to poll the GitHub repo every 5 minutes:

		H/5 * * * *
        
### Pipeline

While standard Jenkins "freestyle" jobs support simple continuous integration by allowing you to define sequential tasks in an application lifecycle, they do not create a record of execution that persists through any planned or unplanned restarts, enable one script to address all the steps in a complex workflow, or confer the other advantages of pipelines.

In contrast to freestyle jobs, pipelines enable you to define the whole application lifecycle. Pipeline functionality helps Jenkins to support continuous delivery (CD). The Pipeline plugin was built with requirements for a flexible, extensible, and script-based CD workflow capability in mind.

The plugin which Jenkins instance has to have in order to build pipelins is [Pipeline plugin](https://wiki.jenkins-ci.org/display/JENKINS/Pipeline+Plugin).

Pipelines are built with simple text scripts that use a Pipeline DSL (domain-specific language) based on the Groovy programming language. !!!!! To be implemented.... Some words about stages......

There are few ways of creating Jenkins pipelines. In this example I'm using the one where a script entered in the configuration page of the web interface for your Jenkins instance. This script is a quite simple. It defines few logical stages:

- **Checkout**
At this step all source code is retrieving from GitHub repository:

		  git url: 'https://github.com/ozzann/client-server-app.git'

- **Build the server application**

At this stage Jenkins just executes bash script which contains all required instructions and actions for running tests.

- **Build the client application**

	At this stage Jenkins just executes bash script which contains all required instructions and actions for running tests.

	For the previous two stages script to run tests **run_tests.sh** has similar structure. In both cases firstly all existing docker containers are removing and then the new one is created. The Dockerfiles for tests are almost the same as Dockerfiles for the apps, the only difference in a running command: it should run only tests steps.

	In the case of the client application it's:

		CMD ["npm","test"]
        
	In the case of the server app it's:

		CMD mvn test
        
        
- **Deployment stage**

	The last stage is responsible for deployment to the Puppet Master virtual machine. It does so by this command:

        sh "sshpass -p vagrant rsync -r client-app/ vagrant@puppet.vm:/etc/puppet/files/client-app; 
        sshpass -p vagrant rsync -r server-app/ vagrant@puppet.vm:/etc/puppet/files/server-app; 	 	   sshpass -p vagrant rsync puppet/manifests/site.pp vagrant@puppet.vm:/etc/puppet/manifests; 
        sshpass -p vagrant rsync -r puppet/modules/ vagrant@puppet.vm:/etc/puppet; 
        sshpass -p vagrant rsync docker-compose.yml vagrant@puppet.vm:/etc/puppet/files"

	This set of bash commands copies all required files to puppet master. In order to store app's file and then send them to the production, Puppet master has a static mount point **/etc/puppet/files**. Firstly, it copies applications' files to the special puppet directory **/etc/puppet/files**. Then it copies puppet manifests which allow it to manage production VM. And finally, it sends docker-compose configuration file to the puppet master.

![](https://rawgit.com/ozzann/client-server-app/master/images/pipeline.png)


## Puppet management

With Puppet, you can define the state of an IT infrastructure, and Puppet automatically enforces the desired state. Puppet automates every step of the software delivery process, from provisioning of physical and virtual machines to orchestration and reporting; from early-stage code development through testing, production release and updates.

In this case Puppet installs docker to the production, then it copies the application's source code inluding Dockerfile to the production and after that it runs a deployment script.

In order to store all apps' files and then send them to the production, Puppet master has a static mount point **/etc/puppet/files**. Creation of this point is managed by **/etc/puppet/fileserver.conf** configuration file. Files for client and server apps are sent to **client-app** and server-app directpries correspondongly by using rsync command in Jenkins pipeline.

Besdies copying files, Puppet Master has to run both of the applications using docker-compose. The docker-compose typr to run Compose is already included in the docker module and we have to make sure the docker-compose utility is installed:

	class {'docker::compose':
      ensure => present,
    }

And then only define a docker_compose resource pointing at the Compose file:

    docker_compose {'/home/vagrant/docker-compose.yml':
      ensure => present,
    }



## Vagrant

Firstly Vagrant creates three virtual machines. The information about machines' names, IPs and provisioning scripts is stored in JSON file nodes.json.

All of them are based on Ubuntu 14.04 Desktop and have descriptive names. Also, each of them is assigned with specific IP address, because they need to communicate between each other. This is obviously not enought to build VMs required fot the pipeline, so Vagrant allows us to install any packages and configure a system by using provisioners. Each of the machines has a different configuration: Jenkins VM has significant differences, whilst puppet VMs just slightly differ from each other.

- **puppet.vm** has IP address 192.168.56.110 

The provisioning script bootstrap-puppet-master.sh installs puppetmaster to this machine. Beside that it also configures **/etc/hosts** file by adding information about puppet master and puppet agent hosts. Also, some puppet modules, such as ntp, docker and vcsrepo, are installed.

Because puppet master sends application's files to puppet agent, a static mount point **/etc/puppet/files** is configured. It is managed in another puppet config file **/etc/puppet/fileserver.conf**.

In order not to hardcode Puppet Master's and Puppet Agent's IPs, the description of the Puppet Master in nodes.json contains a reference to Puppet Agent.

- **production.vm** has IP address 192.168.56.111

The provisioning script **bootstrap-production.sh** for Production VM performs three tasks. Firstly, it installs puppet agent. Then it configures **/etc/hosts** file by adding information about Puppet Master host. Also it makes puppet config **/etc/puppet/puppet.conf** aware of the Puppet Master by adding server and certname parameters. After that **/etc/puppet/puppet.conf** should contain:

	server=puppet.vm
	certname=production.vm
    
In order not to hardcode Puppet Master's and Puppet Agent's IPs, the description of the Production puppet node in **nodes.json** contains a reference to Puppet Master.

- **jenkins.vm** has IP address 192.168.56.112

Jenkins VM uses not only shell, but also docker and file provisioning. Vagrant automatically installs Docker and pulls required docker java-8 and node images:

	nodeconfig.vm.provision "docker", images: ["java:8", "node"]
    

Jenkins VM has **bootstrap-jenkins.sh** provisioning script. Firstly, this script installs git. Second step is to install Jenkins. The script uses files from shared folder, particularly Jenkins global config file, config files for each of the jobs and the file containing list of all required plugins and its dependencies. In order to create all jobs and install all neccessray plugins, Jenkins command line tool **jenkins-cli.jar** is used, like this:

	sudo java -jar jenkins-cli.jar -s http://localhost:8080/ create-job client-server-app < client-server-app.config.xml
    
    
 But before creating Jenkins jobs, file jenkins-cli.jar should be preliminary downloaded from http://localhost:8080
 
 	sudo wget http://localhost:8080/jnlpJars/jenkins-cli.jar
    
 Also essntail Jenkins plugins should be installed. In this case we're using only two of them (but not forget about dependencies): **Git Plugin** and **Pipeline Plugin**. For this purpose I'm using very useful [script of github user micw](https://gist.github.com/micw/e80d739c6099078ce0f3).
 At the very last stage sshpass is installed. It's required by pipeline Jenkinfile to send all neccessary file to Puppet Master VM:
 
 		sudo apt-get -yq update
		sudo apt-get install -yq sshpass
