import { Message, Client } from 'discord.js';

export interface ParsedMessage {
  mainCommand: string;
  auxCommand: string;
  args: Array<string>;
}

export const isHumanMessage = (message: Message, client: Client) => message.author.id !== client.user.id;

export const parseMessage = (message: Message): ParsedMessage => {

  const commandRegex = /^(\!\w+) (\w+)((?:"[^"]+"|[^"]+)+)?/g;
  const matched = commandRegex.exec(message.content);

  const argsRegex = /[ ]+(?=(?:[^"]*"[^"]*")*[^"]*$)/;
  const argsMatched = (matched[3]) ?
    matched[3]
      .split(argsRegex)
      .filter(s => s && s !== '')
      .map(s => {
        if (/"[^"]*"/.test(s)) {
          return s.slice(1, -1).trim();
        }
        return s;
      }) : [];

  return {
    mainCommand: matched[1],
    auxCommand: matched[2],
    args: argsMatched
  };
};
