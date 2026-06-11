CREATE TABLE `florist_suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`floristId` int NOT NULL,
	`floristEmail` varchar(320),
	`floristBusinessName` varchar(256),
	`message` text NOT NULL,
	`category` enum('variety-request','feedback','special-order','general') NOT NULL DEFAULT 'general',
	`status` enum('new','reviewed','actioned') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `florist_suggestions_id` PRIMARY KEY(`id`)
);
