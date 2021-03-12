FROM node:15.11-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=prod

COPY . .

ENV NODE_ENV production

CMD [ "npm", "start" ]
