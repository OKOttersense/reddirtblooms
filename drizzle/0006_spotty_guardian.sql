CREATE TABLE `portfolio_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`floristAccountId` int NOT NULL,
	`portfolioItemId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolio_favorites_id` PRIMARY KEY(`id`)
);
