ALTER TABLE `secret_santa` ADD `mail_started_at` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `mail_sent_at` integer;--> statement-breakpoint
UPDATE `secret_santa` SET `mail_started_at` = 0 WHERE `mail_status` IN ('sending', 'failed');
