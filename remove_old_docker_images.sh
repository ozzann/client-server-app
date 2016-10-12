CONTAINERS=$(docker ps -q -a)
if [ "$CONTAINERS" ]
then
	docker stop $CONTAINERS &> /dev/null
	docker rm $CONTAINERS &> /dev/null
fi

docker rmi vagrant_server vagrant_client
