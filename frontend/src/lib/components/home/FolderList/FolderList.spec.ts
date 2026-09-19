import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import FolderList from './FolderList.svelte';
import type { Folder } from '../../../../types/pages/folder.types';

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

const mockFolders: Folder[] = [
	{
		id: '1',
		title: 'Work',
		icon: 'folder',
		theme: 'paper',
		noteCount: 10,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-02T00:00:00Z',
		isLocked: false
	},
	{
		id: '2',
		title: 'Personal',
		icon: 'folder',
		theme: 'midnight',
		noteCount: 5,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-03T00:00:00Z',
		isLocked: false
	},
	{
		id: '3',
		title: 'Todo',
		icon: 'folder',
		theme: 'amethyst',
		noteCount: 20,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-04T00:00:00Z',
		isLocked: false
	},
	{
		id: '4',
		title: 'Reading',
		icon: 'folder',
		theme: 'ocean',
		noteCount: 8,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-05T00:00:00Z',
		isLocked: false
	},
	{
		id: '5',
		title: 'Ideas',
		icon: 'folder',
		theme: 'forest',
		noteCount: 3,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-06T00:00:00Z',
		isLocked: false
	},
	{
		id: '6',
		title: 'Archive',
		icon: 'folder',
		theme: 'amber',
		noteCount: 50,
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-07T00:00:00Z',
		isLocked: false
	}
];

test('renders the "Folders" heading', async () => {
	render(FolderList, { props: { folders: mockFolders, isLoading: false } });

	await expect
		.element(page.getByTestId('folderlist-heading'))
		.toBeInTheDocument();

	await expect
		.element(page.getByTestId('folderlist-heading'))
		.toHaveTextContent('Folders');
});

test('renders the "View all" button', async () => {
	render(FolderList, { props: { folders: mockFolders, isLoading: false } });

	await expect
		.element(page.getByRole('button', { name: 'View all' }))
		.toBeInTheDocument();
});

test('renders skeletons when isLoading is true', async () => {
	render(FolderList, { props: { folders: [], isLoading: true } });

	const skeletons = page.getByRole('main').elements();

	const animatePulseEls = document.querySelectorAll('.animate-pulse');

	expect(animatePulseEls.length).toBe(5);
});

test('does not render skeletons when isLoading is false', async () => {
	render(FolderList, { props: { folders: mockFolders, isLoading: false } });

	const animatePulseEls = document.querySelectorAll('.animate-pulse');

	expect(animatePulseEls.length).toBe(0);
});

test('renders at most 5 folders when more than 5 are provided', async () => {
	render(FolderList, { props: { folders: mockFolders, isLoading: false } });

	await expect
		.element(page.getByText('Work'))
		.toBeInTheDocument();

	await expect
		.element(page.getByText('Personal'))
		.toBeInTheDocument();

	await expect
		.element(page.getByText('Todo'))
		.toBeInTheDocument();

	await expect
		.element(page.getByText('Reading'))
		.toBeInTheDocument();

	await expect
		.element(page.getByText('Ideas'))
		.toBeInTheDocument();

	await expect
		.element(page.getByText('Archive'))
		.not.toBeInTheDocument();
});

test('renders all folders when 5 or fewer are provided', async () => {
	const fiveFolders = mockFolders.slice(0, 5);

	render(FolderList, { props: { folders: fiveFolders, isLoading: false } });

	for (const folder of fiveFolders) {
		await expect
			.element(page.getByText(folder.title))
			.toBeInTheDocument();
	}
});

test('renders the create new folder button when not loading', async () => {
	render(FolderList, { props: { folders: mockFolders, isLoading: false } });

	await expect
		.element(page.getByTestId('create-new-folder-button'))
		.toBeInTheDocument();
});

test('does not render the create new folder button when loading', async () => {
	render(FolderList, { props: { folders: [], isLoading: true } });

	await expect
		.element(page.getByTestId('create-new-folder-button'))
		.not.toBeInTheDocument();
});

test('renders correctly with an empty folders list', async () => {
	render(FolderList, { props: { folders: [], isLoading: false } });

	await expect
		.element(page.getByTestId('folderlist-heading'))
		.toBeInTheDocument();

	await expect
		.element(page.getByTestId('create-new-folder-button'))
		.toBeInTheDocument();
});

test('clicking "View all" navigates to /all', async () => {
	const { goto } = await import('$app/navigation');

	render(FolderList, { props: { folders: mockFolders, isLoading: false } });

	await page.getByRole('button', { name: 'View all' }).click();

	expect(goto).toHaveBeenCalledWith('/all');
});