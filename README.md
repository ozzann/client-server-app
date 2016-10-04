## The client-server application as a demonstrator of using wide stack of technologies


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

## Server application


## Client application


## Docker-compose as a glue

## Jenkins builds

## Puppet management

## Vagrant 