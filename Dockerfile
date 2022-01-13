FROM node:16-alpine

WORKDIR /usr/app

COPY package*.json ./

RUN npm i --prefer-offline --no-audit

COPY . .

CMD npm run start:dev