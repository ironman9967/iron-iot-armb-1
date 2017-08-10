#!/bin/bash

source ./common/scripts/start-nvm.sh

echo 'getting node version from cloud'
nodeVersion=`wget -qO- http://iron-iot-cloud:9967/api/bin/versions/node | grep -o ':".*' | grep -o '[^:"} ]*'`
echo "node version is $nodeVersion"

echo "installing node $nodeVersion"
nvm install "$nodeVersion"

echo "setting nvm default to $nodeVersion"
nvm alias default "$nodeVersion"

echo "setting nvm to use $nodeVersion"
nvm use "$nodeVersion"
