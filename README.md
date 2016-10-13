## The pipeline for deployment of RESTful web-service and React web client app

This repo contains client-server application and the pipeline for its deployment with different technologies like Docker, Jenkins, Puppet and Vagrant. Both client and server apps are RESTful web services. The client is a Node.js React application and it provides a web-interface. The server is a Java application, it's built with using Dropwizard framework. Also for both client and server there are automated functional tests.
The goal of this project is to build a pipeline from the GitHub repository through a Jenkins build to deploy an application running in a Docker container, with a redeployment every time a change is checked in that builds and tests correctly. 
Since the project is presented as simplified version of a deployment cycle, there are only three virtual machines. One of them runs Jenkins, the other one is supposed to be a Production system. Because it's managed by puppet, there is also a virtual machine for Puppet Master.


## Prerequisites

In order to be able to run the application you have to have [Vagrant](https://www.vagrantup.com/downloads.html) and [VirtualBox](https://www.virtualbox.org/wiki/Downloads) installed.

## Usage

The tool which allows you to have all required virtual machines on your computer is Vagrant. So, to provision the system you have to clone the repo, then go to the vagrant directory and run simple command 'vagrant up':

		cd vagrant
        vagrant up
        
As a result three virtual machines will be created: one **jenkins.vm** is for Jenkins, the second one **puppet.vm** is a Puppet master and the last one **production.vm** is a simplified version of a production system.

Then after all VMs had successfully set up, you have to run Jenkins **client-server-app** job and after that synchronize Puppet master and Puppet Client manually by running these commands:

- run puppet agent on **production.vm** VM:

		sudo puppet agent -t
        
- at **puppet.vm** VM reassure there is a certificate for **production.vm** VM:

		sudo puppet cert list --all 
        
- sign all certificates at **puppet.vm** VM including just created certificate from **production.vm** VM:

		sudo puppet cert sign --all
        
- run puppet agent to apply puppet manifests at **production.vm** VM:

		sudo puppet agent -t
        
        
After that one can check if application are running. In order to do this just go to **http://localhost:3000** on **production.vm** VM. The client app web-page is presented there, so you can check if the server is running at this page.
Since both of the application are web-services, one can check their availability by sending requests:

- check the client app is running

		GET http://localhost:3000/hello
        GET http://localhost:3000/hello/your-name
        
- check the server app is running

		GET http://loclahost:9080/hello-world
        GET http://localhost:9080/hello-world?name=your-name
        
	Moreover, at the special port 9081 one can watch server app's Metrics.


## Server RESTful web-service

### Overview

The RESTful web service was built with using very powerful [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) framework. Dropwizard contains many useful libraries. Among the variety of these libraries we are using the following:

- **Jetty** for HTTP

There is no web-application without HTTP, so Dropwizard kindly provides Jetty HTTP library to embed HTTP server into the project.

- **Jersey** for REST

Developing RESTful Web services is not an easy task. In order to simplify it Java API for RESTful Services (JAX-RS) has been designed. Jersy is a toolkit which provides support for JAX-RS API and extends it with additional features and utilities.

- **Jackson** for JSON

It is a multi-purpose Java library for processing JSON data format. As everything in Dropwizard it aims to be the best possible combination of fast, correct, lightweight, and ergonomic for developers.


As a result they allow us to create a web application listening on 8080 port where we can send some simple requests:

		GET /hello-world 
    	GET /hello-world?name=Harry

Both of them respond with a string in JSON format:
		
    	{"id":24;"content":"Hello, Harry!"}
        
where **id** field is the number of request, the **content** is just greeting message. By default when a name is not defined the server responds with the content: "Hello, world!".

[Dropwizard](http://www.dropwizard.io/1.0.2/docs/) also provides some handy classes for testing both representation and resource classes as well as JUnit for the integration testing. 


### Dockerfile

The Dockerfile for the web-service is quite simple. It's based on java-8 image. Then it just copies files of the app in a corresponding directory, exposes ports and runs the app with a single command. Here is a snippet demonstrating how it looks like put all together:

		FROM java:8

        COPY . /usr/src/server-app
        WORKDIR /usr/src/server-app

        EXPOSE 8080 8081

        CMD java -jar hello-world-1.0.0.jar server config.yml 

Because the web-service uses 8080 and 8081 ports, they should be exposed in the Dockerfile.


## Client RESTful web-service

### Overview

The client application is quite a simple one-page Node.js React application. It listens to a port number 3000 and also implements REST API and provides a web-interface to access to the web-service.
Node.js provides many very useful frameworks and modules which significantly simplify the process of development. In this the following list of frameworks is used:

- **React** and **ReactDOM** are necessary libraries for any React application. The main idea of React approach is to divide an application into as many as possible logically distinctive components. Taken into account this application is divided into following components:
	
    - InputForm components is responsible for swhoing header and the name input field. It stores the input value in its state in order to receive it to next components. Also it is able to check the validity of input name ( it can not containe special symbols &/\ and spaces) and stores this value in its state as well. The flag of name value's validity then is used by next component in order to show error message.
    
    
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

The web-interface is build with Bootstrap framework which makes the web-site responsive and beautiful on any device. But since it's a React application, the special library **react-bootstrap** is used.


### Dockerfile

Because it's a Node.js application, the base image is a node image. The application is running on 3000 port, that's why it's exposed in the Dockerfile. Its **package.json** file contains three scripts: **test** is for running tests, **build** is for bundling the whole application by **webpack** and **start** is finally for start the application. That's why to run the application one has to perform **npm install** command and **npm run build**, and then **node client.js** command. So, here is all these instructions put together in the Dockerfile:

    	FROM node:4-onbuild

    	ADD . /usr/src/app
    	RUN npm install  

    	EXPOSE 3000
        
        RUN npm install
        RUN npm run build
        
    	CMD npm start



## Docker-compose as a glue

Docker itself is a powerful tool which allows us to run any application in a container anywhere. Docker-compose is its extension which does the same work but for multi-container Docker applications. In addition to Dockerfiles for each application, there is docker-composer.yml file defining the configuration of applications' services.  

The tricky part in setting two containers work properly is to set up a network. There is [a good article](http://windsock.io/tag/docker-proxy/) explaining what is under the hood of docker networking and how containers communicate with each other. Briefly, Docker creates a virtual ethernet bridge **docker0**, attaches each container's network interface to the bridge, and uses network address translation (NAT) to reach containers outside.
If the web service doesn't have a static IP, every time it can be assigned to different IP addreses. But it's not appropriate for the client because it has to know the exact web service's IP to ping it. So, it was decided to assign the web service with static IP address **172.18.0.22** and put two these containers into one network **app_net**. The configuration of the network is described in docker-compose file as following:

    networks:
        app_net:
            ipam:
                config:
                -  subnet: "172.18.0.0/16"

Then the choosen IP addres is assigned for the web service:

    server:
          ...
          networks:
            app_net:
              ipv4_address: 172.18.0.22
              
As a result the server can be reachable from outside as **localhost:9080** or **localhost:9081** to get its metrics. But the client container can communicate to it only by **172.18.0.22:9080**.



## Jenkins builds

Jenkins is a powerful tool for Continuous Integration. It allows you to run tests almost immediately after commits. Moreover, Jenkins has just a huge set of different plugins for any purpose.

In this case Jenkins is bound to GitHub repository by using a plugin called **GitHub Plugin**.

There are two ways to detect commits and then run builds: polling SCM or set GitHub webhook so after every commit Jenkins build could run immediately. In our case polling SCM is chosen, it's scheduled to poll the GitHub repo every 5 minutes:

		H/5 * * * *
        
### Pipeline

While standard Jenkins "freestyle" jobs support simple continuous integration by allowing you to define sequential tasks in an application lifecycle, they do not create a record of execution that persists through any planned or unplanned restarts, enable one script to address all the steps in a complex workflow, or confer the other advantages of pipelines.

In contrast to freestyle jobs, pipelines enable you to define the whole application lifecycle. So, in this project such pipeline is used. The plugin which Jenkins instance has to have in order to build pipelins is [Pipeline plugin](https://wiki.jenkins-ci.org/display/JENKINS/Pipeline+Plugin).

Pipelines are built with simple text scripts that use a Pipeline DSL (domain-specific language) based on the Groovy programming language. In a script one can defined few stages and some instructions for each of them. There are logical stages used for the project:

- **Checkout**

	At this step all source code is retrieving from GitHub repository:

		  git url: 'https://github.com/ozzann/client-server-app.git'

- **Build the server application**

	At this stage Jenkins just executes bash script which contains all required instructions and actions for running tests.

- **Build the client application**

	At this stage Jenkins just executes bash script which contains all required instructions and actions for running tests.

For the previous two stages both of the scripts **run_tests.sh** for client and web-service apps have the similar structures. In both cases firstly all existing docker containers are removing and then the new one is created. The Dockerfiles for tests are almost the same as Dockerfiles for the apps, the only difference in a running command: it should run only tests steps.

In the case of the client application it's:

		CMD npm test
        
For the server app it should be:

		CMD mvn test
        
        
- **Deployment stage**

	The last stage is responsible for deployment to the Puppet Master VM IP **192.168.56.110**. It does so by these commands:
	
          sh "sshpass -p vagrant rsync -re 'ssh -o StrictHostKeyChecking=no' client-app/ vagrant@192.168.56.110:/etc/puppet/files/client-app";
          sh "sshpass -p vagrant rsync -re 'ssh -o StrictHostKeyChecking=no'  server-app/ vagrant@192.168.56.110:/etc/puppet/files/server-app";
          sh "sshpass -p vagrant rsync -e 'ssh -o StrictHostKeyChecking=no' puppet/manifests/site.pp vagrant@192.168.56.110:/etc/puppet/manifests";
          sh "sshpass -p vagrant rsync -re 'ssh -o StrictHostKeyChecking=no'  puppet/modules/* vagrant@192.168.56.110:/etc/puppet/modules";
          sh "sshpass -p vagrant rsync -e 'ssh -o StrictHostKeyChecking=no' docker-compose.yml vagrant@192.168.56.110:/etc/puppet/files";

	This set of bash commands copies all required files to puppet master. In order to store app's files and then send them to the production, Puppet master has a static mount point **/etc/puppet/files**. Then puppet manifests which allow it to manage production VM are send to the puppet master. And finally, docker-compose configuration file is send to the puppet master.
    
This script is also stored at the github repository as **Jenkinsfile**.
    
One of the main advantages of Jenkins' pipelines is a descriptive graphical representaion:

![](https://cdn.rawgit.com/ozzann/client-server-app/master/pipeline.png)


## Puppet management

With Puppet, you can define the state of an IT infrastructure, and Puppet automatically enforces the desired state. Puppet automates every step of the software delivery process, from provisioning of physical and virtual machines to orchestration and reporting; from early-stage code development through testing, production release and updates.

In this case Puppet installs docker to the production, then it copies the application's source code inluding Dockerfile to the production, then removes old irrelevant docker images  **vagrant_client** and **vagrant_server** (their names are assigned automatically by docker compose) and eventually runs docker compose.

In order to store all apps' files and then send them to the production, Puppet master has a static mount point **/etc/puppet/files**. Creation of this point is managed by **/etc/puppet/fileserver.conf** configuration file. Files for the client and web-service apps are sent to **client-app** and **server-app** directories correspondingly by using rsync command in Jenkins pipeline.

Besdies copying files, Puppet Master has to run both of the applications using docker-compose. The docker-compose type to run Compose is already included in the docker module and we have to make sure the docker-compose utility is installed:

	class {'docker::compose':
      ensure => present,
    }

And then only define a docker_compose resource pointing at the Compose file:

    docker_compose {'/home/vagrant/docker-compose.yml':
      ensure => present,
    }



## Vagrant

Firstly Vagrant creates three virtual machines. The information about machines' names, IPs and provisioning scripts is stored in JSON file **nodes.json**.

All of them are based on Ubuntu 14.04 Desktop OS and have descriptive names. Also, each of them is assigned with specific IP address, because they need to communicate between each other. This is obviously not enought to build VMs required fot the pipeline, so Vagrant allows us to install any packages and configure a system by using provisioners. Each of the machines has a different configuration: Jenkins VM has significant differences, whilst puppet and production VMs just slightly differ from each other.

- **puppet.vm** has IP address 192.168.56.110 

The provisioning script **bootstrap-puppet-master.sh** installs puppetmaster to this machine. Besides that it also configures **/etc/hosts** file by adding information about puppet master and puppet agent hosts. Also, some puppet modules, such as ntp, docker and vcsrepo, are installed.

Because puppet master sends application's files to puppet agent, a static mount point **/etc/puppet/files** is configured. It is managed in another puppet config file **/etc/puppet/fileserver.conf**.

In order not to hardcode Puppet Master's and Puppet Agent's IPs, the description of the Puppet Master in **nodes.json** contains a reference to Puppet Agent.

- **production.vm** has IP address 192.168.56.111

The provisioning script **bootstrap-production.sh** for Production VM performs three tasks. Firstly, it installs puppet agent. Then it configures **/etc/hosts** file by adding information about Puppet Master host. Also it makes puppet config **/etc/puppet/puppet.conf** aware of the Puppet Master by adding server and certname parameters. After that **/etc/puppet/puppet.conf** should contain:

	server=puppet.vm
	certname=production.vm
    
In order not to hardcode Puppet Master's and Puppet Agent's IPs, the description of the Production puppet node in **nodes.json** contains a reference to Puppet Master.

- **jenkins.vm** has IP address 192.168.56.112

Jenkins VM uses not only shell, but also docker and file provisioning. Vagrant automatically installs Docker and pulls required docker java-8 and node images:

	nodeconfig.vm.provision "docker", images: ["java:8", "node"]

Jenkins VM has **bootstrap-jenkins.sh** provisioning script. Firstly, this script installs git. Second step is to install Jenkins. The script uses files from shared folder, particularly Jenkins global config file, configuration xml file for the **client-server-app** job and the file containing list of all required plugins and its dependencies. In order to create all jobs and install all neccessray plugins, Jenkins command line tool **jenkins-cli.jar** is used, like this:

	sudo java -jar jenkins-cli.jar -s http://localhost:8080/ create-job client-server-app < client-server-app.config.xml
    
    
 But before creating Jenkins jobs, file jenkins-cli.jar should be preliminary downloaded from http://localhost:8080
 
 	sudo wget http://localhost:8080/jnlpJars/jenkins-cli.jar
    
 Also essntail Jenkins plugins should be installed. In this case we're using only two of them (but not forget about dependencies): **Git Plugin** and **Pipeline Plugin**. For this purpose I'm using very useful [script of github user micw](https://gist.github.com/micw/e80d739c6099078ce0f3).
 At the very last stage sshpass is installed. It's required by pipeline Jenkinfile to send all neccessary file to Puppet Master VM:
 
 		sudo apt-get -yq update
		sudo apt-get install -yq sshpass
