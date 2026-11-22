CREATE TABLE `secret_santa` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`mail_date` integer NOT NULL,
	`mail_status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`secret_santa` text NOT NULL,
	`forbidden` text DEFAULT (json_array()
          ) NOT NULL,
	`gift_to` text,
	`created_at` integer,
	FOREIGN KEY (`secret_santa`) REFERENCES `secret_santa`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`gift_to`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
