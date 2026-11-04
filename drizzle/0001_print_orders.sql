CREATE TABLE "orderEvent" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"status" text,
	"message" text NOT NULL,
	"actor" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "printOrder" (
	"id" text PRIMARY KEY NOT NULL,
	"number" integer GENERATED ALWAYS AS IDENTITY (sequence name "printOrder_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1001 CACHE 1),
	"userId" text NOT NULL,
	"albumId" text,
	"title" text NOT NULL,
	"book" jsonb NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"shipping" jsonb NOT NULL,
	"customerNotes" text,
	"status" text DEFAULT 'new' NOT NULL,
	"vendorId" text,
	"price" text,
	"trackingCarrier" text,
	"trackingNumber" text,
	"trackingUrl" text,
	"adminNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendor" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contactName" text,
	"email" text,
	"phone" text,
	"website" text,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orderEvent" ADD CONSTRAINT "orderEvent_orderId_printOrder_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."printOrder"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "printOrder" ADD CONSTRAINT "printOrder_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "printOrder" ADD CONSTRAINT "printOrder_albumId_album_id_fk" FOREIGN KEY ("albumId") REFERENCES "public"."album"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "printOrder" ADD CONSTRAINT "printOrder_vendorId_vendor_id_fk" FOREIGN KEY ("vendorId") REFERENCES "public"."vendor"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_event_order_idx" ON "orderEvent" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "order_user_idx" ON "printOrder" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "order_status_idx" ON "printOrder" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_album_idx" ON "printOrder" USING btree ("albumId");