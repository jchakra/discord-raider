import * as moment from 'moment';

import { Raid } from './raids';

export const formatRaidToDisplay = (raid: Raid): string => {
  return (
`\n\`\`\`css
[${moment(raid.date).format('DD MMM, HH:mm')}] ${raid.name} (ID ${raid.id})\norganizer: ${raid.organizer};

Participants: ${(raid.players.length > 0) ? raid.players.map(p => p.name).join(',') : '-'}
Waitings: ${(raid.waitings.length > 0) ? raid.waitings.map(p => p.name).join(',') : '-'}
Absents: ${(raid.absents.length > 0) ? raid.absents.map(p => p.name).join(',') : '-'}
\`\`\``
  );
};
