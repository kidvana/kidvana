const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ── Graceful Shutdown ──
function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        console.log('HTTP server closed');

        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        } catch (err) {
            console.error('Error closing MongoDB:', err.message);
        }

        process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
        console.error('Graceful shutdown timed out. Forcing exit.');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});
