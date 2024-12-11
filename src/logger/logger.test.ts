import fs from "fs";
import winston from "winston";

jest.mock('fs');
jest.mock('winston');
jest.mock('winston-daily-rotate-file');

describe('Logger', () => {
  beforeEach(() => {
    winston.format = {
        combine: jest.fn(),
        timestamp: jest.fn().mockReturnValue('timestamp-mock'),
        label: jest.fn(),
        json: jest.fn(),
        simple: jest.fn(),
    } as unknown as typeof winston.format;

    winston.transports = {
        Console: jest.fn(),
        DailyRotateFile: jest.fn(),
    } as unknown as typeof winston.transports;

    (winston.createLogger as jest.Mock).mockReturnValue({
      level: 'info',
      format: 'timestamp-mock',
      transports: [],
    });
  });

  it("should create log directory if it doesn't exist", () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    require('./logger'); 

    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('should create a winston instance with correct configuration', () => {
    require('./logger'); 
    expect(winston.createLogger).toHaveBeenCalled();
  });
});
