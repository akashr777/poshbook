CREATE TYPE "public"."cash_ledger_direction" AS ENUM('IN', 'OUT');--> statement-breakpoint
CREATE TYPE "public"."cash_ledger_module" AS ENUM('FUNDERS', 'VENDORS', 'EXPENSES', 'SALARIES', 'VEHICLES', 'VEHICLE_EXCHANGE', 'PAYMENTS', 'DAYBOOK');--> statement-breakpoint
CREATE TYPE "public"."daybook_entry_type" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."expense_category_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."expense_type" AS ENUM('GENERAL', 'SALARY', 'VEHICLE');--> statement-breakpoint
CREATE TYPE "public"."funder_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."funder_transaction_type" AS ENUM('FUND_IN', 'REPAYMENT');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'staff', 'partner', 'funder');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'booked', 'sold', 'hidden', 'ACTIVE', 'SOLD', 'EXCHANGED');--> statement-breakpoint
CREATE TYPE "public"."vendor_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"action" varchar(64) NOT NULL,
	"actorUserId" integer,
	"targetUserId" integer,
	"ipAddress" varchar(64),
	"userAgent" varchar(512),
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"ledgerDate" timestamp NOT NULL,
	"module" "cash_ledger_module" NOT NULL,
	"referenceType" varchar(80) NOT NULL,
	"referenceId" integer,
	"direction" "cash_ledger_direction" NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"paymentMode" varchar(80) DEFAULT 'cash' NOT NULL,
	"notes" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daybook_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicleId" integer NOT NULL,
	"entryType" "daybook_entry_type" NOT NULL,
	"category" varchar(120) NOT NULL,
	"particular" varchar(255) NOT NULL,
	"debitAmount" numeric(14, 2) DEFAULT 0 NOT NULL,
	"creditAmount" numeric(14, 2) DEFAULT 0 NOT NULL,
	"paymentMode" varchar(80) NOT NULL,
	"paidBy" varchar(160) NOT NULL,
	"paidTo" varchar(160) NOT NULL,
	"notes" text,
	"entryDate" timestamp NOT NULL,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"expenseType" "expense_type" NOT NULL,
	"status" "expense_category_status" DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"expenseDate" timestamp NOT NULL,
	"expenseType" "expense_type" NOT NULL,
	"categoryId" integer NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"vehicleId" integer,
	"attachmentUrl" varchar(500),
	"notes" text,
	"createdBy" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funder_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"funderId" integer NOT NULL,
	"transactionType" "funder_transaction_type" NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"transactionDate" timestamp NOT NULL,
	"referenceType" varchar(80),
	"referenceId" integer,
	"notes" text,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funders" (
	"id" serial PRIMARY KEY NOT NULL,
	"funderCode" varchar(50) NOT NULL,
	"funderName" varchar(200) NOT NULL,
	"phone" varchar(30),
	"email" varchar(320),
	"address" text,
	"notes" text,
	"status" "funder_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "funders_funderCode_unique" UNIQUE("funderCode")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"tokenHash" varchar(128) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"usedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE "refresh_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"jti" varchar(64) NOT NULL,
	"userId" integer NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"revokedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_sessions_jti_unique" UNIQUE("jti")
);
--> statement-breakpoint
CREATE TABLE "salary_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeeName" varchar(200) NOT NULL,
	"salaryMonth" integer NOT NULL,
	"salaryYear" integer NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"paidDate" timestamp NOT NULL,
	"createdBy" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320) NOT NULL,
	"password" text NOT NULL,
	"role" "user_role" DEFAULT 'staff' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"avatar" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicle_exchange_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"oldVehicleId" integer NOT NULL,
	"newVehicleId" integer NOT NULL,
	"exchangeValue" numeric(14, 2) NOT NULL,
	"additionalPaid" numeric(14, 2) DEFAULT 0 NOT NULL,
	"exchangeDate" timestamp NOT NULL,
	"remarks" text,
	"createdBy" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicleId" integer NOT NULL,
	"saleDate" timestamp NOT NULL,
	"saleAmount" numeric(14, 2) NOT NULL,
	"buyerName" varchar(200) NOT NULL,
	"paymentStatus" "vehicle_sale_payment_status" DEFAULT 'PENDING' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicleNumber" varchar(80),
	"chassisNumber" varchar(120),
	"vehicleName" varchar(200) NOT NULL,
	"brand" varchar(100) NOT NULL,
	"variant" varchar(150) NOT NULL,
	"modelYear" varchar(30) NOT NULL,
	"fuelType" varchar(50) NOT NULL,
	"transmission" varchar(50) NOT NULL,
	"color" varchar(100) NOT NULL,
	"kmDriven" integer NOT NULL,
	"ownershipCount" integer NOT NULL,
	"insuranceStatus" varchar(50) NOT NULL,
	"askingPrice" numeric(12, 2) NOT NULL,
	"purchasePrice" numeric(12, 2) NOT NULL,
	"purchaseDate" timestamp,
	"purchaseAmount" numeric(14, 2),
	"currentValue" numeric(14, 2),
	"description" text NOT NULL,
	"status" "vehicle_status" DEFAULT 'available' NOT NULL,
	"isSold" boolean DEFAULT false NOT NULL,
	"soldPrice" numeric(12, 2),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"documents" jsonb DEFAULT '{
        "rc": {"available": false, "holder": ""},
        "noc": {"available": false, "holder": ""},
        "insurance": {"available": false, "holder": ""},
        "pollution": {"available": false, "holder": ""},
        "bankNoc": {"available": false, "holder": ""},
        "secondKey": {"available": false, "holder": ""}
      }'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"paidDate" timestamp NOT NULL,
	"paymentMode" varchar(80) NOT NULL,
	"notes" text,
	"createdBy" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorId" integer NOT NULL,
	"vehicleId" integer,
	"purchaseDate" timestamp NOT NULL,
	"invoiceNo" varchar(100),
	"amount" numeric(14, 2) NOT NULL,
	"notes" text,
	"createdBy" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendorCode" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"phone" varchar(30),
	"email" varchar(320),
	"address" text,
	"gstNumber" varchar(30),
	"notes" text,
	"status" "vendor_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_vendorCode_unique" UNIQUE("vendorCode")
);
--> statement-breakpoint
ALTER TABLE "daybook_entries" ADD CONSTRAINT "daybook_entries_vehicleId_vehicles_id_fk" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_categoryId_expense_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."expense_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicleId_vehicles_id_fk" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funder_transactions" ADD CONSTRAINT "funder_transactions_funderId_funders_id_fk" FOREIGN KEY ("funderId") REFERENCES "public"."funders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_exchange_history" ADD CONSTRAINT "vehicle_exchange_history_oldVehicleId_vehicles_id_fk" FOREIGN KEY ("oldVehicleId") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_exchange_history" ADD CONSTRAINT "vehicle_exchange_history_newVehicleId_vehicles_id_fk" FOREIGN KEY ("newVehicleId") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_sales" ADD CONSTRAINT "vehicle_sales_vehicleId_vehicles_id_fk" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_payments" ADD CONSTRAINT "vendor_payments_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_purchases" ADD CONSTRAINT "vendor_purchases_vendorId_vendors_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_purchases" ADD CONSTRAINT "vendor_purchases_vehicleId_vehicles_id_fk" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cash_ledger_ledger_date_idx" ON "cash_ledger" USING btree ("ledgerDate");--> statement-breakpoint
CREATE INDEX "cash_ledger_module_idx" ON "cash_ledger" USING btree ("module");--> statement-breakpoint
CREATE INDEX "cash_ledger_reference_idx" ON "cash_ledger" USING btree ("referenceType","referenceId");--> statement-breakpoint
CREATE INDEX "cash_ledger_direction_idx" ON "cash_ledger" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "daybook_entries_vehicle_idx" ON "daybook_entries" USING btree ("vehicleId");--> statement-breakpoint
CREATE INDEX "daybook_entries_entry_date_idx" ON "daybook_entries" USING btree ("entryDate");--> statement-breakpoint
CREATE INDEX "daybook_entries_entry_type_idx" ON "daybook_entries" USING btree ("entryType");--> statement-breakpoint
CREATE INDEX "daybook_entries_category_idx" ON "daybook_entries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "expense_categories_type_idx" ON "expense_categories" USING btree ("expenseType");--> statement-breakpoint
CREATE INDEX "expense_categories_status_idx" ON "expense_categories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "expenses_date_idx" ON "expenses" USING btree ("expenseDate");--> statement-breakpoint
CREATE INDEX "expenses_type_idx" ON "expenses" USING btree ("expenseType");--> statement-breakpoint
CREATE INDEX "expenses_category_idx" ON "expenses" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "expenses_vehicle_idx" ON "expenses" USING btree ("vehicleId");--> statement-breakpoint
CREATE INDEX "funder_transactions_funder_idx" ON "funder_transactions" USING btree ("funderId");--> statement-breakpoint
CREATE INDEX "funder_transactions_date_idx" ON "funder_transactions" USING btree ("transactionDate");--> statement-breakpoint
CREATE INDEX "funder_transactions_type_idx" ON "funder_transactions" USING btree ("transactionType");--> statement-breakpoint
CREATE INDEX "funders_funder_code_idx" ON "funders" USING btree ("funderCode");--> statement-breakpoint
CREATE INDEX "funders_funder_name_idx" ON "funders" USING btree ("funderName");--> statement-breakpoint
CREATE INDEX "funders_status_idx" ON "funders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "salary_expenses_employee_month_unique" ON "salary_expenses" USING btree ("employeeName","salaryMonth","salaryYear");--> statement-breakpoint
CREATE INDEX "salary_expenses_paid_date_idx" ON "salary_expenses" USING btree ("paidDate");--> statement-breakpoint
CREATE INDEX "vehicle_exchange_old_vehicle_idx" ON "vehicle_exchange_history" USING btree ("oldVehicleId");--> statement-breakpoint
CREATE INDEX "vehicle_exchange_new_vehicle_idx" ON "vehicle_exchange_history" USING btree ("newVehicleId");--> statement-breakpoint
CREATE INDEX "vehicle_exchange_date_idx" ON "vehicle_exchange_history" USING btree ("exchangeDate");--> statement-breakpoint
CREATE INDEX "vehicle_sales_vehicle_idx" ON "vehicle_sales" USING btree ("vehicleId");--> statement-breakpoint
CREATE INDEX "vehicle_sales_sale_date_idx" ON "vehicle_sales" USING btree ("saleDate");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_vehicle_number_unique" ON "vehicles" USING btree ("vehicleNumber");--> statement-breakpoint
CREATE UNIQUE INDEX "vehicles_chassis_number_unique" ON "vehicles" USING btree ("chassisNumber");--> statement-breakpoint
CREATE INDEX "vendor_payments_vendor_idx" ON "vendor_payments" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "vendor_payments_paid_date_idx" ON "vendor_payments" USING btree ("paidDate");--> statement-breakpoint
CREATE INDEX "vendor_purchases_vendor_idx" ON "vendor_purchases" USING btree ("vendorId");--> statement-breakpoint
CREATE INDEX "vendor_purchases_vehicle_idx" ON "vendor_purchases" USING btree ("vehicleId");--> statement-breakpoint
CREATE INDEX "vendor_purchases_date_idx" ON "vendor_purchases" USING btree ("purchaseDate");--> statement-breakpoint
CREATE INDEX "vendors_name_idx" ON "vendors" USING btree ("name");--> statement-breakpoint
CREATE INDEX "vendors_vendorCode_idx" ON "vendors" USING btree ("vendorCode");--> statement-breakpoint
CREATE INDEX "vendors_status_idx" ON "vendors" USING btree ("status");