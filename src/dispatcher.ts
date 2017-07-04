import { Message } from 'discord.js';
import { Module, ModuleResponse } from './modules/module';


export default class Dispatcher {
  modules: Array<Module>;

  constructor(modules: Array<Module>) {
    this.modules = modules;
  }

  dispatchMessage(message: Message): Array<Promise<ModuleResponse>> {
    return this.modules
      .filter(m => m.matcher(message))
      .map(m => m.handler(message));
  }
}
