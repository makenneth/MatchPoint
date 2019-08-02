#!/bin/bash

set -e

apt-get install -y software-properties-common
apt-add-repository ppa:certbot/certbot
apt-get update
apt-get install -y certbot

mkdir -p /var/certbot/www
