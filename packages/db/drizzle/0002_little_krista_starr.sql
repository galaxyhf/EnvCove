ALTER TABLE "web_sessions" ADD COLUMN "device_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "web_sessions_user_device_unique" ON "web_sessions" USING btree ("user_id","device_id");
