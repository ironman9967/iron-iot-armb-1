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

echo "getting app version from $CLOUD_URI/api/bin/versions/armb/1/app/version"
version=`wget -qO- $CLOUD_URI/api/bin/versions/armb/1/app/version`
echo "app version is $version"



buildTar=built_armb-1_app_$version.tar.gz
echo "trying to download $version built from $CLOUD_URI/bin/devices/builds/armb/1/app/$builtTar"
wget -O $APP_PATH/$buildTar $CLOUD_URI/bin/devices/builds/armb/1/app/$builtTar`



source $APP_PATH/common/scripts/build-app.sh $APP_PATH $version armb 1

if [ $? == 0 ]
then
	echo "built release $version downloaded successfully"

else
	echo "$version not built"
	echo "getting app for armb 1"
	wget -O $APP_PATH/get-app.sh "https://raw.githubusercontent.com/ironman9967/iron-iot-common/master/scripts/get-app.sh"
	source $APP_PATH/get-app.sh $APP_PATH armb 1

	source $APP_PATH/common/scripts/build-app.sh $version armb 1

	rm -rf $APP_PATH/get-app.sh
fi

echo "starting $repo app"
chmod +x $APP_PATH/common/scripts/start.sh
$APP_PATH/common/scripts/start.sh
