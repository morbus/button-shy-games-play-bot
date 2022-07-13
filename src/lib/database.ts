/**
 * Functions for interacting with the database.
 */
import { container } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

/**
 * Create users and add them as players to a game.
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
 * Delete players from a game.
 */
export async function removeGamePlayers(gameId: number): Promise<void> {
	await container.prisma.gamePlayer.deleteMany({ where: { gameId } });
}
