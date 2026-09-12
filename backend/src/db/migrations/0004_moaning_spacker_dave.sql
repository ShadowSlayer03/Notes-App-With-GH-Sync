CREATE TABLE `deletedNotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`desc` text NOT NULL,
	`folder` text NOT NULL,
	`deleteCommitSha` text NOT NULL,
	`previousCommitSha` text NOT NULL,
	`deletedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deletedNotes_title_unique` ON `deletedNotes` (`title`);