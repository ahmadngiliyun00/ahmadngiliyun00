CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(190) NOT NULL,
	`topic` varchar(120) NOT NULL,
	`body` text NOT NULL,
	`lang` enum('id','en') NOT NULL DEFAULT 'id',
	`status` enum('new','read','archived') NOT NULL DEFAULT 'new',
	`ip_hash` varchar(64),
	`notified` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL,
	`read_at` datetime,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `messages_status_created` ON `messages` (`status`,`created_at`);