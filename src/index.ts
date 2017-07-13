import { Client, Message } from 'discord.js';
import { createServer } from 'http';

import { isHumanMessage } from './utils/message-utils';
import Dispatcher from './dispatcher';

import { Raider } from './modules/raider';

import config from './config/config';


const client = new Client();
const modules = [ Raider ];

const dispatcher = new Dispatcher(modules);

client.on('ready', () => {
  console.log('Bot ready!');
});

client.on('message', (message: Message) => {
  if (isHumanMessage(message, client)) {
    const responses = dispatcher.dispatchMessage(message);
    Promise.all(responses).then(responses => {
      responses.forEach(r => {
        if (r.content instanceof Array) {
          r.content.forEach(c => {
            r.recipient.send(c);
          });
        }
        else {
          r.recipient.send(r.content);
        }
      });
    });
  }
});

client.login(config.auth.token);

// Simple Http server to check the client state
const requestHandler = (_, response) => {
  response.end(`Client status: ${client.status}`);
};

const server = createServer(requestHandler);

server.listen(process.env.PORT || 5000, () => {
  console.log(`server is listening on ${process.env.PORT || 5000}`);
});
