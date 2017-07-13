import * as moment from 'moment';

import { Raid } from './raids';

export const formatRaidToDisplay = (raid: Raid): Array<string> => (
[
  `\n---\n\`\`\`css
[${moment(raid.date).format('DD MMM, HH:mm')}] ${raid.name} (ID ${raid.id})
Organizer: ${raid.organizer};
Description: ${raid.description};

Participants: ${(raid.players.length > 0) ? raid.players.map(p => p.name).join(', ') : '-'}
Waitings: ${(raid.waitings.length > 0) ? raid.waitings.map(p => p.name).join(',') : '-'}
Absents: ${(raid.absents.length > 0) ? raid.absents.map(p => p.name).join(',') : '-'}
\`\`\``,
`\`${raid.id}\``
]
);


export const generateHelp = (): Promise<string> => new Promise( resolve => resolve(
`\n\`\`\`css

Create an event:
    add <event_name> <event_date> <event_description>
      - event_name allows spaces if it is between quotes
      - event date has to be <YYYY-MM-DDTHH:mm> format
      - event description can be anything
    -> Returns event_id

Remove an event:
    remove <event_id>

List events:
    list

Join an event:
    join <event_id>

Decline an event:
    decline <event_id>

Accept a participant for an event:
    accept <event_id> <participant_name>

\`\`\``
));

export const formatCallPlayers = (players: Array<string>): string => (
  players.map(p => `@${p}`).join(', ') + ' ! You are expected for the next raid!'
);
