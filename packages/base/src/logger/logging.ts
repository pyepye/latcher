import { Logger, type LoggerLike } from './Logger.js';

let loggerSingleton: LoggerLike | null = null;

async function tryResolvePowertools(): Promise<void> {
  if (loggerSingleton) return;
  try {
    // @ts-expect-error - @aws-lambda-powertools/logger is an optional peer dependency, types may be absent
    const powertoolsLoggerModule = await import('@aws-lambda-powertools/logger');
    if (!loggerSingleton) loggerSingleton = new powertoolsLoggerModule.Logger();
  } catch {
    // Powertools not installed - fall back to default Logger
  }
}

void tryResolvePowertools();

export function setLogger(clientLogger: LoggerLike): void {
  loggerSingleton = clientLogger;
}

export function getLogger(): LoggerLike {
  if (loggerSingleton) return loggerSingleton;
  loggerSingleton = new Logger();
  return loggerSingleton;
}

const proxyHandler: ProxyHandler<LoggerLike> = {
  get(_target: LoggerLike, prop: string | symbol): unknown {
    const loggerInstance = getLogger();
    const value = Reflect.get(loggerInstance, prop);
    if (typeof value === 'function') return value.bind(loggerInstance);
    return () => {};
  },
};

const proxyTarget: LoggerLike = new Logger();
export const logger: LoggerLike = new Proxy(proxyTarget, proxyHandler);
