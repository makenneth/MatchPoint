FROM node:6
WORKDIR /app
COPY package.json /app
RUN npm install
RUN npm run build
COPY . /app
CMD node /app/build/app.js
