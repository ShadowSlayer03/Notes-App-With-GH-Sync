import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';

import FolderDialog from './FolderDialog.svelte';

const cancel = () => {};

test('renders the folder dialog correctly', async () => {
	render(FolderDialog, {
		props: {
			cancel
		}
	});

	await expect
		.element(page.getByRole('dialog'))
		.toBeInTheDocument();

	await expect
		.element(
			page.getByRole('heading', { name: 'Create New Folder' })
		)
		.toBeInTheDocument();

	await expect
		.element(
			page.getByText('Organize your notes into a new folder.')
		)
		.toBeInTheDocument();

	await expect
		.element(page.getByRole('textbox', { name: 'Folder Name' }))
		.toBeInTheDocument();

	await expect
		.element(page.getByRole('button', { name: 'Cancel' }))
		.toBeInTheDocument();

	await expect
		.element(page.getByRole('button', { name: 'Create Folder' }))
		.toBeInTheDocument();
});

test('disables Create Folder when the folder name is empty', async () => {
	render(FolderDialog, {
		props: {
			cancel
		}
	});

	const createButton = page.getByRole('button', {
		name: 'Create Folder'
	});

	await expect.element(createButton).toBeDisabled();
});

test('enables Create Folder when a folder name is entered', async () => {
	render(FolderDialog, {
		props: {
			cancel
		}
	});

	const input = page.getByRole('textbox', {
		name: 'Folder Name'
	});

	await input.fill('My Personal Folder');

	await expect
		.element(input)
		.toHaveValue('My Personal Folder');

	await expect
		.element(
			page.getByRole('button', { name: 'Create Folder' })
		)
		.toBeEnabled();
});

test('keeps Create Folder disabled when the name contains only whitespace', async () => {
	render(FolderDialog, {
		props: {
			cancel
		}
	});

	const input = page.getByRole('textbox', {
		name: 'Folder Name'
	});

	await input.fill('   ');

	await expect
		.element(
			page.getByRole('button', { name: 'Create Folder' })
		)
		.toBeDisabled();
});

test('toggles folder encryption', async () => {
	render(FolderDialog, {
		props: {
			cancel
		}
	});

	const encryptionSwitch = page.getByRole('switch', {
		name: 'Toggle folder encryption'
	});

	await expect
		.element(encryptionSwitch)
		.toHaveAttribute('aria-checked', 'false');

	await encryptionSwitch.click();

	await expect
		.element(encryptionSwitch)
		.toHaveAttribute('aria-checked', 'true');

	await encryptionSwitch.click();

	await expect
		.element(encryptionSwitch)
		.toHaveAttribute('aria-checked', 'false');
});

test('allows the user to select a folder theme', async () => {
	render(FolderDialog, {
		props: {
			cancel
		}
	});

	const paperTheme = page.getByRole('button', {
		name: /paper/i
	});

	const midnightTheme = page.getByRole('button', {
		name: /midnight/i
	});

	await expect.element(paperTheme).toBeInTheDocument();
	await expect.element(midnightTheme).toBeInTheDocument();

	await midnightTheme.click();

	await expect
		.element(midnightTheme)
		.toHaveClass('border-violet-500');
});

test('allows the user to select a folder icon', async () => {
	render(FolderDialog, {
		props: {
			cancel
		}
	});

	const folderIcon = page.getByRole('button', {
		name: 'Select folder icon'
	});

	await expect.element(folderIcon).toBeInTheDocument();

	await folderIcon.click();

	await expect
		.element(folderIcon)
		.toHaveClass('border-violet-500');
});

test('calls the cancel callback when Cancel is clicked', async () => {
	const cancel = vi.fn();

	render(FolderDialog, {
		props: {
			cancel
		}
	});

	await page
		.getByRole('button', { name: 'Cancel' })
		.click();

	expect(cancel).toHaveBeenCalledTimes(1);
});

test('calls the cancel callback when Escape is pressed', async () => {
	const cancel = vi.fn();

	render(FolderDialog, {
		props: {
			cancel
		}
	});

	await userEvent.keyboard('{Escape}');

	expect(cancel).toHaveBeenCalledTimes(1);
});

test('calls cancel when the backdrop is clicked', async () => {
	const cancel = vi.fn();

	render(FolderDialog, {
		props: {
			cancel
		}
	});

	await page
		.getByTestId('folder-dialog')
		.click({ position: { x: 10, y: 10 } });

	expect(cancel).toHaveBeenCalledTimes(1);
});