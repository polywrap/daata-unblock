export interface Invocation {
  uri: string;
  method: string;
  args?: Record<string, any>;
}
