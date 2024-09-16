FROM node:20.17-alpine3.19 AS build
RUN apk add --no-cache xvfb
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ttf-freefont
ENV CHROME_EXECUTABLE_PATH=/usr/bin/chromium-browser
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]