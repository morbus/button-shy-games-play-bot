/**
 * Button Shy Games Play Bot
 * @author Morbus Iff <morbus@disobey.com>
 *
 * Starts the Button Shy Games Play Bot.
 */
import ButtonShyClient from '#lib/ButtonShyClient';

const main = async () => {
	const client = new ButtonShyClient();

	try {
		await client.login(process.env.BOT_TOKEN);
		client.logger.info(`Logged in to Discord as ${client.user!.tag}.`);
	} catch (error) {
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();
