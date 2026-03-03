-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF', 'VIEWER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'INCOMPLETE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "activeAcademicLevels" TEXT NOT NULL DEFAULT 'BASIC,MIDDLE',
    "scheduleStartTime" TEXT NOT NULL DEFAULT '08:00',
    "scheduleEndTime" TEXT NOT NULL DEFAULT '17:00',
    "blockDuration" INTEGER NOT NULL DEFAULT 45,
    "breakDuration" INTEGER NOT NULL DEFAULT 15,
    "lunchBreakEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lunchBreakConfig" TEXT NOT NULL DEFAULT '{"MONDAY":{"enabled":true,"start":"13:00","end":"14:00"},"TUESDAY":{"enabled":true,"start":"13:00","end":"14:00"},"WEDNESDAY":{"enabled":true,"start":"13:00","end":"14:00"},"THURSDAY":{"enabled":true,"start":"13:00","end":"14:00"},"FRIDAY":{"enabled":true,"start":"13:00","end":"14:00"}}',
    "lunchBreakStart" TEXT NOT NULL DEFAULT '13:00',
    "lunchBreakEnd" TEXT NOT NULL DEFAULT '14:00',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_level_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicLevel" TEXT NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '08:00',
    "endTime" TEXT NOT NULL DEFAULT '17:00',
    "blockDuration" INTEGER NOT NULL DEFAULT 45,
    "breaks" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_level_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_level_config_history" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicLevel" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "blockDuration" INTEGER NOT NULL,
    "breaks" TEXT NOT NULL,
    "changedBy" TEXT,
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_level_config_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "specialization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_availability" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_availability_exceptions" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_availability_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_workload_limits" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "maxBlocksPerDay" INTEGER NOT NULL DEFAULT 6,
    "maxBlocksPerWeek" INTEGER NOT NULL DEFAULT 30,
    "preferredStartTime" TEXT,
    "preferredEndTime" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_workload_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_subjects" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "academicLevel" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "studentCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_subject_requirements" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "blocksPerWeek" INTEGER NOT NULL,
    "preferredTeacherId" TEXT,
    "maxConsecutiveBlocks" INTEGER NOT NULL DEFAULT 2,
    "preferredDays" TEXT NOT NULL DEFAULT '[]',
    "avoidAfterLunch" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_subject_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "academicYear" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configSnapshot" TEXT,
    "isDeprecated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_blocks" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "academicYear" INTEGER NOT NULL DEFAULT 2026,
    "classroom" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_subscriptions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_history" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "oldPlan" "SubscriptionPlan" NOT NULL,
    "newPlan" "SubscriptionPlan" NOT NULL,
    "oldStatus" "SubscriptionStatus" NOT NULL,
    "newStatus" "SubscriptionStatus" NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_events" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_schoolId_idx" ON "users"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "schedule_level_configs_schoolId_idx" ON "schedule_level_configs"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_level_configs_schoolId_academicLevel_key" ON "schedule_level_configs"("schoolId", "academicLevel");

-- CreateIndex
CREATE INDEX "schedule_level_config_history_configId_idx" ON "schedule_level_config_history"("configId");

-- CreateIndex
CREATE INDEX "schedule_level_config_history_schoolId_idx" ON "schedule_level_config_history"("schoolId");

-- CreateIndex
CREATE INDEX "schedule_level_config_history_createdAt_idx" ON "schedule_level_config_history"("createdAt");

-- CreateIndex
CREATE INDEX "schedule_level_config_history_schoolId_academicLevel_create_idx" ON "schedule_level_config_history"("schoolId", "academicLevel", "createdAt");

-- CreateIndex
CREATE INDEX "teachers_schoolId_idx" ON "teachers"("schoolId");

-- CreateIndex
CREATE INDEX "teacher_availability_teacherId_idx" ON "teacher_availability"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_availability_teacherId_academicYear_idx" ON "teacher_availability"("teacherId", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_availability_teacherId_academicYear_dayOfWeek_start_key" ON "teacher_availability"("teacherId", "academicYear", "dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "teacher_availability_exceptions_teacherId_idx" ON "teacher_availability_exceptions"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_availability_exceptions_teacherId_date_idx" ON "teacher_availability_exceptions"("teacherId", "date");

-- CreateIndex
CREATE INDEX "teacher_availability_exceptions_date_idx" ON "teacher_availability_exceptions"("date");

-- CreateIndex
CREATE INDEX "teacher_workload_limits_schoolId_academicYear_idx" ON "teacher_workload_limits"("schoolId", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_workload_limits_teacherId_academicYear_key" ON "teacher_workload_limits"("teacherId", "academicYear");

-- CreateIndex
CREATE INDEX "subjects_schoolId_idx" ON "subjects"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_schoolId_code_key" ON "subjects"("schoolId", "code");

-- CreateIndex
CREATE INDEX "teacher_subjects_teacherId_idx" ON "teacher_subjects"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_subjects_subjectId_idx" ON "teacher_subjects"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subjects_teacherId_subjectId_key" ON "teacher_subjects"("teacherId", "subjectId");

-- CreateIndex
CREATE INDEX "courses_schoolId_idx" ON "courses"("schoolId");

-- CreateIndex
CREATE INDEX "courses_academicYear_idx" ON "courses"("academicYear");

-- CreateIndex
CREATE INDEX "courses_academicLevel_idx" ON "courses"("academicLevel");

-- CreateIndex
CREATE INDEX "courses_schoolId_academicYear_academicLevel_idx" ON "courses"("schoolId", "academicYear", "academicLevel");

-- CreateIndex
CREATE INDEX "course_subject_requirements_schoolId_idx" ON "course_subject_requirements"("schoolId");

-- CreateIndex
CREATE INDEX "course_subject_requirements_courseId_academicYear_idx" ON "course_subject_requirements"("courseId", "academicYear");

-- CreateIndex
CREATE INDEX "course_subject_requirements_subjectId_academicYear_idx" ON "course_subject_requirements"("subjectId", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "course_subject_requirements_courseId_subjectId_academicYear_key" ON "course_subject_requirements"("courseId", "subjectId", "academicYear");

-- CreateIndex
CREATE INDEX "schedules_schoolId_idx" ON "schedules"("schoolId");

-- CreateIndex
CREATE INDEX "schedules_courseId_idx" ON "schedules"("courseId");

-- CreateIndex
CREATE INDEX "schedules_academicYear_idx" ON "schedules"("academicYear");

-- CreateIndex
CREATE INDEX "schedules_isActive_idx" ON "schedules"("isActive");

-- CreateIndex
CREATE INDEX "schedules_isDeprecated_idx" ON "schedules"("isDeprecated");

-- CreateIndex
CREATE INDEX "schedules_schoolId_academicYear_isActive_idx" ON "schedules"("schoolId", "academicYear", "isActive");

-- CreateIndex
CREATE INDEX "schedule_blocks_scheduleId_idx" ON "schedule_blocks"("scheduleId");

-- CreateIndex
CREATE INDEX "schedule_blocks_teacherId_idx" ON "schedule_blocks"("teacherId");

-- CreateIndex
CREATE INDEX "schedule_blocks_teacherId_academicYear_idx" ON "schedule_blocks"("teacherId", "academicYear");

-- CreateIndex
CREATE INDEX "schedule_blocks_dayOfWeek_startTime_idx" ON "schedule_blocks"("dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "schedule_blocks_academicYear_idx" ON "schedule_blocks"("academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_blocks_scheduleId_dayOfWeek_blockNumber_key" ON "schedule_blocks"("scheduleId", "dayOfWeek", "blockNumber");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_blocks_teacherId_dayOfWeek_startTime_academicYear_key" ON "schedule_blocks"("teacherId", "dayOfWeek", "startTime", "academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "school_subscriptions_schoolId_key" ON "school_subscriptions"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "school_subscriptions_stripeCustomerId_key" ON "school_subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "school_subscriptions_stripeSubscriptionId_key" ON "school_subscriptions"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "school_subscriptions_status_idx" ON "school_subscriptions"("status");

-- CreateIndex
CREATE INDEX "school_subscriptions_stripeCustomerId_idx" ON "school_subscriptions"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "school_subscriptions_currentPeriodEnd_idx" ON "school_subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "subscription_history_subscriptionId_idx" ON "subscription_history"("subscriptionId");

-- CreateIndex
CREATE INDEX "subscription_history_changedAt_idx" ON "subscription_history"("changedAt");

-- CreateIndex
CREATE INDEX "subscription_history_subscriptionId_changedAt_idx" ON "subscription_history"("subscriptionId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "billing_events_stripeEventId_key" ON "billing_events"("stripeEventId");

-- CreateIndex
CREATE INDEX "billing_events_processed_createdAt_idx" ON "billing_events"("processed", "createdAt");

-- CreateIndex
CREATE INDEX "billing_events_schoolId_idx" ON "billing_events"("schoolId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_level_configs" ADD CONSTRAINT "schedule_level_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_level_config_history" ADD CONSTRAINT "schedule_level_config_history_configId_fkey" FOREIGN KEY ("configId") REFERENCES "schedule_level_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_availability" ADD CONSTRAINT "teacher_availability_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_availability_exceptions" ADD CONSTRAINT "teacher_availability_exceptions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_workload_limits" ADD CONSTRAINT "teacher_workload_limits_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_workload_limits" ADD CONSTRAINT "teacher_workload_limits_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_subject_requirements" ADD CONSTRAINT "course_subject_requirements_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_subject_requirements" ADD CONSTRAINT "course_subject_requirements_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_subject_requirements" ADD CONSTRAINT "course_subject_requirements_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_subject_requirements" ADD CONSTRAINT "course_subject_requirements_preferredTeacherId_fkey" FOREIGN KEY ("preferredTeacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_blocks" ADD CONSTRAINT "schedule_blocks_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_subscriptions" ADD CONSTRAINT "school_subscriptions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "school_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
