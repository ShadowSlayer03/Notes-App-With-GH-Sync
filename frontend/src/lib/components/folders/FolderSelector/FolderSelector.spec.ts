import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';
import FolderSelector from './FolderSelector.svelte';
import type { Folder } from '../../../../types/pages/folder.types';

const foldersProp: Folder[] = [
	{
		id: '1',
		title: 'Folder 1',
		icon: 'folder',
		theme: 'paper',
		noteCount: 5,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-02T00:00:00Z'
	},
	{
		id: '2',
		title: 'Folder 2',
		icon: 'folder',
		theme: 'midnight',
		noteCount: 3,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-02T00:00:00Z'
	},
	{
		id: '3',
		title: 'Folder 3',
		icon: 'folder',
		theme: 'amethyst',
		noteCount: 7,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-02T00:00:00Z'
	}
];

test('renders the selector properly with buttons and folders', async () => {
	render(FolderSelector, {
		props: {
			folders: foldersProp,
			selectedFolderId: '1',
			placeholder: 'Select a folder'
		}
	});

	const selectorBtn = page.getByTestId('folder-selector-button');

	await expect.element(selectorBtn).toBeInTheDocument();
	await expect.element(selectorBtn).toHaveTextContent('Folder 1');

	await expect.element(page.getByTestId('folder-icon')).toBeInTheDocument();
	await expect.element(page.getByTestId('down-arrow-icon')).toBeInTheDocument();
});

test('shows the placeholder when no folder is selected', async () => {
	render(FolderSelector, {
		props: {
			folders: foldersProp,
			selectedFolderId: '',
			placeholder: 'Select a folder'
		}
	});

	const selectorBtn = page.getByTestId('folder-selector-button');

	await expect.element(selectorBtn).toHaveTextContent('Select a folder');

	await expect
		.element(page.getByText('Folder 1'))
		.not.toBeInTheDocument();
});

test('opens the folder dropdown when the selector is clicked', async () => {
	render(FolderSelector, {
		props: {
			folders: foldersProp,
			selectedFolderId: '',
			placeholder: 'Select a folder'
		}
	});

	const selectorBtn = page.getByTestId('folder-selector-button');

	await expect
		.element(page.getByTestId('folder-dropdown'))
		.not.toBeInTheDocument();

	await selectorBtn.click();

	await expect
		.element(page.getByTestId('folder-dropdown'))
		.toBeInTheDocument();
});

test('renders all folders when the dropdown is opened', async () => {
	render(FolderSelector, {
		props: {
			folders: foldersProp,
			selectedFolderId: '',
			placeholder: 'Select a folder'
		}
	});

	await page.getByTestId('folder-selector-button').click();

	await expect.element(page.getByText('Folder 1')).toBeInTheDocument();
	await expect.element(page.getByText('Folder 2')).toBeInTheDocument();
	await expect.element(page.getByText('Folder 3')).toBeInTheDocument();
});

test('marks the currently selected folder', async () => {
	render(FolderSelector, {
		props: {
			folders: foldersProp,
			selectedFolderId: '2',
			placeholder: 'Select a folder'
		}
	});

	await page.getByTestId('folder-selector-button').click();

	const selectedFolder = page.getByTestId('folder-option-2');

	await expect.element(selectedFolder).toBeInTheDocument();

	await expect
		.element(selectedFolder.getByTestId('check-icon'))
		.toBeInTheDocument();
});

test('allows the user to select a different folder', async () => {
	render(FolderSelector, {
		props: {
			folders: foldersProp,
			selectedFolderId: '1',
			placeholder: 'Select a folder'
		}
	});

	const selectorBtn = page.getByTestId('folder-selector-button');

	await expect.element(selectorBtn).toHaveTextContent('Folder 1');

	await selectorBtn.click();

	const folderTwo = page.getByTestId('folder-option-2');

	await folderTwo.click();

	await expect.element(selectorBtn).toHaveTextContent('Folder 2');
});

test('closes the dropdown after selecting a folder', async () => {
	render(FolderSelector, {
		props: {
			folders: foldersProp,
			selectedFolderId: '1',
			placeholder: 'Select a folder'
		}
	});

	await page.getByTestId('folder-selector-button').click();

	const dropdown = page.getByTestId('folder-dropdown');

	await expect.element(dropdown).toBeInTheDocument();

	await page.getByTestId('folder-option-2').click();

	await expect.element(dropdown).not.toBeInTheDocument();
});

test('shows the empty state when there are no folders', async () => {
	render(FolderSelector, {
		props: {
			folders: [],
			selectedFolderId: '',
			placeholder: 'Select a folder'
		}
	});

	await page.getByTestId('folder-selector-button').click();

	await expect
		.element(page.getByText('No folders available'))
		.toBeInTheDocument();
});

test('closes the dropdown when clicking outside the selector', async () => {
	render(FolderSelector, {
		props: {
			folders: foldersProp,
			selectedFolderId: '',
			placeholder: 'Select a folder'
		}
	});

	await page.getByTestId('folder-selector-button').click();

	const dropdown = page.getByTestId('folder-dropdown');

	await expect.element(dropdown).toBeInTheDocument();

	await userEvent.click(document.body);

	await expect.element(dropdown).not.toBeInTheDocument();
});

test('keeps the dropdown open when clicking inside it', async () => {
	render(FolderSelector, {
		props: {
			folders: foldersProp,
			selectedFolderId: '',
			placeholder: 'Select a folder'
		}
	});

	await page.getByTestId('folder-selector-button').click();

	const dropdown = page.getByTestId('folder-dropdown');

	await expect.element(dropdown).toBeInTheDocument();

	await page.getByText('Folder 1').click();
});
