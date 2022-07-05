import ButtonShyClient from '#lib/ButtonShyClient';

const client = new ButtonShyClient();

const main = async () => {
	try {
		await client.login(process.env.BOT_TOKEN);
		client.logger.info(`Logged in to Discord as username ${client.user!.username}.`);
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();
