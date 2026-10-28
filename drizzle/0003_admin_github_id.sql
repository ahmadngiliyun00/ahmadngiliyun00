ALTER TABLE `admins` ADD `github_id` bigint;--> statement-breakpoint
ALTER TABLE `admins` ADD CONSTRAINT `admins_github_id` UNIQUE(`github_id`);