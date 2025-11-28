-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_kpi_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" TEXT NOT NULL,
    "userId" TEXT,
    "activeProperties" INTEGER NOT NULL DEFAULT 0,
    "appointmentsTotal" INTEGER NOT NULL DEFAULT 0,
    "appointmentsCompleted" INTEGER NOT NULL DEFAULT 0,
    "offersCreated" INTEGER NOT NULL DEFAULT 0,
    "offersAccepted" INTEGER NOT NULL DEFAULT 0,
    "contractsSigned" INTEGER NOT NULL DEFAULT 0,
    "contractsClosed" INTEGER NOT NULL DEFAULT 0,
    "totalSalesValue" REAL NOT NULL DEFAULT 0,
    "commissionEarned" REAL NOT NULL DEFAULT 0,
    "conversionRate" REAL NOT NULL DEFAULT 0,
    "closureRate" REAL NOT NULL DEFAULT 0,
    "avgSalePrice" REAL NOT NULL DEFAULT 0,
    "avgDaysToClose" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_kpi_snapshots" ("activeProperties", "appointmentsCompleted", "appointmentsTotal", "avgDaysToClose", "avgSalePrice", "closureRate", "commissionEarned", "contractsClosed", "contractsSigned", "conversionRate", "createdAt", "date", "id", "offersAccepted", "offersCreated", "role", "totalSalesValue", "userId") SELECT "activeProperties", "appointmentsCompleted", "appointmentsTotal", "avgDaysToClose", "avgSalePrice", "closureRate", "commissionEarned", "contractsClosed", "contractsSigned", "conversionRate", "createdAt", "date", "id", "offersAccepted", "offersCreated", "role", "totalSalesValue", "userId" FROM "kpi_snapshots";
DROP TABLE "kpi_snapshots";
ALTER TABLE "new_kpi_snapshots" RENAME TO "kpi_snapshots";
CREATE UNIQUE INDEX "kpi_snapshots_date_role_userId_key" ON "kpi_snapshots"("date", "role", "userId");
CREATE TABLE "new_properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "operation" TEXT NOT NULL DEFAULT 'SALE',
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area" REAL,
    "landArea" REAL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "features" TEXT,
    "images" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_properties" ("address", "area", "bathrooms", "bedrooms", "city", "createdAt", "currency", "description", "features", "id", "images", "isActive", "landArea", "latitude", "longitude", "ownerId", "price", "state", "status", "title", "type", "updatedAt", "zipCode") SELECT "address", "area", "bathrooms", "bedrooms", "city", "createdAt", "currency", "description", "features", "id", "images", "isActive", "landArea", "latitude", "longitude", "ownerId", "price", "state", "status", "title", "type", "updatedAt", "zipCode" FROM "properties";
DROP TABLE "properties";
ALTER TABLE "new_properties" RENAME TO "properties";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "emailVerified" DATETIME,
    "verificationCode" TEXT,
    "verificationExpiresAt" DATETIME,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" DATETIME,
    "bannedReason" TEXT,
    "bannedBy" TEXT,
    "assignedAgentId" TEXT,
    "assignedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("avatar", "bannedAt", "bannedBy", "bannedReason", "createdAt", "email", "emailVerified", "id", "isBanned", "name", "password", "phone", "role", "updatedAt", "verificationCode", "verificationExpiresAt") SELECT "avatar", "bannedAt", "bannedBy", "bannedReason", "createdAt", "email", "emailVerified", "id", "isBanned", "name", "password", "phone", "role", "updatedAt", "verificationCode", "verificationExpiresAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
