#!/bin/bash

if [ "$CLOUD_API_URI" == "" ]
then
	export $CLOUD_URI=http://tdh-home.asuscomm.com:9967
fi

source ./common/scripts/start-nvm.sh

echo 'getting node version from cloud'
nodeVersion=`wget -qO- $CLOUD_URL/api/bin/versions/node | \
	grep -o ':".*'
	# | \
	# grep -o '[^:"} ]*'`
echo "node version is $nodeVersion"

# echo "installing node $nodeVersion"
# nvm install "$nodeVersion"
#
# echo "setting nvm default to $nodeVersion"
# nvm alias default "$nodeVersion"
#
# echo "setting nvm to use $nodeVersion"
# nvm use "$nodeVersion"
