-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "plan" TEXT NOT NULL DEFAULT 'free',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "stripeCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "monitors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "ip" TEXT,
    "port" INTEGER,
    "interval" INTEGER NOT NULL DEFAULT 300,
    "timeout" INTEGER NOT NULL DEFAULT 30,
    "httpMethod" TEXT DEFAULT 'GET',
    "expectedStatus" TEXT DEFAULT '200',
    "keyword" TEXT,
    "keywordType" TEXT,
    "headers" TEXT,
    "body" TEXT,
    "followRedirects" BOOLEAN NOT NULL DEFAULT true,
    "verifySsl" BOOLEAN NOT NULL DEFAULT true,
    "retryCount" INTEGER NOT NULL DEFAULT 2,
    "status" TEXT NOT NULL DEFAULT 'paused',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckAt" DATETIME,
    "lastDowntime" DATETIME,
    "lastUptime" DATETIME,
    "uptimePercentage" REAL,
    "avgResponseTime" REAL,
    "screenshotUrl" TEXT,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "monitors_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monitorId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTime" INTEGER,
    "errorMessage" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "region" TEXT DEFAULT 'us-east',
    CONSTRAINT "checks_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monitorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'major',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "acknowledgedAt" DATETIME,
    "acknowledgedBy" TEXT,
    "rootCause" TEXT,
    "notes" TEXT,
    CONSTRAINT "incidents_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "incident_updates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "incidentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    CONSTRAINT "incident_updates_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alert_contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alert_contacts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "monitor_alert_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monitorId" TEXT NOT NULL,
    "alertContactId" TEXT NOT NULL,
    "alertOnDown" BOOLEAN NOT NULL DEFAULT true,
    "alertOnUp" BOOLEAN NOT NULL DEFAULT true,
    "alertOnSlow" BOOLEAN NOT NULL DEFAULT false,
    "slowThreshold" INTEGER,
    CONSTRAINT "monitor_alert_rules_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "monitor_alert_rules_alertContactId_fkey" FOREIGN KEY ("alertContactId") REFERENCES "alert_contacts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "incidentId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "status_pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "customDomain" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "password" TEXT,
    "logoUrl" TEXT,
    "primaryColor" TEXT DEFAULT '#3b82f6',
    "showTitle" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "status_pages_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "status_page_monitors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "statusPageId" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "status_page_monitors_statusPageId_fkey" FOREIGN KEY ("statusPageId") REFERENCES "status_pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "status_page_monitors_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "maintenance_windows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monitorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "maintenance_windows_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT DEFAULT '#gray',
    "monitorId" TEXT NOT NULL,
    CONSTRAINT "tags_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "monitors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "api_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastUsed" DATETIME,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "api_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "stripeProductId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" DATETIME,
    "trialStart" DATETIME,
    "trialEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL,
    "invoiceUrl" TEXT,
    "invoicePdf" TEXT,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "workspaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "integrations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_userId_workspaceId_key" ON "workspace_members"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "monitors_slug_key" ON "monitors"("slug");

-- CreateIndex
CREATE INDEX "checks_monitorId_checkedAt_idx" ON "checks"("monitorId", "checkedAt");

-- CreateIndex
CREATE INDEX "incidents_monitorId_startedAt_idx" ON "incidents"("monitorId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "monitor_alert_rules_monitorId_alertContactId_key" ON "monitor_alert_rules"("monitorId", "alertContactId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "status_pages_slug_key" ON "status_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "status_page_monitors_statusPageId_monitorId_key" ON "status_page_monitors"("statusPageId", "monitorId");

-- CreateIndex
CREATE UNIQUE INDEX "api_tokens_token_key" ON "api_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripeSubscriptionId_key" ON "subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripeInvoiceId_key" ON "invoices"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "invoices_userId_createdAt_idx" ON "invoices"("userId", "createdAt");
