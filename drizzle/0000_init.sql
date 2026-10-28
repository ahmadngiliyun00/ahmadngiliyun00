CREATE TABLE `admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(190) NOT NULL,
	`password_hash` varchar(255),
	`github_login` varchar(64),
	`active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL,
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_email` UNIQUE(`email`),
	CONSTRAINT `admins_github` UNIQUE(`github_login`)
);
--> statement-breakpoint
CREATE TABLE `entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collection` varchar(32) NOT NULL,
	`slug` varchar(120) NOT NULL,
	`visibility` enum('public','private') NOT NULL DEFAULT 'private',
	`position` int NOT NULL DEFAULT 0,
	`data` json NOT NULL,
	`share_hash` varchar(64),
	`share_created_at` datetime,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `entries_collection_slug` UNIQUE(`collection`,`slug`),
	CONSTRAINT `entries_share_hash` UNIQUE(`share_hash`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` varchar(32) NOT NULL,
	`entry_id` int,
	`stored_name` varchar(80) NOT NULL,
	`original_name` varchar(255) NOT NULL,
	`mime` varchar(64) NOT NULL,
	`size` bigint NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`key` varchar(190) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`window_start` datetime NOT NULL,
	CONSTRAINT `login_attempts_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(64) NOT NULL,
	`admin_id` int NOT NULL,
	`method` enum('password','github') NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(64) NOT NULL,
	`value` json NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE INDEX `entries_collection_visibility` ON `entries` (`collection`,`visibility`);--> statement-breakpoint
CREATE INDEX `files_entry` ON `files` (`entry_id`);--> statement-breakpoint
CREATE INDEX `sessions_admin` ON `sessions` (`admin_id`);