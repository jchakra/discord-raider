import { Module } from '../module';
import DB from '../../db';
import { parseMessage } from '../../utils/message-utils';
import { formatRaidToDisplay } from './raids-utils';

import Raids from './raids';

DB.defaults({ raids: [], characters: [] });

export const Raider: Module = {
  name: 'raider',
  matcher(message) {
    return message.content.startsWith('!raider ');
  },

  handler(message) {
    const messageContent = parseMessage(message) ;
    switch (messageContent.auxCommand) {
      case 'add':
        return Raids.createRaid(
          messageContent.args[0],
          messageContent.args[1],
          messageContent.args[2],
          message.author.id,
          message.author.username
        ).then(raid => ( { content: `Raid \`${raid.name}\' created!`, recipient: message.channel } ));
      case 'list':
        return Raids.getRaids().then(raids => {
          const raidsFormatted = (raids.length > 0) ? raids.map(formatRaidToDisplay).join('\n') : 'No scheduled raids';
          return { content: raidsFormatted, recipient: message.channel };
        });
      default:
        return new Promise( resolve => resolve({ content: 'Unknown command ', recipient: message.channel}));
    }
  }
};
