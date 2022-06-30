import { LogLevel, SapphireClient } from '@sapphire/framework';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import config from 'config';

const client = new SapphireClient({
	caseInsensitiveCommands: true,
	intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'],
	logger: { level: LogLevel.Debug },
	shards: 'auto'
});

const main = async () => {
	try {
		client.logger.info('Logging in to Discord.');
		await client.login(config.get('botDiscordToken'));
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}
};

void main();
