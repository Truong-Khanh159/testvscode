ALTER TABLE `Order` ADD COLUMN `customerEmail` VARCHAR(191) NULL;
ALTER TABLE `Order` MODIFY `status` ENUM('new', 'confirmed', 'completed', 'canceled') NOT NULL DEFAULT 'new';
