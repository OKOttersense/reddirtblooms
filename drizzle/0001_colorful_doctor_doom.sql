CREATE TABLE `bloom_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(128),
	`source` varchar(64) DEFAULT 'homepage',
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bloom_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `bloom_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripeSessionId` varchar(128) NOT NULL,
	`stripePaymentIntentId` varchar(128),
	`customerEmail` varchar(320),
	`customerName` varchar(256),
	`productName` varchar(256),
	`productType` enum('bouquet','subscription','dried','seeds') DEFAULT 'bouquet',
	`amountCents` int,
	`status` enum('pending','paid','fulfilled','cancelled') NOT NULL DEFAULT 'pending',
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_stripeSessionId_unique` UNIQUE(`stripeSessionId`)
);
