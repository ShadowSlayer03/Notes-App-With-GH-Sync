ALTER TABLE `users` ADD `githubRepoId` integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_githubRepoId_unique` ON `users` (`githubRepoId`);