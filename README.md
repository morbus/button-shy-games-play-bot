
# Button Shy Games Play Bot

A Discord bot to facilitate asynchronous play of [Button Shy games](https://buttonshygames.com).

## Contributors

* Morbus Iff <[morbus@disobey.com](mailto:morbus@disobey.com)>

## Goals

1. To facilitate Discord asynchronous play of Button Shy games.
2. To become an invited bot of the official Button Shy Discord.
3. To ensure players each have their own physical copy of the game.
4. To teach and encourage interactions with the bot by watching the bot.
5. To learn Discord.js, Sapphire, and Prisma under Typescript.

## Documentation

@TODO Link to GitHub Pages.

## Installation

This section is only necessary if you intend to run your own Discord bot.

1. Run `npm install`.
2. Copy `config/default.json` to `config/local-development.json`.
3. Add your Discord bot token to `config/local-development.json`.
4. Add your Button Shy game data (below) to `config/local-development.json`.
5. Copy `config/local-development.json` to `config/local-production.json`.
6. For development, run `npm run start` for auto-restart on file changes.
7. For production, run `npm build` and `npm run start:production`.

## Button Shy game data

@TODO Describe high-level but include details in per-game GitHub Page.

## Why messages instead of slash commands?

- PRO: Message commands can do anything with enough effort.
- CON: Message commands require custom help, validation, etc.
- PRO: Slash commands allow autocompletion, hinting, choices, etc.
- CON: Slash commands are limited to 100 per bot.
    - There are more than 100 Button Shy games.
    - Let's remain hopeful that we'll implement them all ;)
    - Thus, we can't use `/{GAMENAME}` as we'll run out of space.
- CON: Can we make slash commands where the game is an option?
    - Possibly, but that'd require a lot more code scaffolding.
    - `/generate {GAMENAME} {PLAYER..} {OPTION..}`
    - `/start {GAMENAME} {PLAYER..} {OPTION..}`
    - `/turn {GAMENAME} {GAMEID} {OPTION..}`
    - This could get quite ugly for descriptive strings (in an RPG).
      - If we want to log and "replay" games, the bot needs everything.
      - Logging help asynchronous play across days without backscrolling.
      - `/turn {GAMENAME} {GAMEID} I am a long paragraph for an RPG turn.`
      - Then the bot would have to echo that back into the channel.
      - This, by itself, is probably the chief killer of slash commands.
- **DECISION:** Re-evaluate slash commands after a few games are implemented.
