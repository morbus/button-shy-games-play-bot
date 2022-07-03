import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { Args } from '@sapphire/framework';
import type { Message } from 'discord.js';
import gameData from '../../game-data/i-guess-this-is-it.json';

@ApplyOptions<CommandOptions>({
	name: 'IGuessThisIsIt',
	aliases: ['i-guess-this-is-it', 'igtii'],
	description: 'A two-player game about saying goodbye.'
})
export class IGuessThisIsItCommand extends Command {
	public override async messageRun(message: Message, args: Args) {
		this.container.logger.debug(message.content);
		this.container.logger.debug(gameData.relationships);

		const gameId = await args.pick('number').catch(() => 0);
		const action = await args.pick('string').catch(() => 'help');
		const players = await args.repeat('member').catch(() => message.author);

		this.container.logger.debug(gameId);
		this.container.logger.debug(action);
		this.container.logger.debug(players);

		return send(message, action);
	}
}
