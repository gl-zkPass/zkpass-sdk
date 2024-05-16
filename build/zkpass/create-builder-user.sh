#!/bin/bash
if getent passwd "builder" > /dev/null 2>&1; then
    echo "User 'builder' already exists."
else
    echo "Setting up 'builder' user for zkPass build environment."
    sudo adduser --gecos "" builder
    sudo usermod -aG sudo builder
    sudo apt-get install acl
    sudo setfacl -R -m u:`whoami`:rwx /home/builder
    sudo setfacl -d -m u:`whoami`:rwx /home/builder
    sudo setfacl -d -m u:builder:rwx /home/builder
    cp ./build/zkpass/setup-zkpass-env.sh ~builder/
    sudo chown builder ~builder/setup-zkpass-env.sh
    sudo -u builder bash -c ~builder/setup-zkpass-env.sh
    sudo rm ~builder/setup-zkpass-env.sh
fi
