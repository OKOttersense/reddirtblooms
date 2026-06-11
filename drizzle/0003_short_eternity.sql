CREATE TABLE `florist_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(256) NOT NULL,
	`businessName` varchar(256) NOT NULL,
	`contactName` varchar(256) NOT NULL,
	`phone` varchar(32),
	`city` varchar(128),
	`website` varchar(512),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`stripeCustomerId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `florist_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `florist_accounts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `harvest_listings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`variety` varchar(256) NOT NULL,
	`description` text,
	`pricePerBunch` decimal(8,2) NOT NULL,
	`quantityAvailable` int NOT NULL DEFAULT 0,
	`quantitySold` int NOT NULL DEFAULT 0,
	`imageKey` varchar(512),
	`imageUrl` varchar(512),
	`isPublished` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`season` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `harvest_listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `harvest_order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`listingId` int NOT NULL,
	`quantity` int NOT NULL,
	`pricePerBunchCents` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `harvest_order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `harvest_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`floristId` int NOT NULL,
	`status` enum('pending','confirmed','invoiced','paid','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` enum('stripe','invoice') NOT NULL DEFAULT 'stripe',
	`stripePaymentIntentId` varchar(128),
	`stripeSessionId` varchar(128),
	`totalAmountCents` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `harvest_orders_id` PRIMARY KEY(`id`)
);
