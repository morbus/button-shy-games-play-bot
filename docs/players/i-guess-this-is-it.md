---
layout: default
parent: For Players
---

# I Guess This Is It

![I Guess This Is It cover](../assets/i-guess-this-is-it--cover.png){: width="200px" .float-right }

_We had such a good run. We were great together. Now we stand in front of each
other, just minutes before our last goodbye. There’s so much to say. And so
much we know will be left unsaid._
{: .fs-6 .fw-300 }

* Buy a physical copy of [I Guess This Is It at Button Shy Games](https://buttonshygames.com/products/i-guess-this-is-it-1).
* Buy a print & play copy of [I Guess This Is It at PNPArcade](https://www.pnparcade.com/products/i-guess-this-is-it).

## Prerequisites 

To play this game using the Button Shy Games Play Bot, all players must own a copy.

This game can be referenced as `IGuessThisIsIt`, `i-guess-this-is-it`, or `igtii`.

## Start a game

<div class="discord-messages">
  <div class="discord-message">
    <div class="discord-message-content">
      <div class="discord-author-avatar">
        <img src="https://cdn.discordapp.com/avatars/210832949904408577/de284c63bedc8a161782e959288bda2b.png" alt="">
      </div>
      <div class="discord-message-body">
        <div class="discord-message-author">
          <span class="discord-author-info"><span class="discord-author-username">Morbus Iff</span></span>
          <span class="discord-message-timestamp">Today at 3:21 PM</span>
        </div>
        <div class="discord-message-text">
          %igtii start <span class="discord-mention">@PLAYER1</span> <span class="discord-mention">@PLAYER2</span>
        </div>
      </div>
    </div>
  </div>
</div>

| Arguments           | Description                                                  |
|---------------------|--------------------------------------------------------------|
| `%igtii`            | **Required.** The game name you want to play.                |
| `start`             | **Required.** The game action you want to take.              |
| `@PLAYER1 @PLAYER2` | **Required.** The two player mentions to start the game for. |

## Draw 1 or 2 Story cards from the grid

<div class="discord-messages">
  <div class="discord-message">
    <div class="discord-message-content">
      <div class="discord-author-avatar">
        <img src="https://cdn.discordapp.com/avatars/210832949904408577/de284c63bedc8a161782e959288bda2b.png" alt="">
      </div>
      <div class="discord-message-body">
        <div class="discord-message-author">
          <span class="discord-author-info"><span class="discord-author-username">Morbus Iff</span></span>
          <span class="discord-message-timestamp">Today at 5:13 PM</span>
        </div>
        <div class="discord-message-text">
          %igtii 12345 draw 1
        </div>
      </div>
    </div>
  </div>
</div>

| Arguments | Description                                            |
|-----------|--------------------------------------------------------|
| `%igtii`  | **Required.** The game name you want to play.          |
| `GAMEID`  | **Required.** The unique ID that represents your game. |
| `draw`    | **Required.** The game action you want to take.        |
| `NUMBER`  | **Required.** The number of cards to draw: `1` or `2`. |

## Play a Story card from your hand

<div class="discord-messages">
  <div class="discord-message">
    <div class="discord-message-content">
      <div class="discord-author-avatar">
        <img src="https://cdn.discordapp.com/avatars/210832949904408577/de284c63bedc8a161782e959288bda2b.png" alt="">
      </div>
      <div class="discord-message-body">
        <div class="discord-message-author">
          <span class="discord-author-info"><span class="discord-author-username">Morbus Iff</span></span>
          <span class="discord-message-timestamp">Today at 6:58 PM</span>
        </div>
        <div class="discord-message-text">
          %igtii 12345 play PAS on MEMORY
        </div>
      </div>
    </div>
  </div>
</div>

| Arguments     | Description                                                                                   |
|---------------|-----------------------------------------------------------------------------------------------|
| `%igtii`      | **Required.** The game name you want to play.                                                 |
| `GAMEID`      | **Required.** The unique ID that represents your game.                                        |
| `play`        | **Required.** The game action you want to take.                                               |
| `CARD`        | **Required.** The name of the Story card you're playing (ex. `BAR`).                          |
| `on LINKTYPE` | **Required.** The link type you're connecting: `MEMORY`, `WISH`, `APOLOGY`, or `RECOGNITION`. |  
