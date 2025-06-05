import pino from 'pino';

const logger = pino({
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                options: { colorize: true },
                level: 'info'
            },
            {
                target: 'pino/file',
                options: { destination: './logs/app.log' },
                level: 'info'
            }
        ], // aktifkan output human-readable
        options: {
            colorize: true,
            translateTime: 'SYS:standard', // waktu format biasa
            ignore: 'pid,hostname' // bisa hilangkan field yang tidak penting
        }
    }
});

export default logger;
