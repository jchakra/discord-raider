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
    const raid: Raid = DB.get('raids', {id: raidId});

    if (!raid) {
      reject({ reason: `The raid id ${raidId} is incorrect` });
      return;
    }

    if (raid.organizerId !== callerId) {
      reject({ reason: `Only the organizer (${raid.organizer}) can do this action.` });
      return;
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

export function joinRaid(raidId: string, playerId: string, playerName: string, ...options: Array<string>): Promise<string> {
  return new Promise((resolve, reject) => {

    let raids = null;
    if (raidId === '--next') {
      raids = (options[0]) ? _getFutureRaids().slice(0, parseInt(options[0])) : [_getFutureRaids()[0]];
    }
    else {
      const raid = DB.get('raids', {id: raidId});
      raids = (raid) ? [raid] : null;
    }

    if (!raids || raids.length === 0) {
      reject({ reason: (raidId === '--next') ? `There is no raid in the next two weeks!` : `The raid id ${raidId} is incorrect` });
      return;
    }

    // Do something with results?
    const results = raids.map(r => {

      // Remove user from absents if necessary
      const isInAbsents = find(r.absents, e => e.id === playerId);
      if (isInAbsents) {
        DB.getRaw('raids', {id: r.id})
          .get('absents')
          .remove(e => e.id === playerId)
          .write();
      }

      const isAlreadyRegistered = find(flatten([r.players, r.waitings]), e => e.id === playerId);
      if (!isAlreadyRegistered) {
        DB.getRaw('raids', {id: r.id}).get('waitings').push({ id: playerId, name: playerName }).write();
        return true;
      }
      return false;
    });

    const message = (options[0]) ?
      `Registered for the next ${options[0]} raids.` :
      `Registered for the next raid.`;

    resolve(message);
  });
}

export function declineRaid(raidId: string, playerId: string, playerName: string, ...options: Array<string>): Promise<string> {
  return new Promise((resolve, reject) => {


    let raids = null;
    if (raidId === '--next') {
      raids = (options[0]) ? _getFutureRaids().slice(0, parseInt(options[0])) : [_getFutureRaids()[0]];
    }
    else {
      const raid = DB.get('raids', {id: raidId});
      raids = (raid) ? [raid] : null;
    }

    if (!raids || raids.length === 0) {
      reject({ reason: (raidId === '--next') ? `There is no raid in the next two weeks!` : `The raid id ${raidId} is incorrect` });
      return;
    }

    // Do something with results?
    const results = raids.map(r => {

      // Remove user from waiting or participants if necessary
      const isInWaitings = find(r.waitings, e => e.id === playerId);
      if (isInWaitings) {
        DB.getRaw('raids', {id: r.id})
          .get('waitings')
          .remove(e => e.id === playerId)
          .write();
      }

      const isInParticipants = find(r.players, e => e.id === playerId);
      if (isInParticipants) {
        DB.getRaw('raids', {id: r.id})
          .get('players')
          .remove(e => e.id === playerId)
          .write();
      }

      const isAlreadyRegistered = find(flatten([r.absents]), e => e.id === playerId);
      if (!isAlreadyRegistered) {
        DB.getRaw('raids', {id: r.id}).get('absents').push({ id: playerId, name: playerName }).write();
        return true;
      }
      return false;
    });

    const message = (options[0]) ?
      `Set as absent for the next ${options[0]} raids.` :
      `Set as absent for the next raid.`;

    resolve(message);
  });
}

export function accept(raidId: string, playerName: string, callerId: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const raid = DB.get('raids', {id: raidId});
    if (!raid) {
      reject({ reason: `The raid id ${raidId} is incorrect` });
      return;
    }

    if (raid.organizerId !== callerId) {
      reject({ reason: `Only the organizer (${raid.organizer}) can do this action.` });
      return;
    }
    const character = DB.getRaw('raids', {id: raidId})
      .get('waitings')
      .find(e => e.name.toLowerCase() === playerName.toLowerCase())
      .value();

    if (!character) {
      reject({ reason: `There is no player named ${playerName} registered on this raid.` });
      return;
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
      reject({ reason: `The raid id ${raidId} is incorrect` });
      return;
    }

    if (raid.organizerId !== callerId) {
      reject({ reason: `Only the organizer (${raid.organizer}) can do this action.` });
      return;
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
        reject({ reason: `There is no player named ${playerName} registered on this raid.` });
        return;
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

export function summary(): Promise<Array<Character>> {
  return new Promise( (resolve, reject) => {
    const nextRaid = _getFutureRaids()[0];
    if (!nextRaid) {
      reject({ reason: `There is no scheduled raid in the next two weeks.` });
      return;
    }
    const playersId = nextRaid.players.map(p => p.id);
    const characters = DB.getAll('characters', c => playersId.includes(c.id));
    resolve(characters);
  });
}
