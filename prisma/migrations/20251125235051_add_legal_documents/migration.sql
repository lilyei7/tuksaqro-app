-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "predialUploaded" BOOLEAN NOT NULL DEFAULT false,
    "predialVerified" BOOLEAN NOT NULL DEFAULT false,
    "predialUrl" TEXT,
    "ineUploaded" BOOLEAN NOT NULL DEFAULT false,
    "ineVerified" BOOLEAN NOT NULL DEFAULT false,
    "ineUrl" TEXT,
    "comprobanteDomicilioUploaded" BOOLEAN NOT NULL DEFAULT false,
    "comprobanteDomicilioVerified" BOOLEAN NOT NULL DEFAULT false,
    "comprobanteDomicilioUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_properties" ("address", "area", "bathrooms", "bedrooms", "city", "createdAt", "currency", "description", "features", "id", "images", "isActive", "landArea", "latitude", "longitude", "operation", "ownerId", "price", "state", "status", "title", "type", "updatedAt", "zipCode") SELECT "address", "area", "bathrooms", "bedrooms", "city", "createdAt", "currency", "description", "features", "id", "images", "isActive", "landArea", "latitude", "longitude", "operation", "ownerId", "price", "state", "status", "title", "type", "updatedAt", "zipCode" FROM "properties";
DROP TABLE "properties";
ALTER TABLE "new_properties" RENAME TO "properties";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
