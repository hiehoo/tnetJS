FROM node:23.4.0

WORKDIR /home/node/app

RUN chown -R node:node /home/node/app

CMD [ "npm", "run", "dev-watch" ]