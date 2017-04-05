FROM alpine:3.1
# Update
RUN apk add --update nodejs
RUN mkdir -p /src/app/docker_example

WORKDIR /src/app/docker_example
# Install app dependencies
COPY package.json /src/app/docker_example/package.json
RUN  npm install
# Bundle app source
COPY . /src/app/docker_example/

CMD ["node", "index.js"]