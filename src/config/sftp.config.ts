import { createWinstonLogger } from './winston.config';

export interface SftpSwiftConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  remoteBasePath?: string;
  connectionMode?: string;
  debug?: string;
}

export interface GetSftpModuleOptionsParams {
  sftpSwift: SftpSwiftConfig;
}

export default function getSftpModuleOptions({
  sftpSwift,
}: GetSftpModuleOptionsParams) {
  const logger = createWinstonLogger();

  return {
    host: sftpSwift.host,
    port: sftpSwift.port,
    username: sftpSwift.username,
    password: sftpSwift.password,
    debug: (message: string) => logger.debug(message),
  };
}
