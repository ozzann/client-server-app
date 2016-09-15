CONTAINERS=$(docker ps -q -a)
if [ "$CONTAINERS" ]
then
	docker stop $CONTAINERS &> /dev/null
	docker rm $CONTAINERS &> /dev/null
fi

docker build -f test/Dockerfile -t client-app .
docker run -p 3000:3000 client-app
