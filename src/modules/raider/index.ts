import { flatten } from 'lodash';
import { Module } from '../module';
import DB from '../../db';

import { parseMessage } from '../../utils/message-utils';

import {
  formatRaidToDisplay,
  generateHelp,
  formatCallPlayers,
  formatSummaryPlayers,
  formatRoleList,
} from './raids-utils';

import {
  createRaid,
  deleteRaid,
  getRaids,
  joinRaid,
  accept,
  declineRaid,
  refuse,
  call,
  summary,
} from './raids';

import {
  defineRole,
  getAllRoles,
} from './roles';

import {
  setCharacter,
} from './characters';

DB.defaults({ raids: [], characters: [], roles: [] });

export const Raider: Module = {
  name: 'raider',
  matcher(message) {
    return message.content.startsWith('!raider ');
  },

  handler(message) {
    const messageContent = parseMessage(message) ;
    switch (messageContent.auxCommand) {
      case 'add':
        return createRaid(
          messageContent.args[0],
          messageContent.args[1],
          messageContent.args[2],
          message.author.id,
          message.author.username
        ).then(raid => ( { content: `Raid \`${raid.name}\' created! (ID ${raid.id})`, recipient: message.channel } ));
      case 'remove':
        return deleteRaid(messageContent.args[0], message.author.id).then(result => ({ content: 'Raid deleted!', recipient: message.channel }));
      case 'list':
        return getRaids(messageContent.args).then(raids => {
          const raidsFormatted = (raids.length > 0) ? flatten(raids.map(formatRaidToDisplay)) : 'No scheduled raids';
          return { content: raidsFormatted, recipient: message.channel };
        });
      case 'join':
        return joinRaid(messageContent.args[0], message.author.id, message.author.username).then(result => (
          { content: (result) ? 'Your participation is registered!' : 'You are already registered on this raid!', recipient: message.channel }
        ));
      case 'decline':
        return declineRaid(messageContent.args[0], message.author.id, message.author.username).then(result => (
          { content: (result) ? 'Your status is registered!' : 'You are already registered on this raid!', recipient: message.channel }
        ));
      case 'accept':
        return accept(messageContent.args[0], messageContent.args[1], message.author.id).then( _ => (
          { content: 'ok', recipient: message.channel }
        ));
      case 'refuse':
        return refuse(messageContent.args[0], messageContent.args[1], message.author.id).then( _ => (
          { content: 'ok', recipient: message.channel }
        ));
      case 'call':
        return call().then( players => (
          { content: formatCallPlayers(players), recipient: message.channel }
        ));
      case 'summary':
        return Promise.all([summary(), getAllRoles()]).then( ([characters, roles]) => (
          { content: formatSummaryPlayers(characters, roles), recipient: message.channel }
        ));
      case 'rdefine':
        return defineRole(messageContent.args[0], messageContent.args[1], messageContent.args[2]).then( role => (
          { content: `Role ${role.name} created!`, recipient: message.channel }
        ));

      case 'set':
        return setCharacter(message.author.id, message.author.username, messageContent.args[0]).then( character => (
          { content: `${character.name} registered as a raider (${character.role})!`, recipient: message.channel }
        ))
        .catch( _ => (
          { content: `Already registered!`, recipient: message.channel }
        ));
      case 'rlist':
        return getAllRoles().then(roles => (
          { content: formatRoleList(roles), recipient: message.channel }
        ));
      case 'help':
        return generateHelp().then( helpString => ({ content: helpString, recipient: message.channel }));
      default:
        return new Promise( resolve => resolve({ content: 'Unknown command ', recipient: message.channel}));
    }
  }
};
