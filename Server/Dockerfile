FROM mhart/alpine-node:latest
WORKDIR /server
COPY package*.json /server/
RUN npm install
COPY . /server/
EXPOSE 3001
CMD ["npm", "start"]