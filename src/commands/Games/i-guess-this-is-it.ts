import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Args } from '@sapphire/framework';
import type { Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'IGuessThisIsIt',
	aliases: ['i-guess-this-is-it', 'igtii'],
	description: 'A two-player game about saying goodbye.'
})
export class IGuessThisIsItCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		this.container.logger.debug(message.content);
		const action = await args.pick('string');
		const gameId = await args.pick('number').catch(() => 0);
		const players = await args.repeat('member');
		const expansions = await args.repeat('string');

		await send(message, action);
		await send(message, gameId.toString());
		await send(message, players.join(' '));
		return send(message, expansions.join(' '));
	}
}
