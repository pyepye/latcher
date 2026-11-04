import { Logger, type LoggerLike, type LogLevelName } from './Logger.js';
import { logger, setLogger } from './logging.js';

type LogInput = string | Record<string, unknown>;
type ExtraLogInput = [Error | string] | Record<string, unknown>[];

class PowertoolsShapedLogger {
  getLevelName(): LogLevelName {
    return 'INFO';
  }
  setLogLevel(_logLevel: LogLevelName | Lowercase<LogLevelName>): void {}
  appendKeys(_attributes: Record<string, unknown>): void {}
  removeKeys(_keys: string[]): void {}
  resetKeys(): void {}
  appendPersistentKeys(_attributes: Record<string, unknown>): void {}
  removePersistentKeys(_keys: string[]): void {}
  trace(_input: LogInput, ..._extraInput: ExtraLogInput): void {}
  debug(_input: LogInput, ..._extraInput: ExtraLogInput): void {}
  info(_input: LogInput, ..._extraInput: ExtraLogInput): void {}
  warn(_input: LogInput, ..._extraInput: ExtraLogInput): void {}
  error(_input: LogInput, ..._extraInput: ExtraLogInput): void {}
  critical(_input: LogInput, ..._extraInput: ExtraLogInput): void {}
}

function logsTwoMetaObjects(): void {
  // @ts-expect-error a log call takes one meta object at most
  logger.info('message', { orderId: '1' }, { customerId: '2' });
}

suite('setLogger', () => {
  test('takes the built-in Logger', () => {
    expectTypeOf(setLogger).toBeCallableWith(new Logger());
  });

  test('takes a logger with the Powertools signatures', () => {
    expectTypeOf(setLogger).toBeCallableWith(new PowertoolsShapedLogger());
  });

  test('rejects a logger missing a method', () => {
    expectTypeOf<Omit<Logger, 'critical'>>().not.toExtend<LoggerLike>();
  });
});

suite('logger', () => {
  test('takes a message with or without a meta object', () => {
    expectTypeOf(logger.info).toBeCallableWith('message');
    expectTypeOf(logger.info).toBeCallableWith('message', { orderId: '1' });
    expectTypeOf(logsTwoMetaObjects).toBeFunction();
  });
});
