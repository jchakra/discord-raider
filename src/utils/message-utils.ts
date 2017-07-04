import { Message, Client } from 'discord.js';

export interface ParsedMessage {
  mainCommand: string;
  auxCommand: string;
  args: Array<string>;
}

export const isHumanMessage = (message: Message, client: Client) => message.author.id !== client.user.id;

export const parseMessage = (message:Message): ParsedMessage => {
  const splitted = message.content.split(' ');
  return {
    mainCommand: splitted[0],
    auxCommand: splitted[1],
    args: splitted.slice(2)
  };
};
