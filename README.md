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

Client application is quite a simple one-page Node.js application. It just simply pings a server on demand and shows a ping log. The web-interface is written with Bootstrap framework.

### Dockerfile

Because it's a Node.js application, it requires using npm commands in its Dockerfile. Therefore the base image is node image. The application is running on 3000 port, that's why it's exposing in the Dockerfile. To run the application one has to perform **npm install** command and then **node client.js** command. So, here is all these instructions put together in the Dockerfile:

    	FROM node:4-onbuild

    	ADD . /usr/src/app
    	RUN npm install  

    	EXPOSE 3000

    	CMD ["node","client.js"] 



## Docker-compose as a glue

Docker itself is a powerful tool which allows to run any application in a container anywhere. Docker-compose is its extension which allows to run multi-container Docker applications. In addition for Dockerfiles for each application, there is docker-composer.yml file defining the configuration of applications' services.  

Network issues to be implemented ....

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
        
        
- **Deploy stage**
The last stage is responsible for deployment to the Puppet Master virtual machine. It does so by this command:

	sh "sshpass -p vagrant rsync -r client-app/ vagrant@puppet.vm:/etc/puppet/files/client-app; 
    sshpass -p vagrant rsync -r server-app/ vagrant@puppet.vm:/etc/puppet/files/server-app; 	 	 sshpass -p vagrant rsync puppet/manifests/site.pp vagrant@puppet.vm:/etc/puppet/manifests; 
    sshpass -p vagrant rsync -r puppet/modules/ vagrant@puppet.vm:/etc/puppet; 
    sshpass -p vagrant rsync docker-compose.yml vagrant@puppet.vm:/etc/puppet/files"

This set of bash commands copy all required files to puppet master. Firstly, it copies applications' files to the special puppet directory **/etc/puppet/files**. Then it copies puppet manifests which allow it to manage production VM. And finally, it sends docker-compose configuration file to the puppet master.

![]({{site.baseurl}}/https://github.com/ozzann/client-server-app/blob/master/images/pipeline.png)

## Puppet management

## Vagrant 