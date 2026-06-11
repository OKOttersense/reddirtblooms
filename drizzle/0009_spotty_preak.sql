ALTER TABLE `orders` MODIFY COLUMN `productType` enum('bouquet','subscription','dried','seeds','bunch') DEFAULT 'bouquet';--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `pricingTier` enum('premium','specialty','focal') DEFAULT 'premium' NOT NULL;--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `price2Stem` decimal(8,2);--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `price4Stem` decimal(8,2);--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `price6Stem` decimal(8,2);--> statement-breakpoint
ALTER TABLE `harvest_listings` ADD `focalPrice` decimal(8,2);