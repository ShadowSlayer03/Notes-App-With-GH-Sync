type FolderMetadata = {
	id: string;
	title: string;
	icon: string;
	theme: FolderTheme;
	isLocked?: boolean;
};

type Folder = FolderMetadata & {
	noteCount: number;
	createdAt: string; // ISO-8601
	updatedAt: string; // ISO-8601
};

type FolderTheme =
	| 'paper'
	| 'midnight'
	| 'amethyst'
	| 'ocean'
	| 'forest'
	| 'amber';

type FolderIcon = {
	id: string;
	component: any;
};

type Theme = {
	id: FolderTheme;
	label: string;
	class: string;
};

export type {
	FolderMetadata,
	Folder,
	FolderTheme,
	FolderIcon,
	Theme
}