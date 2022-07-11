import { Prisma, PrismaClient } from '@prisma/client';
import { container, LogLevel, SapphireClient } from '@sapphire/framework';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import dotenv from 'dotenv';

dotenv.config();

export default class ButtonShyClient extends SapphireClient {
	public constructor() {
		super({
			caseInsensitiveCommands: true,
			caseInsensitivePrefixes: true,
			defaultPrefix: process.env.BOT_PREFIX,
			intents: [
				'DIRECT_MESSAGES',
				'DIRECT_MESSAGE_REACTIONS',
				'GUILDS',
				'GUILD_EMOJIS_AND_STICKERS',
				'GUILD_MESSAGES',
				'GUILD_MESSAGE_REACTIONS'
			],
			logger: { level: LogLevel.Debug }
		});

		container.prisma = new PrismaClient({
			errorFormat: 'pretty',
			log: [
				{ level: 'error', emit: 'event' },
				{ level: 'info', emit: 'event' },
				{ level: 'query', emit: 'event' },
				{ level: 'warn', emit: 'event' }
			]
		});

		container.prisma.$on('error', (event) => {
			container.logger.error(event.message);
		});

		container.prisma.$on('info', (event) => {
			container.logger.info(event.message);
		});

		container.prisma.$on('query', (event) => {
			container.logger.debug(`Query [${event.duration}ms]: ${event.query} ${event.params}`);
		});

		container.prisma.$on('warn', (event) => {
			container.logger.warn(event.message);
		});

		void container.prisma.$connect();
	}

	public override async destroy() {
		await container.prisma.$disconnect();
		return super.destroy();
	}
}

declare module '@sapphire/pieces' {
	interface Container {
		prisma: PrismaClient<Prisma.PrismaClientOptions, 'error' | 'info' | 'query' | 'warn'>;
	}
}
