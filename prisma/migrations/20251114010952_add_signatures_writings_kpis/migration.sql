-- CreateTable
CREATE TABLE "digital_signatures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "signedBy" TEXT NOT NULL,
    "signatureData" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "signedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestamp" TEXT NOT NULL,
    "documentHash" TEXT,
    CONSTRAINT "digital_signatures_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "digital_signatures_signedBy_fkey" FOREIGN KEY ("signedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "writing_processes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_SIGNATURES',
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "agentId" TEXT,
    "buyerDocs" TEXT,
    "sellerDocs" TEXT,
    "notaryId" TEXT,
    "notaryName" TEXT,
    "notaryDate" DATETIME,
    "registeredAt" DATETIME,
    "registryNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "writing_processes_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "writing_processes_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "writing_processes_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "writing_processes_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "writing_processes_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "writing_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "writingId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performedBy" TEXT,
    "oldStatus" TEXT,
    "newStatus" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "writing_activities_writingId_fkey" FOREIGN KEY ("writingId") REFERENCES "writing_processes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "writing_activities_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "kpi_snapshots" (
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
    "avgSalePrice" REAL NOT NULL DEFAULT 0,
    "commissionEarned" REAL NOT NULL DEFAULT 0,
    "conversionRate" REAL NOT NULL DEFAULT 0,
    "closureRate" REAL NOT NULL DEFAULT 0,
    "avgDaysToClose" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kpi_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "contractId" TEXT,
    "writingId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_writingId_fkey" FOREIGN KEY ("writingId") REFERENCES "writing_processes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contract_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "placeholders" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "contract_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "digital_signatures_contractId_signedBy_key" ON "digital_signatures"("contractId", "signedBy");

-- CreateIndex
CREATE UNIQUE INDEX "writing_processes_contractId_key" ON "writing_processes"("contractId");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_snapshots_date_role_userId_key" ON "kpi_snapshots"("date", "role", "userId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
