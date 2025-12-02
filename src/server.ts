/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'http';
import app from './app';
import config from './config';
import { seedSuperAdmin } from './helpers/seedSuperAdmin';
import prisma from './shared/prisma';

let server: Server;

const gracefulShutdown = async (reason: string, error?: any) => {
  console.log(`⚠️ ${reason} received... Server shutting down...`, error || '');

  try {
    if (server) {
      server.close(async () => {
        console.log('🧹 Closing server & disconnecting database...');
        await prisma.$disconnect();
        process.exit(1);
      });
    } else {
      await prisma.$disconnect();
      process.exit(1);
    }
  } catch (shutdownError) {
    console.error('❌ Error during shutdown:', shutdownError);
    process.exit(1);
  }
};

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    await seedSuperAdmin();

    // server = app.listen(config.port, "0.0.0.0", () => {
    //   console.log(`🚀 Application listening on port ${config.port}`);
    // });
    server = app.listen(config.port, () => {
      console.log(`🚀 Application listening on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', err => gracefulShutdown('SIGTERM', err));
process.on('SIGINT', err => gracefulShutdown('SIGINT', err));
process.on('unhandledRejection', err =>
  gracefulShutdown('Unhandled Rejection', err),
);
process.on('uncaughtException', err =>
  gracefulShutdown('Uncaught Exception', err),
);
