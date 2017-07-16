import DB from '../../db';

export interface Role {
  name: string;
  category: string;
  icon: string;
}

function createRole(role: Role): Promise<Role> {
  return DB.push('roles', role);
}

export function defineRole(name: string, category: string, icon: string): Promise<Role> {
  return new Promise( (resolve, reject) => {
    return DB.push('roles', { name, category, icon });
  });
}
