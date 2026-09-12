CREATE TABLE `sharedLinks` (
	`shareId` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`noteTitle` text NOT NULL,
	`noteContent` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
