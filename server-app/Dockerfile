FROM java:8

COPY . /usr/src/server-app
WORKDIR /usr/src/server-app

EXPOSE 8080 8081

CMD java -jar target/hello-world-1.0.0.jar server config.yml 
