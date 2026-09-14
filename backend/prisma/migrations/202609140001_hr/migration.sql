ALTER TABLE "employees" ADD COLUMN "employeeCode" TEXT;
ALTER TABLE "employees" ADD COLUMN "employmentDate" TIMESTAMP(3);
ALTER TABLE "employees" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
UPDATE "employees" SET "employeeCode"='KF-'||substr(replace("id"::text,'-',''),1,8), "employmentDate"=CURRENT_TIMESTAMP WHERE "employeeCode" IS NULL;
ALTER TABLE "employees" ALTER COLUMN "employeeCode" SET NOT NULL;
ALTER TABLE "employees" ALTER COLUMN "employmentDate" SET NOT NULL;
CREATE UNIQUE INDEX "employees_employeeCode_key" ON "employees"("employeeCode");
CREATE TABLE "salary_profiles" (
 "id" UUID NOT NULL DEFAULT gen_random_uuid(), "employeeId" UUID NOT NULL,
 "salaryPasswordHash" TEXT NOT NULL, "failedAttempts" INTEGER NOT NULL DEFAULT 0,
 "lockedUntil" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "salary_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "salary_profiles_employeeId_key" ON "salary_profiles"("employeeId");
ALTER TABLE "salary_profiles" ADD CONSTRAINT "salary_profiles_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "salary_records" (
 "id" UUID NOT NULL DEFAULT gen_random_uuid(), "salaryProfileId" UUID NOT NULL,
 "period" VARCHAR(7) NOT NULL, "grossAmount" INTEGER NOT NULL, "netAmount" INTEGER NOT NULL,
 "currency" TEXT NOT NULL DEFAULT 'IRR', "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "salary_records_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "salary_records_salaryProfileId_period_key" ON "salary_records"("salaryProfileId","period");
CREATE INDEX "salary_records_period_idx" ON "salary_records"("period");
ALTER TABLE "salary_records" ADD CONSTRAINT "salary_records_salaryProfileId_fkey" FOREIGN KEY ("salaryProfileId") REFERENCES "salary_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "admin_logs" (
 "id" UUID NOT NULL DEFAULT gen_random_uuid(), "actorId" UUID, "action" TEXT NOT NULL, "entity" TEXT NOT NULL, "entityId" TEXT, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "admin_logs_actorId_createdAt_idx" ON "admin_logs"("actorId","createdAt");
CREATE INDEX "admin_logs_entity_entityId_createdAt_idx" ON "admin_logs"("entity","entityId","createdAt");
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
