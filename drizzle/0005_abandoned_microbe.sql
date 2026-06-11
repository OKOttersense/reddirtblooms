CREATE TABLE `portfolio_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`variety` varchar(256) NOT NULL,
	`season` enum('spring','summer','fall','winter','year-round') NOT NULL DEFAULT 'summer',
	`description` text,
	`imageUrl` varchar(1024),
	`imageKey` varchar(512),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolio_items_id` PRIMARY KEY(`id`)
);
