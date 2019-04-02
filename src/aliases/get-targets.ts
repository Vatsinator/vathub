import { aliasMap } from './alias-map';

export function getTargets(alias: string): string[] {
  const ret = aliasMap
    .filter(entry => entry.alias.includes(alias))
    .map(entry => entry.target);

  if (alias.length === 3) {
    // Add targets for USA airports, controllers there usually drop
    // the first K from the airport/FIR ICAO code.
    return [ `K${alias}`, ...ret ];
  } else {
    return ret;
  }
}
