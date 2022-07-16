import type { Game } from '@prisma/client';
import { container } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

/**
 * Determine if a user is authorized to modify a game.
 */
export function isValidGameUser(game: Game, userId: string): boolean {
	const state = JSON.parse(game.state);
	const validUsers = [process.env.BOT_OWNER_USERID, game.authorUserId];
	validUsers.push(...state.players.map((player: { id: string }) => player.id));
	return validUsers.includes(userId);
}

/**
 * Create users and add them as players to a game.
 */
export async function addGamePlayers(game: Game, players: (GuildMember | null)[]): Promise<void> {
	for (const player of players) {
		await container.prisma.user.upsert({
			where: { id: player!.id },
			update: { id: player!.id },
			create: { id: player!.id }
		});
		await container.prisma.gamePlayer.upsert({
			where: { gameId_userId: { gameId: game.id, userId: player!.id } },
			update: { gameId: game.id, userId: player!.id },
			create: { gameId: game.id, userId: player!.id }
		});
	}
}

/**
 * Delete players from a game.
 */
export async function removeGamePlayers(game: Game): Promise<void> {
	await container.prisma.gamePlayer.deleteMany({ where: { gameId: game.id } });
}
