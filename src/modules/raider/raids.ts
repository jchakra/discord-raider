import DB from '../../db';
import * as moment from 'moment';
import { find, flatten } from 'lodash';
import { Character } from './characters';

export interface Raid {
  id: string;
  name: string;
  date: Date;
  description: string;
  organizer: string;
  organizerId: string;
  players: Array<Character>;
  waitings: Array<Character>;
  absents: Array<Character>;
  refused: Array<Character>;
}

function _addNewRaid(raidData: Raid): Promise<Raid> {
  return DB.push('raids', raidData);
}

function _getFutureRaids(): Array<Raid> {
  return DB.getAll('raids', e =>
    moment(e.date).endOf('day').isAfter(moment()) &&
    moment(e.date).isBefore(moment().add(14, 'days').endOf('day')))
    .sort((a, b) => (moment(a.date).isBefore(moment(b.date))) ? -1 : 1);
}

function _getPastRaids(): Array<Raid> {
  return DB.getAll('raids', e =>
    moment(e.date).endOf('day').isBefore(moment()) &&
    moment(e.date).isAfter(moment().subtract(14, 'days').startOf('day')));
}

export function createRaid(name: string, date: string, description: string, organizerId: string, organizer: string): Promise<Raid> {
  return new Promise(resolve => {
    const id = `${name.replace(' ', '_')}-${moment().unix()}`;
    const raidData = {id, name, date: moment(date).toDate(), description, organizerId, organizer, players: [], waitings: [], absents: [], refused: [] };
    _addNewRaid(raidData);
    resolve(raidData);
  });
}

export function deleteRaid(raidId: string, callerId: string): Promise<boolean> {
  return new Promise( (resolve, reject) => {
    const raid = DB.get('raids', {id: raidId});

    if (!raid) {
      reject(false);
    }

    if (raid.organizerId !== callerId) {
      reject(false);
    }

    DB.remove('raids', {id: raidId});
    resolve(true);
  });
}

export function getRaids(options: string[]): Promise<Array<Raid>> {
  let raids;
  switch (options[0]) {
    case '--past':
      raids = flatten([_getPastRaids()]);
      break;
    case '--date':
      raids = flatten([ DB.get('raids', e =>
        moment(e.date).startOf('day')
          .isSame(moment(options[1]).startOf('day')))
      ]);
      break;
    default:
      raids = flatten([_getFutureRaids()]);
      break;
  }
  return new Promise(resolve => resolve(raids));
}

export function joinRaid(raidId: string, playerId: string, playerName: string, playerTag: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const raid = DB.get('raids', {id: raidId});

    if (!raid) {
      reject(false);
    }

    const isAlreadyRegistered = find(flatten([raid.players, raid.waitings]), e => e.id === playerId);
    if (!isAlreadyRegistered) {
      DB.getRaw('raids', {id: raidId}).get('waitings').push({ id: playerId, name: playerName, tag: playerTag }).write();
      resolve(true);
    }
    resolve(false);
  });
}

export function declineRaid(raidId: string, playerId: string, playerName: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const raid = DB.get('raids', {id: raidId});

    if (!raid) {
      reject(false);
    }

    const isAlreadyRegistered = find(flatten([raid.absents]), e => e.id === playerId);
    if (!isAlreadyRegistered) {
      DB.getRaw('raids', {id: raidId}).get('absents').push({ id: playerId, name: playerName }).write();
      resolve(true);
    }
    resolve(false);
  });
}

export function accept(raidId: string, playerName: string, callerId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const raid = DB.get('raids', {id: raidId});
    if (!raid) {
      reject(false);
    }

    if (raid.organizerId !== callerId) {
      reject(false);
    }
    const character = DB.getRaw('raids', {id: raidId})
      .get('waitings')
      .find(e => e.name.toLowerCase() === playerName.toLowerCase())
      .value();

    if (!character) {
      reject(false);
    }

    DB.getRaw('raids', {id: raidId})
      .get('players')
      .push(character)
      .write();

    DB.getRaw('raids', {id: raidId})
      .get('waitings')
      .remove(e => e.name.toLowerCase() === playerName.toLowerCase())
      .write();
    resolve(character.id);
  });
}

export function refuse(raidId: string, playerName: string, callerId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const raid = DB.get('raids', {id: raidId});
    if (!raid) {
      reject(false);
    }

    if (raid.organizerId !== callerId) {
      reject(false);
    }
    let character = DB.getRaw('raids', {id: raidId})
      .get('waitings')
      .find(e => e.name.toLowerCase() === playerName.toLowerCase())
      .value();

    DB.getRaw('raids', {id: raidId})
      .get('waitings')
      .remove(e => e.name.toLowerCase() === playerName.toLowerCase())
      .write();

    if (!character) {
      character = DB.getRaw('raids', {id: raidId})
        .get('players')
        .find(e => e.name.toLowerCase() === playerName.toLowerCase())
        .value();


      DB.getRaw('raids', {id: raidId})
        .get('players')
        .remove(e => e.name.toLowerCase() === playerName.toLowerCase())
        .write();

      if (!character) {
        reject(false);
      }
    }

    DB.getRaw('raids', {id: raidId})
      .get('refused')
      .push(character)
      .write();

    resolve(character.id);
  });
}

export function call(): Promise<Array<string>> {
  return new Promise( (resolve, reject) => {
    const players = _getFutureRaids()[0].players.map(p => p.id);
    resolve(players);
  });
}
