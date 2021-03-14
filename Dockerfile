FROM node:15.11-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=prod

COPY . .

CMD [ "npm", "run", "start:prod" ]
