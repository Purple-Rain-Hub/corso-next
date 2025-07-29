/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "users";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bookings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "petName" TEXT NOT NULL,
    "petType" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "bookingDate" DATETIME NOT NULL,
    "bookingTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_bookings" ("bookingDate", "bookingTime", "createdAt", "customerEmail", "customerName", "id", "notes", "petName", "petType", "serviceId", "status", "updatedAt", "userId") SELECT "bookingDate", "bookingTime", "createdAt", "customerEmail", "customerName", "id", "notes", "petName", "petType", "serviceId", "status", "updatedAt", "userId" FROM "bookings";
DROP TABLE "bookings";
ALTER TABLE "new_bookings" RENAME TO "bookings";
CREATE TABLE "new_cart_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "petName" TEXT NOT NULL,
    "petType" TEXT NOT NULL,
    "bookingDate" DATETIME NOT NULL,
    "bookingTime" TEXT NOT NULL,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cart_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_cart_items" ("bookingDate", "bookingTime", "createdAt", "customerEmail", "customerName", "id", "petName", "petType", "serviceId", "userId") SELECT "bookingDate", "bookingTime", "createdAt", "customerEmail", "customerName", "id", "petName", "petType", "serviceId", "userId" FROM "cart_items";
DROP TABLE "cart_items";
ALTER TABLE "new_cart_items" RENAME TO "cart_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
