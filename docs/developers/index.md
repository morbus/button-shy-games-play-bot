---
has_children: true
layout: default
nav_order: 3
---

# For Developers

## Installation

1. Run `npm install`.
2. Copy the `.env.example` file to `.env`.
3. Edit `.env` to configure the bot and its authentication.
4. Run `npx prisma migrate deploy` to create the database.
5. Run `npx prisma generate` to update the Prisma Client API.
6. Copy the `src/game-data-examples` directory to `src/game-data`.
7. Within `src/game-data`, find the game you want the bot to run.
   1. Edit `GAME.json` to define `private` game data (see below).
   2. Do not distribute `private` game data from your `GAME.json` files.
8. For development, run `npm run start` for auto-restart on file changes.
9. For production, run `npm run build` and `npm run start:production`.

## `private` game data

@todo

## Why messages instead of slash commands?

- PRO: Message commands can do anything with enough effort.
- CON: Message commands require custom help, validation, etc.
- PRO: Slash commands allow autocompletion, hinting, choices, etc.
- CON: Slash commands are limited to 100 per bot.
  - There are more than 100 Button Shy games.
  - Let's grossly assume we'll implement them all ;)
  - We can't use `/{GAMENAME}` as we'd run out of space.
- PRO: We could make slash commands where the game is an option.
  - `/generate {GAMENAME} {PLAYER..} {OPTION..}`
  - `/start {GAMENAME} {PLAYER..} {OPTION..}`
  - `/turn {GAMENAME} {GAMEID} {OPTION..}`
  - CON: This could get ugly for paragraph long strings (in an RPG).
    - If we want to log and "replay" games, the bot needs everything.
    - Logging helps asynchronous play across days without backscrolling.
    - `/turn {GAMENAME} {GAMEID} I am a long paragraph for an RPG turn.`
- **DECISION:** Re-evaluate slash commands after a few games are implemented.
- **CONSIDER:** Why not implement _both_ messages and slash commands?
