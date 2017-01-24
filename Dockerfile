FROM node

RUN npm i -g polymer-cli bower

ADD . /app

USER node
WORKDIR /app

RUN bower install

EXPOSE 8080
CMD polymer serve
