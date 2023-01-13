import { createLogger, transports } from 'winston';
// import { LoggingWinston } from '@google-cloud/logging-winston';

// const loggingWinston = new LoggingWinston();

const logger = createLogger({
    transports: [
        new transports.Console(),
        // Add Cloud Logging
        // loggingWinston,
    ],
});

export default logger;
