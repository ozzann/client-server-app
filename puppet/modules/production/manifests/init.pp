class production {

    require docker

    exec {'rm -rf /home/vagrant/app/*':
        path => '/usr/bin:/usr/sbin:/bin',
    }

    file { '/home/vagrant/app':
        ensure => 'directory',
        source => 'puppet:///extra_files/app',
        recurse => 'remote',
        path => '/home/vagrant/app',
        owner => 'vagrant',
    }
    
    exec { 'deploy_app':
       cwd     => "/home/vagrant/app",
       logoutput => 'true',
       command => "/bin/bash -c 'chmod +x deploy.sh; ./deploy.sh'",
       require => File["/home/vagrant/app"],
       timeout => 1000,
    }
}
