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
		const gameId = await args.pick('number').catch(() => 0);
		const action = await args.pick('string').catch(() => 'help');

		switch (action) {
			case 'generate': {
				return this.generate(message, args);
			}

			case 'start': {
				return this.start(message, args, gameId);
			}
		}

		return this.help(message, args);
	}

	public async help(message: Message, args: Args) {
		this.container.logger.debug(args);
		return send(message, 'inside help');
	}

	public async generate(message: Message, args: Args) {
		// const randomElement = array[Math.floor(Math.random() * array.length)];
		this.container.logger.debug(gameData.public.relationships);
		const players = await args.repeat('member').catch(() => message.author);
		this.container.logger.debug(players);
		return send(message, 'inside generate');
	}

	public async start(message: Message, args: Args, gameId: number) {
		this.container.logger.debug(args);
		this.container.logger.debug(gameId);
		return send(message, 'inside start');
	}
}
