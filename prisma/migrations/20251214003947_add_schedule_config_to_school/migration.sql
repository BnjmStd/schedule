-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_schools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "scheduleStartTime" TEXT NOT NULL DEFAULT '09:00',
    "scheduleEndTime" TEXT NOT NULL DEFAULT '18:00',
    "blockDuration" INTEGER NOT NULL DEFAULT 60,
    "breakDuration" INTEGER NOT NULL DEFAULT 15,
    "lunchBreakEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lunchBreakStart" TEXT NOT NULL DEFAULT '13:00',
    "lunchBreakEnd" TEXT NOT NULL DEFAULT '14:00',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_schools" ("address", "createdAt", "email", "id", "name", "phone", "updatedAt") SELECT "address", "createdAt", "email", "id", "name", "phone", "updatedAt" FROM "schools";
DROP TABLE "schools";
ALTER TABLE "new_schools" RENAME TO "schools";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
