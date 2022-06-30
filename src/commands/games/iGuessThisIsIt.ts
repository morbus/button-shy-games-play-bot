import { Command } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class IGuessThisIsItCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: '',
			aliases: [''],
			description: ''
		});
	}

	public async messageRun(message: Message) {
		await message.channel.send('Ping?');
	}
}
