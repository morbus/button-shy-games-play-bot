/**
 * General utilities that don't fit other places.
 */
import { inlineCode } from '@discordjs/builders';
import { container } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

/**
 * Once a game has been started, create and relate its players.
 */
export async function addGamePlayers(gameId: number, players: (GuildMember | null)[]): Promise<void> {
	for (const player of players) {
		await container.prisma.user.upsert({
			where: { id: player!.id },
			update: { id: player!.id },
			create: { id: player!.id }
		});
		await container.prisma.gamePlayer.upsert({
			where: { gameId_userId: { gameId, userId: player!.id } },
			update: { gameId, userId: player!.id },
			create: { gameId, userId: player!.id }
		});
	}
}

/**
 * Returns an array of game component public names.
 */
export function componentsNameInlineCode(components: Array<any>): Array<string> {
	return components.map((component) => `${inlineCode(component.publicName)}`);
}

/**
 * Shuffle an array using the Durstenfeld algorithm, based on Fisher–Yates.
 *
 * Copied from https://github.com/sindresorhus/array-shuffle so we needn't
 * deal with "[ERR_REQUIRE_ESM]: require() of ES Module is not supported".
 */
export function shuffle(array: Array<any>): Array<any> {
	array = [...array];

	for (let index = array.length - 1; index > 0; index--) {
		const newIndex = Math.floor(Math.random() * (index + 1));
		[array[index], array[newIndex]] = [array[newIndex], array[index]];
	}

	return array;
}
