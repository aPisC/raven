export interface ICitrineConfiguration {
  server: ICitrineServerConfiguration;
}

export interface ICitrineServerConfiguration {
  port: number;
  root: string;
}
