FROM node:4-onbuild

ADD . /usr/src/app
WORKDIR /usr/src/app

EXPOSE 3000

CMD ["npm","install"]
CMD ["npm","build"]
CMD ["npm", "start"]
