class production {

    require docker

    exec {'rm -rf /home/vagrant/client-app/*':
        path => '/usr/bin:/usr/sbin:/bin',
    }

    file { '/home/vagrant/client-app':
        ensure => 'directory',
        source => 'puppet:///extra_files/client-app',
        recurse => 'remote',
        path => '/home/vagrant/client-app',
        owner => 'vagrant',
    }

    exec {'rm -rf /home/vagrant/server-app/*':
        path => '/usr/bin:/usr/sbin:/bin',
    }

    file { '/home/vagrant/server-app':
        ensure => 'directory',
        source => 'puppet:///extra_files/server-app',
        recurse => 'remote',
        path => '/home/vagrant/server-app',
        owner => 'vagrant',
        require => File['/home/vagrant/client-app']
    }

    exec {'remove_old_images':
        require => File['/home/vagrant/server-app'],
        command => "/bin/bash -c 'docker stop $(docker ps -q); docker rm $(docker ps -q -a); docker rmi vagrant_server vagrant_client"
    }

    file { '/home/vagrant/docker-compose.yml':
        ensure => 'present',
        source => 'puppet:///extra_files/docker-compose.yml',
        owner => 'vagrant',
        require => Exec['remove_old_images']
    }

    class {'docker::compose':
      ensure => present,
    }

    docker_compose {'/home/vagrant/docker-compose.yml':
      ensure => present
    }

}
