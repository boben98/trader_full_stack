FROM mhart/alpine-node:latest
WORKDIR /react
COPY package*.json /react/
RUN npm install
COPY . /react/
EXPOSE 3000
CMD ["npm", "start"]