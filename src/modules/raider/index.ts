import { Module } from '../module';
import DB from '../../db';
import { parseMessage } from '../../utils/message-utils';
import { formatRaidToDisplay, generateHelp, formatCallPlayers } from './raids-utils';

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
        ).then(raid => ( { content: `Raid \`${raid.name}\' created! (ID ${raid.id})`, recipient: message.channel } ));
      case 'remove':
        return Raids.deleteRaid(messageContent.args[0], message.author.id).then(result => ({ content: 'Raid deleted!', recipient: message.channel }));
      case 'list':
        return Raids.getRaids(messageContent.args).then(raids => {
          const raidsFormatted = (raids.length > 0) ? raids.map(formatRaidToDisplay).join('\n') : 'No scheduled raids';
          return { content: raidsFormatted, recipient: message.channel };
        });
      case 'join':
        return Raids.joinRaid(messageContent.args[0], message.author.id, message.author.username, message.author.tag).then(result => (
          { content: (result) ? 'Your participation is registered!' : 'You are already registered on this raid!', recipient: message.channel }
        ));
      case 'decline':
        return Raids.declineRaid(messageContent.args[0], message.author.id, message.author.username).then(result => (
          { content: (result) ? 'Your status is registered!' : 'You are already registered on this raid!', recipient: message.channel }
        ));
      case 'accept':
        return Raids.accept(messageContent.args[0], messageContent.args[1], message.author.id).then( _ => (
          { content: 'ok', recipient: message.channel }
        ));
      case 'call':
        return Raids.call().then( players => (
          { content: formatCallPlayers(players), recipient: message.channel }
        ));
      case 'help':
        return generateHelp().then( helpString => ({ content: helpString, recipient: message.channel }));
      default:
        return new Promise( resolve => resolve({ content: 'Unknown command ', recipient: message.channel}));
    }
  }
};
