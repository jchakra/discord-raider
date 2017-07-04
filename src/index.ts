import { Client, Message } from 'discord.js';

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
        r.recipient.send(r.content);
      });
    });
  }
});

client.login(config.auth.token);
