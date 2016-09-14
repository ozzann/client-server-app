#!/bin/bash
CONTAINERS=$(docker ps -q -a)
if [ "$CONTAINERS" ]
then
	docker stop $CONTAINERS &> /dev/null
	docker rm $CONTAINERS &> /dev/null
fi

docker build -f tests/Dockerfile -t dropwiz .
docker run -p 9080:8080 -p 9081:8081 dropwiz
