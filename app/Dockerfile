FROM node:6
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build-server
CMD node /app/build/app.js
EXPOSE 3000
