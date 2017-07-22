import DB from '../../db';

export interface Character {
  id: string;
  name: string;
  role?: string;
}

export function setCharacter(id: string, name: string, role: string): Promise<Character> {
  return new Promise( (resolve, reject) => {
    const characterData = { id, name, role };
    const existing = DB.get('characters', { id });
    if (existing) {
      DB.update('characters', { id }, { role });
      resolve(characterData);
      return;
    }
    DB.push('characters', characterData);
    resolve(characterData);
  });
}
