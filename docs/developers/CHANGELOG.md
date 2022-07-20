---
layout: default
nav_order: 4
---

# Changelog
All notable changes to this project will be documented in this file,
based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Base

- Use jestjs.io or vitest.dev for testing?
- Will the theme scroll the nav when 30+ games exist?
- gameData.private.component.filter((c) => ['base', 'exp'].includes(c.setId))

### Docs

- Write "Why commands without subcommands?" and about fallback.
- Private and public game data explanation.

### I Guess This Is It

- %igtii GAMEID abandon to end a game immediately.
- %igtii GAMEID log to see previous n actions.
- %igtii GAMEID status to get current playarea?
  - Should be a method so that start/reroll can use it too.
- Plan a game turn. How to handle editable? 
  1. (once only) %igtii GAMEID draw 1/2
     1. Can be skipped if previous player did a "use apology".
  2. (once only) %igtii GAMEID play LIE on memory/wish/apology/recognition
     1. Must be attached to previous card (can validate this).   
  3. (multiple times) %igtii GAMEID narrate []
  4. (once only) %igtii GAMEID use memory/wish/apology/recognition
     1. memory allows the whole cycle after draw to begin again.
     2. wish allows partner to "pass" a card.
     3. recognition allows current player to "pass" a card.
  5. (multiple times) %igtii GAMEID narrate []
     1. Only possible if player did a "use []".
  6. (once only) %igtii GAMEID end (ends the current turn)
     1. code would check synchronization check and move Goodbye Pile? 
- Plan how to end a game.
- Game data documentation.
- User-chosen setup should be possible.
- Add "P1" or "P2" somewhere, for two-handed play.

## [0.1.0] - 2022-07

### Added

- I Guess This Is It game stubbed out.
- Prisma database support stubbed out.
- GitHub Pages documentation stubbed out.
- Everything everything all at once is added. 
