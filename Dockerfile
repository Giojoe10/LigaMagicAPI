FROM node:20.17-alpine3.19 AS build
RUN apt-get update && apt-get install -y xvfb
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]