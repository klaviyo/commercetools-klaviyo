// import bunyan from "bunyan";

const loggerName = process.env.SERVICE || 'to_be_defined';

// export const rootLogger = bunyan.createLogger({ name: loggerName });

type LoggerOptions = {
    correlationId: string;
    level: string;
};

// export const createChildLogger = (loggerOptions: LoggerOptions): void => {
//     const child = rootLogger.child(loggerOptions);
//     global.LOG = child;
// };

// createChildLogger({ correlationId: 'unset', awsCorrelationId: 'unset', level: 'info' });

// export const log = (): bunyan => {
//     return global.LOG;
// };
//todo implement package agnostic logger https://stackoverflow.com/questions/72722457/how-do-i-implement-generic-package-agnostic-logging-for-a-node-js-project
