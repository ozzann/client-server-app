FROM node:4-onbuild

ADD . /usr/src/app
WORKDIR /usr/src/app

EXPOSE 3000

CMD ["npm", "install","--only=dev"]
CMD ["npm","test"] 
