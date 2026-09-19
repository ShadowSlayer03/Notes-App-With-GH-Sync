import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import NoteDialog from './NoteDialog.svelte';

test('renders dialog with title and fields', async () => {
	const cancelSpy = vi.fn();
	render(NoteDialog, { props: { cancel: cancelSpy } });

	expect(page.getByText('Create New Note')).toBeInTheDocument();
	expect(page.getByLabelText('Title')).toBeInTheDocument();
	expect(page.getByLabelText('Folder')).toBeInTheDocument();
	expect(page.getByLabelText('Description')).toBeInTheDocument();
	expect(page.getByRole('button', { name: 'Create Note' })).toBeDisabled();
});

test('calls cancel when clicking the cancel button', async () => {
	const cancelSpy = vi.fn();
	render(NoteDialog, { props: { cancel: cancelSpy } });

	const cancelButton = page.getByRole('button', { name: 'Cancel' });
	await cancelButton.click();

	expect(cancelSpy).toHaveBeenCalled();
});

test('enables create button only when all fields are filled', async () => {
	render(NoteDialog, { props: { cancel: vi.fn() } });

	const titleInput = page.getByLabelText('Title');
	const descInput = page.getByLabelText('Description');
	const createButton = page.getByRole('button', { name: 'Create Note' });

	expect(createButton).toBeDisabled();

	await titleInput.fill('Project Alpha');
	await descInput.fill('Project details go here');
	
	expect(createButton).toBeDisabled();
});

test('updates description character count', async () => {
	render(NoteDialog, { props: { cancel: vi.fn() } });

	const descInput = page.getByLabelText('Description');
	await descInput.fill('Hello');

	expect(page.getByText('5/180')).toBeInTheDocument();
});