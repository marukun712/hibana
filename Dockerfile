FROM node:22-slim

COPY . /app

COPY package.json package-lock.json ./
COPY packages/*/package.json ./packages/

RUN npm install

COPY . .

WORKDIR /app/packages/repository-server

CMD ["npm", "run", "start"]
