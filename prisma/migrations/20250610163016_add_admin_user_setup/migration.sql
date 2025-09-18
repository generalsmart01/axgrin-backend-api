-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "gender" TEXT,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExp" DATETIME,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationTokenExp" DATETIME,
    "lastVerificationEmailSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "emailVerificationToken", "emailVerificationTokenExp", "emailVerified", "firstName", "gender", "id", "lastName", "lastVerificationEmailSentAt", "password", "refreshToken", "resetToken", "resetTokenExp", "role", "updatedAt") SELECT "createdAt", "email", "emailVerificationToken", "emailVerificationTokenExp", "emailVerified", "firstName", "gender", "id", "lastName", "lastVerificationEmailSentAt", "password", "refreshToken", "resetToken", "resetTokenExp", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
