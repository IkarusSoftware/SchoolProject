CREATE TABLE "edusync"."announcement_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"announcement_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edusync"."announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"priority" varchar(20) DEFAULT 'NORMAL' NOT NULL,
	"target_type" varchar(20) NOT NULL,
	"target_id" uuid,
	"author_id" uuid NOT NULL,
	"published_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"is_published" boolean DEFAULT false,
	"attachment_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edusync"."attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"class_id" uuid,
	"date" varchar(10) NOT NULL,
	"status" varchar(20) NOT NULL,
	"notes" text,
	"recorded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edusync"."conversation_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "edusync"."conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(255),
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edusync"."leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"requested_by" uuid NOT NULL,
	"start_date" varchar(10) NOT NULL,
	"end_date" varchar(10) NOT NULL,
	"reason" text NOT NULL,
	"document_url" text,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"review_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edusync"."meal_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"calories" integer,
	"allergens" jsonb DEFAULT '[]'::jsonb,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "edusync"."meal_menus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"meal_type" varchar(20) NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edusync"."messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"type" varchar(20) DEFAULT 'TEXT' NOT NULL,
	"metadata" jsonb,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edusync"."schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"academic_year_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"room" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edusync"."subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(20),
	"color" varchar(7),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "edusync"."announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "edusync"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."announcement_reads" ADD CONSTRAINT "announcement_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "edusync"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."announcements" ADD CONSTRAINT "announcements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "edusync"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "edusync"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."attendance" ADD CONSTRAINT "attendance_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "edusync"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."attendance" ADD CONSTRAINT "attendance_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "edusync"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."attendance" ADD CONSTRAINT "attendance_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "edusync"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."attendance" ADD CONSTRAINT "attendance_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "edusync"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "edusync"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "edusync"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."conversations" ADD CONSTRAINT "conversations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "edusync"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."leave_requests" ADD CONSTRAINT "leave_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "edusync"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."leave_requests" ADD CONSTRAINT "leave_requests_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "edusync"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."leave_requests" ADD CONSTRAINT "leave_requests_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "edusync"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."leave_requests" ADD CONSTRAINT "leave_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "edusync"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."meal_items" ADD CONSTRAINT "meal_items_menu_id_meal_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "edusync"."meal_menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."meal_menus" ADD CONSTRAINT "meal_menus_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "edusync"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."meal_menus" ADD CONSTRAINT "meal_menus_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "edusync"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "edusync"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "edusync"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."schedules" ADD CONSTRAINT "schedules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "edusync"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."schedules" ADD CONSTRAINT "schedules_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "edusync"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."schedules" ADD CONSTRAINT "schedules_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "edusync"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."schedules" ADD CONSTRAINT "schedules_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "edusync"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."schedules" ADD CONSTRAINT "schedules_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "edusync"."academic_years"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edusync"."subjects" ADD CONSTRAINT "subjects_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "edusync"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "announcement_reads_unique_idx" ON "edusync"."announcement_reads" USING btree ("announcement_id","user_id");--> statement-breakpoint
CREATE INDEX "announcements_tenant_idx" ON "edusync"."announcements" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "announcements_target_idx" ON "edusync"."announcements" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "announcements_published_idx" ON "edusync"."announcements" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "attendance_tenant_idx" ON "edusync"."attendance" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "attendance_student_idx" ON "edusync"."attendance" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "attendance_date_idx" ON "edusync"."attendance" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_student_date_idx" ON "edusync"."attendance" USING btree ("student_id","date");--> statement-breakpoint
CREATE INDEX "conv_participants_conv_idx" ON "edusync"."conversation_participants" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "conv_participants_user_idx" ON "edusync"."conversation_participants" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conv_participants_unique_idx" ON "edusync"."conversation_participants" USING btree ("conversation_id","user_id");--> statement-breakpoint
CREATE INDEX "conversations_tenant_idx" ON "edusync"."conversations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "conversations_last_msg_idx" ON "edusync"."conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "leave_requests_tenant_idx" ON "edusync"."leave_requests" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "leave_requests_student_idx" ON "edusync"."leave_requests" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "leave_requests_status_idx" ON "edusync"."leave_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "meal_items_menu_idx" ON "edusync"."meal_items" USING btree ("menu_id");--> statement-breakpoint
CREATE INDEX "meal_menus_tenant_idx" ON "edusync"."meal_menus" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "meal_menus_date_idx" ON "edusync"."meal_menus" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "meal_menus_unique_idx" ON "edusync"."meal_menus" USING btree ("tenant_id","date","meal_type");--> statement-breakpoint
CREATE INDEX "messages_conv_idx" ON "edusync"."messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "edusync"."messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_created_idx" ON "edusync"."messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "schedules_tenant_idx" ON "edusync"."schedules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "schedules_class_idx" ON "edusync"."schedules" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "schedules_teacher_idx" ON "edusync"."schedules" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "schedules_day_idx" ON "edusync"."schedules" USING btree ("day_of_week");--> statement-breakpoint
CREATE INDEX "subjects_tenant_idx" ON "edusync"."subjects" USING btree ("tenant_id");