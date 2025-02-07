FROM node
WORKDIR /usr/share/node/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"] 
