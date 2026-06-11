ALTER TABLE `harvest_listings` ADD `color` varchar(100) DEFAULT 'Mixed';--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `stripeProductId2Stem` varchar(255);--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `stripeProductId4Stem` varchar(255);--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `stripeProductId6Stem` varchar(255);--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `stripePriceId2Stem` varchar(255);--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `stripePriceId4Stem` varchar(255);--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `stripePriceId6Stem` varchar(255);--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `syncedToStripe` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `lastSyncedAt` timestamp;