/*
  Warnings:

  - Made the column `customerEmail` on table `cart_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customerName` on table `cart_items` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cart_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "petName" TEXT NOT NULL,
    "petType" TEXT NOT NULL,
    "bookingDate" DATETIME NOT NULL,
    "bookingTime" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cart_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_cart_items" ("bookingDate", "bookingTime", "createdAt", "customerEmail", "customerName", "id", "petName", "petType", "serviceId", "userId") SELECT "bookingDate", "bookingTime", "createdAt", "customerEmail", "customerName", "id", "petName", "petType", "serviceId", "userId" FROM "cart_items";
DROP TABLE "cart_items";
ALTER TABLE "new_cart_items" RENAME TO "cart_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
