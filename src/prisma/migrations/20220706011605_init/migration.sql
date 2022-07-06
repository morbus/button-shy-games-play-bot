-- CreateTable
CREATE TABLE "games" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" DATETIME NOT NULL,
    "parentGameId" INTEGER NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "waitingOnUserId" TEXT NOT NULL,
    "ended" BOOLEAN NOT NULL DEFAULT false,
    "state" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "games_users" (
    "gameId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    PRIMARY KEY ("gameId", "userId"),
    CONSTRAINT "games_users_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "games_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
