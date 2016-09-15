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
    }

    file { '/home/vagrant/docker-compose.yml':
        ensure => 'present',
        source => 'puppet:///extra_files/docker-compose.yml',
        owner => 'vagrant',
    }

    docker_compose { '/home/vagrant/docker-compose.yml':
        ensure => present,
    }
}
