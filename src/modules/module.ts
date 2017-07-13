import { Message, DMChannel, TextChannel, GroupDMChannel, User } from 'discord.js';

export interface Module {
  name: string;
  matcher(message: Message): boolean;
  handler(message: Message): Promise<ModuleResponse>;
}

export interface ModuleResponse {
  content: string | Array<string>;
  recipient: DMChannel | TextChannel | GroupDMChannel | User;
}
