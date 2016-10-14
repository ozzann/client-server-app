class production {

    require docker

    exec {'rm home/vagrant/remove_old_docker_images.sh':
        path => '/usr/bin:/usr/sbin:/bin',
    }

    file { '/home/vagrant/remove_old_docker_images.sh':
        source => 'puppet:///extra_files/remove_old_docker_images.sh',
        ensure => present
    }

    exec {'remove_old_images':
        require => File['/home/vagrant/remove_old_docker_images.sh'],
        command => "/bin/bash -c 'cd /home/vagrant; chmod +x remove_old_docker_images.sh; ./remove_old_docker_images.sh'"
    }

    exec {'rm -rf /home/vagrant/client-app/*':
        path => '/usr/bin:/usr/sbin:/bin',
        require => Exec['remove_old_images']
    }

    file { '/home/vagrant/client-app':
        ensure => 'directory',
        source => 'puppet:///extra_files/client-app',
        recurse => 'remote',
        path => '/home/vagrant/client-app',
        owner => 'vagrant',
    }

    exec {'build_client_image':
        require => File['/home/vagrant/client-app'],
        cwd => "/home/vagrant/client-app",
        command => "/bin/bash -c 'docker build -t client-app .'",
        timeout => 1000,
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
        require => Exec['build_client_image']
    }

    exec {'build_server_image':
        require => File['/home/vagrant/server-app'],
        cwd => "/home/vagrant/server-app",
        command => "/bin/bash -c 'docker build -t server-app .'",
        timeout => 3000,
    }

    file { '/home/vagrant/docker-compose.yml':
        ensure => 'present',
        source => 'puppet:///extra_files/docker-compose.yml',
        owner => 'vagrant',
        require => File['/home/vagrant/server-app']
    }

    class {'docker::compose':
      ensure => present
    }

    docker_compose {'/home/vagrant/docker-compose.yml':
      ensure => present
    }

}
