import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import FolderBox from './FolderBox.svelte';
import type { Folder } from '../../../../types/pages/folder.types';

const folder: Folder = {
	id: '1',
	title: 'My Work Folder',
	icon: 'folder',
	theme: 'paper',
	noteCount: 5,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-02T00:00:00Z',
	isLocked: false
};

test('renders the folder information correctly', async () => {
	render(FolderBox, {
		props: folder
	});

	await expect
		.element(page.getByText('My Work Folder'))
		.toBeInTheDocument();

	await expect
		.element(page.getByText('5 Notes'))
		.toBeInTheDocument();
});

test('renders singular "Note" when the folder has one note', async () => {
	render(FolderBox, {
		props: {
			...folder,
			noteCount: 1
		}
	});

	await expect
		.element(page.getByText('1 Note'))
		.toBeInTheDocument();

	await expect
		.element(page.getByText('1 Notes'))
		.not.toBeInTheDocument();
});

test('renders plural "Notes" when the folder has multiple notes', async () => {
	render(FolderBox, {
		props: {
			...folder,
			noteCount: 5
		}
	});

	await expect
		.element(page.getByText('5 Notes'))
		.toBeInTheDocument();
});

test('renders "Notes" when the folder has zero notes', async () => {
	render(FolderBox, {
		props: {
			...folder,
			noteCount: 0
		}
	});

	await expect
		.element(page.getByText('0 Notes'))
		.toBeInTheDocument();
});

test('links to the correct folder URL', async () => {
	render(FolderBox, {
		props: {
			...folder,
			title: 'My Work Folder'
		}
	});

	const folderLink = page.getByRole('link');

	await expect.element(folderLink).toBeInTheDocument();

	await expect
		.element(folderLink)
		.toHaveAttribute('href', '/folders/my-work-folder');
});

test('replaces spaces in the folder title when creating the URL', async () => {
	render(FolderBox, {
		props: {
			...folder,
			title: 'My Personal Notes'
		}
	});

	const folderLink = page.getByRole('link');

	await expect
		.element(folderLink)
		.toHaveAttribute('href', '/folders/my-personal-notes');
});

test('renders the lock icon for a locked folder', async () => {
	render(FolderBox, {
		props: {
			...folder,
			isLocked: true
		}
	});

	await expect
		.element(page.getByTestId('lock-icon'))
		.toBeInTheDocument();
});

test('does not render the lock icon for an unlocked folder', async () => {
	render(FolderBox, {
		props: {
			...folder,
			isLocked: false
		}
	});

	await expect
		.element(page.getByTestId('lock-icon'))
		.not.toBeInTheDocument();
});

test('renders the last edited information', async () => {
	render(FolderBox, {
		props: folder
	});

	const lastEdited = page.getByTestId('last-edited');

	await expect.element(lastEdited).toBeInTheDocument();
});

test('renders the folder icon', async () => {
	render(FolderBox, {
		props: folder
	});

	await expect
		.element(page.getByTestId('folder-icon'))
		.toBeInTheDocument();
});

test('renders correctly with a different folder theme', async () => {
	render(FolderBox, {
		props: {
			...folder,
			theme: 'midnight'
		}
	});

	await expect
		.element(page.getByText('My Work Folder'))
		.toBeInTheDocument();

	await expect
		.element(page.getByText('5 Notes'))
		.toBeInTheDocument();
});

test('renders correctly with a different folder icon', async () => {
	render(FolderBox, {
		props: {
			...folder,
			icon: 'book'
		}
	});

	await expect
		.element(page.getByText('My Work Folder'))
		.toBeInTheDocument();

	await expect
		.element(page.getByTestId('folder-icon'))
		.toBeInTheDocument();
});
