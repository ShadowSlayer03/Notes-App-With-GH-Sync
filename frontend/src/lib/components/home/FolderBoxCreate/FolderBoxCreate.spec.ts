import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import FolderBoxCreate from './FolderBoxCreate.svelte';

test('renders the create folder button correctly', async () => {
	render(FolderBoxCreate);

	await expect
		.element(page.getByTestId('create-new-folder-button'))
		.toBeInTheDocument();

	await expect
		.element(page.getByTestId('plus-icon'))
		.toBeInTheDocument();

	await expect
		.element(page.getByTestId('create-new-folder-text'))
		.toHaveTextContent('Create new folder');
});

test('does not show the folder dialog initially', async () => {
	render(FolderBoxCreate);

	await expect
		.element(page.getByTestId('folder-dialog'))
		.not.toBeInTheDocument();
});

test('opens the folder dialog when the create button is clicked', async () => {
	render(FolderBoxCreate);

	await page
		.getByTestId('create-new-folder-button')
		.click();

	await expect
		.element(page.getByTestId('folder-dialog'))
		.toBeInTheDocument();

	await expect
		.element(page.getByRole('heading', { name: 'Create New Folder' }))
		.toBeInTheDocument();
});

test('closes the folder dialog when cancel is clicked', async () => {
	render(FolderBoxCreate);

	await page
		.getByTestId('create-new-folder-button')
		.click();

	await expect
		.element(page.getByTestId('folder-dialog'))
		.toBeInTheDocument();

	await page
		.getByRole('button', { name: 'Cancel' })
		.click();

	await expect
		.element(page.getByTestId('folder-dialog'))
		.not.toBeInTheDocument();
});