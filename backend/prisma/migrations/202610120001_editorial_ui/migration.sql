-- AlterTable
ALTER TABLE "news" ADD COLUMN     "sourceRank" INTEGER,
ADD COLUMN     "sourceSeenAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "salary_profiles" ALTER COLUMN "salaryPasswordHash" DROP NOT NULL;

