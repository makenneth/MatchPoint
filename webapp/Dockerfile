FROM node:6
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
COPY .env /
RUN npm run build
CMD HOST=123.123.123.123 node /app/build/app.js
EXPOSE 3000
