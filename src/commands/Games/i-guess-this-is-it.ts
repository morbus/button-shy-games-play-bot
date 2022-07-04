import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptions } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import { send } from '@sapphire/plugin-editable-commands';
import gameData from '../../game-data/i-guess-this-is-it.json';
import type { Args } from '@sapphire/framework';
import type { GuildMember, Message } from 'discord.js';

@ApplyOptions<CommandOptions>({
	name: 'IGuessThisIsIt',
	aliases: ['i-guess-this-is-it', 'igtii'],
	description: 'A two-player game about saying goodbye.'
})
export class IGuessThisIsItCommand extends Command {
	// @BOTNAME IGuessThisIsIt [GAMEID] ACTION [PLAYERS] [OPTIONS]
	public override async messageRun(message: Message, args: Args) {
		this.container.logger.debug(message.content);
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
		const relationship = this.arrayShuffle(this.arrayShuffle(gameData.public.relationships).shift());
		const reasonForSayingGoodbye = this.arrayShuffle(gameData.public.reasonsForSayingGoodbye).shift();
		const location = this.arrayShuffle(gameData.public.locations).shift();

		players = this.arrayShuffle(players);
		const playerLeaving = players[0] ? players[0].displayName : 'Player 1';
		const playerStaying = players[1] ? players[1].displayName : 'Player 2';

		const embed = new MessageEmbed()
			.setColor('#d8d2cd')
			.setTitle('#@TODO GAMEID: I Guess This Is It')
			.setThumbnail('https://github.com/morbus/button-shy-games-play-bot/raw/main/docs/assets/i-guess-this-is-it--cover.png')
			.setDescription('@TODO HELP')
			.addField(`${playerLeaving} roleplays as`, `a ${relationship.shift()} saying goodbye because ${reasonForSayingGoodbye}.`, true)
			.addField(`${playerStaying} roleplays as`, `a ${relationship.shift()} who is staying.`, true)
			.addField('Location', location, true);
		return message.reply({ embeds: [embed] });
	}

	public async start(message: Message, gameId: number) {
		this.container.logger.debug(gameId);
		return send(message, 'inside start');
	}

	/**
	 * From https://github.com/sindresorhus/array-shuffle.
	 * @todo Move this to a library thing and explain Error
	 * when loading Error [ERR_REQUIRE_ESM]: require() of ES Module array-shuffle/index.js is not supported.
	 * @param array
	 */
	public arrayShuffle(array: Array<any>) {
		array = [...array];

		for (let index = array.length - 1; index > 0; index--) {
			const newIndex = Math.floor(Math.random() * (index + 1));
			[array[index], array[newIndex]] = [array[newIndex], array[index]];
		}

		return array;
	}
}
