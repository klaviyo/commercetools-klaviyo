import { createLogger, format, transports } from 'winston';
// import { LoggingWinston } from '@google-cloud/logging-winston';

// const loggingWinston = new LoggingWinston();

const logger = createLogger({
    transports: [
        new transports.Console(),
        // Add Cloud Logging
        // loggingWinston,
    ],
    format: format.json(),
});

export default logger;
