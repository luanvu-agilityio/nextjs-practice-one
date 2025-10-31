CREATE TABLE "smsVerificationCode" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"phone" text NOT NULL,
	"code" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"verified" boolean DEFAULT false,
	"attempts" text DEFAULT '0',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "smsVerificationCode" ADD CONSTRAINT "smsVerificationCode_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;