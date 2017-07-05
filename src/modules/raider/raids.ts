import DB from '../../db';
import * as moment from 'moment';
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
}

function _addNewRaid(raidData: Raid): Promise<Raid> {
  return DB.push('raids', raidData);
}

function _getAllFutureRaids(): Array<Raid> {
  return DB.get('raids');
}

export default {
  createRaid(name: string, date: string, description: string, organizerId: string, organizer: string): Promise<Raid> {
    return new Promise(resolve => {
      const id = `${name}-${moment().unix()}`;
      const raidData = {id, name, date: moment(date).toDate(), description, organizerId, organizer, players: [], waitings: [], absents: [] };
      _addNewRaid(raidData);
      resolve(raidData);
    });
  },

  getRaids(): Promise<Array<Raid>> {
    return new Promise(resolve => resolve(_getAllFutureRaids()));
  }
};
