---
layout: default
nav_order: 4
---

# Changelog
All notable changes to this project will be documented in this file,
based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

- Add in all the Sapphire and Discord plugins, cos why not?
- Copy Sapphire CSS for Discord-like HTML and use in docs.
- Write "Why commands without subcommands?" and talk about fallback.
- Create state interface documentation?
  https://bobbyhadz.com/blog/typescript-add-property-to-object
  https://bobbyhadz.com/blog/typescript-import-interface-from-another-file
- Can we cast our game-data JSON into a Typescript typed object too?
- Use jestjs.io to automate testing of discord bots?
- https://stackoverflow.com/questions/65980280/discord-js-get-member-from-user-id
- "start game from GAMEID" functionality, for like-minded fun?
- Will the theme scrollbar the nav when 100 games exist?
- I Guess This Is It: And the "how to take a turn" starter to "start".
- I Guess This Is It: Start planning a game turn. How to handle editable?
  1. (once only) IGTII 1234 draw [1..2] (shows updated grid)
     1. Can be skipped if previous player did a "use apology".
     2. Rerolling must fail once played. canReroll in state?
  2. (once only) IGTII 1234 play LIE on [memory|wish|apology|recognition]
     1. Must be attached to previous card (can validate this).   
  3. (multiple times) IGTII 1234 narrate []
  4. (once only) IGTII 1234 use [memory|wish|apology|recognition]
     1. memory allows the whole cycle after draw to begin again.
     2. wish allows partner to "pass" a card.
     3. recognition allows current player to "pass" a card.
  5. (multiple times) IGTII 1234 narrate []
     1. Only possible if player did a "use []".
  6. (once only) IGTII 1234 end (ends the current turn)
     1. code would check synchronization check and move GBP? 
- I Guess This Is It: Start planning how to end a game.
- I Guess This Is It: Game data documentation.
- I Guess This Is It: User-chosen setup should be possible.
- I Guess This Is It: Add "P1" or "P2" somewhere, for two-handed play.
- base + expansion cards: (gameData.private.storyCards.filter((storyCard) => ['base', 'noWonder'].includes(storyCard.setId)));

## [0.1.0] - 2022-07

### Added

- I Guess This Is It game stubbed out.
- Prisma database support stubbed out.
- GitHub Pages documentation stubbed out.
- Everything everything all at once is added. 
