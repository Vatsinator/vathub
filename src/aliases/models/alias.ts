export interface NamedAlias {
  alias: string[];
  name: string;
}

export interface Alias {
  alias: Array<string | NamedAlias>;
  target: string;
}
