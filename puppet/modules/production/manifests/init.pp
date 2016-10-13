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

    exec {'rm home/vagrant/remove_old_docker_images.sh':
        path => '/usr/bin:/usr/sbin:/bin',
    }

    file { 'remove_old_docker_images':
	source => 'puppet:///extra_files/remove_old_docker_images.sh',
	path => '/home/vagrant',
	owner => 'vagrant',
	ensure => present
    }

    exec {'remove_old_images':
        require => File['remove_old_docker_images'],
        command => "/bin/bash -c './remove_old_docker_images.sh'"
    }

    file { '/home/vagrant/docker-compose.yml':
        ensure => 'present',
        source => 'puppet:///extra_files/docker-compose.yml',
        owner => 'vagrant',
        require => Exec['remove_old_images']
    }

    class {'docker::compose':
      ensure => present
    }

    docker_compose {'/home/vagrant/docker-compose.yml':
      ensure => present
    }

}
