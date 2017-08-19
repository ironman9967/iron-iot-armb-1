#!/bin/bash

source $APP_PATH/common/scripts/start-nvm.sh

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
wget -O $APP_PATH/get-app.sh "https://raw.githubusercontent.com/ironman9967/iron-iot-common/master/scripts/get-app.sh"
source $APP_PATH/get-app.sh armb 1

source $APP_PATH/common/scripts/build-app.sh $version armb 1

rm -rf get-app.sh

echo "starting $repo app"
chmod +x $APP_PATH/common/scripts/start.sh
$APP_PATH/common/scripts/start.sh
