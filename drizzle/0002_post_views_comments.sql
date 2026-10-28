CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entry_id` int NOT NULL,
	`name` varchar(80) NOT NULL,
	`email` varchar(190) NOT NULL,
	`body` text NOT NULL,
	`lang` enum('id','en') NOT NULL DEFAULT 'id',
	`status` enum('pending','approved','spam') NOT NULL DEFAULT 'pending',
	`reply` text,
	`ip_hash` varchar(64),
	`created_at` datetime NOT NULL,
	`approved_at` datetime,
	`replied_at` datetime,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_views` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`entry_id` int NOT NULL,
	`visitor` varchar(64) NOT NULL,
	`day` varchar(10) NOT NULL,
	`source` varchar(60) NOT NULL DEFAULT 'direct',
	`device` enum('mobile','desktop') NOT NULL DEFAULT 'desktop',
	`lang` enum('id','en') NOT NULL DEFAULT 'id',
	`created_at` datetime NOT NULL,
	CONSTRAINT `post_views_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_views_unique` UNIQUE(`entry_id`,`visitor`,`day`)
);
--> statement-breakpoint
CREATE INDEX `comments_entry_status` ON `comments` (`entry_id`,`status`);--> statement-breakpoint
CREATE INDEX `comments_status_created` ON `comments` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `post_views_entry_day` ON `post_views` (`entry_id`,`day`);