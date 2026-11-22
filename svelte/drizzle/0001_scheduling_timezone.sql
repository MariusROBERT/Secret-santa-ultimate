ALTER TABLE `secret_santa` ADD `mail_status` text DEFAULT 'pending' NOT NULL;
--> statement-breakpoint
UPDATE `secret_santa` SET `mail_status` = 'sent' WHERE `mail_date` <= unixepoch();
