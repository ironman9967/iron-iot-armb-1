#!/bin/bash

if [ "$CLOUD_API_URI" == "" ]
then
	export CLOUD_URI=http://tdh-home.asuscomm.com:9967
fi

source ./common/scripts/start-nvm.sh

echo 'getting node version from cloud'
nodeVersion=`wget -qO- $CLOUD_URI/api/bin/versions/armb/1/interpreter/version`
echo "node version is $nodeVersion"

echo "installing node $nodeVersion"
nvm install "$nodeVersion"

echo "setting nvm default to $nodeVersion"
nvm alias default "$nodeVersion"

echo "setting nvm to use $nodeVersion"
nvm use "$nodeVersion"

echo "getting app for armb 1"
wget "https://raw.githubusercontent.com/ironman9967/iron-iot-cloud/master/scripts/get-app.sh"
source ./get-app.sh armb 1

source ./common/scripts/build-app.sh $version armb 1

rm -rf get-app.sh

echo "starting $repo app"
chmod +x ./common/scripts/start.sh
./common/scripts/start.sh
