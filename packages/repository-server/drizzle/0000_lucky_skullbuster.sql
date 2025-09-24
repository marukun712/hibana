CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`publickey` text NOT NULL,
	`signature` text NOT NULL,
	`event` text NOT NULL,
	`timestamp` text NOT NULL,
	`message` text NOT NULL
);
