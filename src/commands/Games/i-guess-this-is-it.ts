import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import { send } from '@sapphire/plugin-editable-commands';
import type { Args } from '@sapphire/framework';
import type { GuildMember, Message } from 'discord.js';
import gameData from '../../game-data/i-guess-this-is-it.json';

@ApplyOptions<CommandOptions>({
	name: 'IGuessThisIsIt',
	aliases: ['i-guess-this-is-it', 'igtii'],
	description: 'A two-player game about saying goodbye.'
})
export class IGuessThisIsItCommand extends Command {
	// @BOTNAME IGuessThisIsIt [GAMEID] ACTION [PLAYERS] [OPTIONS]
	public override async messageRun(message: Message, args: Args) {
		const gameId = await args.pick('number').catch(() => 0);
		const action = await args.pick('string').catch(() => 'help');
		const players = await args.repeat('member').catch(() => [message.member]);

		switch (action) {
			case 'generate': {
				return this.generate(message, players);
			}

			case 'start': {
				return this.start(message, gameId);
			}
		}

		return null;
	}

	// @BOTNAME IGuessThisIsIt generate
	// @BOTNAME IGuessThisIsIt generate @PLAYER1
	// @BOTNAME IGuessThisIsIt generate @PLAYER1 @PLAYER2 --with-setup
	public async generate(message: Message, players: (GuildMember | null)[]) {
		// const randomElement = array[Math.floor(Math.random() * array.length)];
		this.container.logger.debug(players);
		this.container.logger.debug(gameData.public.relationships);
		this.container.logger.debug(message.content);
		//this.container.logger.debug(players);

		const embed = new MessageEmbed()
			.setColor('#ff0000')
			.setTitle('I Guess This Is It #1231')
			.setThumbnail('https://github.com/morbus/button-shy-games-play-bot/raw/main/docs/assets/i-guess-this-is-it--cover.png')
			.setDescription('Game ID #1231')
			.addField('Player 1', "roleplays as a soldier who is saying goodbye because they're going to space.", true)
			.addField('@MorbusIff', 'roleplays as a soldier who is staying.', true)
			.addField('Location', 'a school yard');
		return message.reply({ embeds: [embed] });
	}

	public async start(message: Message, gameId: number) {
		this.container.logger.debug(gameId);
		return send(message, 'inside start');
	}
}
