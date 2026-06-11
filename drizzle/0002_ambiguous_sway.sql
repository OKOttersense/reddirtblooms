CREATE TABLE `diary_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`body` text,
	`videoUrl` varchar(512),
	`thumbnailUrl` varchar(512),
	`tags` varchar(256),
	`published` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diary_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `florist_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessName` varchar(256) NOT NULL,
	`contactName` varchar(256) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(32),
	`city` varchar(128),
	`monthlyVolume` varchar(64),
	`flowerTypes` text,
	`message` text,
	`status` enum('pending','approved','declined') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `florist_applications_id` PRIMARY KEY(`id`)
);
