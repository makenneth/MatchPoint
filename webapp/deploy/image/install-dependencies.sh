#!/bin/bash

set -e


add-apt-repository -y ppa:chris-lea/redis-server
curl -sL https://deb.nodesource.com/setup_11.x | bash -
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
apt-get -y update
apt-get install -y nodejs yarn redis-server

