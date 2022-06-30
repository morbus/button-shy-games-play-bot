import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Args } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	name: 'IGuessThisIsIt',
	aliases: ['igtii'],
	subCommands: ['randomSetup'],
	description: 'A two-player game about saying goodbye.'
})
export class IGuessThisIsItCommand extends SubCommandPluginCommand {
	public async randomSetup(message: Message, args: Args) {
		this.container.logger.debug(message.content);
		const players = await args.repeat('member');
		const expansions = await args.repeat('string');

		await send(message, players.join(' '));
		return send(message, expansions.join(' '));
	}
}
