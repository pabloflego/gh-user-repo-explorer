import { describe, it, expect, vi } from 'vitest';
import { Logger } from './Logger';

describe('Logger', () => {
  describe('constructor', () => {
    it('should create an instance with default empty prefix and default provider', () => {
      const mockProvider = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const logger = new Logger('', mockProvider);
      
      logger.log('test');
      
      expect(mockProvider.log).toHaveBeenCalledWith('[]','test');
    });

    it('should create an instance with custom prefix', () => {
      const mockProvider = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const logger = new Logger('TestApp', mockProvider);
      
      logger.log('test');
      
      expect(mockProvider.log).toHaveBeenCalledWith('[TestApp]', 'test');
    });

    it('should create an instance with custom provider', () => {
      const mockProvider = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const logger = new Logger('App', mockProvider);
      
      logger.log('test');
      
      expect(mockProvider.log).toHaveBeenCalledWith('[App]', 'test');
    });
  });

  describe('log', () => {
    it('should call provider.log with prefix and message', () => {
      const mockProvider = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const logger = new Logger('MyApp', mockProvider);
      const message = 'This is a log message';
      
      logger.log(message);
      
      expect(mockProvider.log).toHaveBeenCalledTimes(1);
      expect(mockProvider.log).toHaveBeenCalledWith('[MyApp]', message);
    });

    it('should handle empty string message', () => {
      const mockProvider = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const logger = new Logger('App', mockProvider);
      
      logger.log('');
      
      expect(mockProvider.log).toHaveBeenCalledWith('[App]', '');
    });

    it('should handle multiple log calls', () => {
      const mockProvider = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const logger = new Logger('MultiLog', mockProvider);
      
      logger.log('First message');
      logger.log('Second message');
      logger.log('Third message');
      
      expect(mockProvider.log).toHaveBeenCalledTimes(3);
      expect(mockProvider.log).toHaveBeenNthCalledWith(1, '[MultiLog]', 'First message');
      expect(mockProvider.log).toHaveBeenNthCalledWith(2, '[MultiLog]', 'Second message');
      expect(mockProvider.log).toHaveBeenNthCalledWith(3, '[MultiLog]', 'Third message');
    });
  });

  describe('error', () => {
    it('should call provider.error with prefix and message', () => {
      const mockProvider = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const logger = new Logger('ErrorApp', mockProvider);
      const message = 'This is an error message';
      
      logger.error(message);
      
      expect(mockProvider.error).toHaveBeenCalledTimes(1);
      expect(mockProvider.error).toHaveBeenCalledWith('[ErrorApp]', message);
    });

    it('should handle empty string error message', () => {
      const mockProvider = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const logger = new Logger('App', mockProvider);
      
      logger.error('');
      
      expect(mockProvider.error).toHaveBeenCalledWith('[App]', '');
    });

    it('should handle multiple error calls', () => {
      const mockProvider = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const logger = new Logger('ErrorLog', mockProvider);
      
      logger.error('Error 1');
      logger.error('Error 2');
      
      expect(mockProvider.error).toHaveBeenCalledTimes(2);
      expect(mockProvider.error).toHaveBeenNthCalledWith(1, '[ErrorLog]', 'Error 1');
      expect(mockProvider.error).toHaveBeenNthCalledWith(2, '[ErrorLog]', 'Error 2');
    });
  });

  describe('mixed log and error calls', () => {
    it('should handle both log and error calls independently', () => {
      const mockProvider = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const logger = new Logger('MixedApp', mockProvider);
      
      logger.log('Info message');
      logger.error('Error message');
      logger.log('Another info');
      
      expect(mockProvider.log).toHaveBeenCalledTimes(2);
      expect(mockProvider.error).toHaveBeenCalledTimes(1);
      expect(mockProvider.log).toHaveBeenNthCalledWith(1, '[MixedApp]', 'Info message');
      expect(mockProvider.error).toHaveBeenCalledWith('[MixedApp]', 'Error message');
      expect(mockProvider.log).toHaveBeenNthCalledWith(2, '[MixedApp]', 'Another info');
    });
  });

  describe('provider isolation', () => {
    it('should not affect other logger instances', () => {
      const provider1 = {
        log: vi.fn(),
        error: vi.fn(),
      };
      const provider2 = {
        log: vi.fn(),
        error: vi.fn(),
      };
      
      const logger1 = new Logger('Logger1', provider1);
      const logger2 = new Logger('Logger2', provider2);
      
      logger1.log('Message 1');
      logger2.log('Message 2');
      
      expect(provider1.log).toHaveBeenCalledWith('[Logger1]', 'Message 1');
      expect(provider2.log).toHaveBeenCalledWith('[Logger2]', 'Message 2');
      expect(provider1.log).not.toHaveBeenCalledWith('[Logger2]', 'Message 2');
      expect(provider2.log).not.toHaveBeenCalledWith('[Logger1]', 'Message 1');
    });
  });
});
