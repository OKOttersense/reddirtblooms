CREATE TABLE `gallery_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`caption` text,
	`category` varchar(64) NOT NULL DEFAULT 'The Farm',
	`imageUrl` varchar(512),
	`imageKey` varchar(512),
	`variety` varchar(256),
	`varietyLatin` varchar(256),
	`varietyVaseLife` varchar(64),
	`varietyStemLength` varchar(64),
	`varietySeason` varchar(128),
	`varietyDesignUse` text,
	`varietyTags` varchar(256),
	`varietyColor` varchar(16),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gallery_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `florist_applications` ADD `adminNotes` text;