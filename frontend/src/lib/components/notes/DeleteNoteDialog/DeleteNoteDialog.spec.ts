import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { http, HttpResponse, delay } from 'msw';

import { worker } from '$lib/test/msw/browser';

import type { Notes } from '../../../../types/pages/notes.types';

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

import { goto } from '$app/navigation';
import DeleteNoteDialogQueryWrapper from '$lib/test/wrappers/DeleteNoteDialogQueryWrapper.svelte';

const mockGoto = vi.mocked(goto);

const defaultNote: Notes = {
	id: 'meeting_notes',
	title: 'Meeting Notes',
	desc: 'Notes from the standup',
	folder: 'work',
	data: '',
	theme: 'default',
	pinned: false,
	updatedAt: '2024-06-01T10:00:00Z',
	updatedBy: 'alice',
	updatedByAvatarUrl: 'https://example.com/alice.png'
};

function renderDialog(
	options: {
		deleteDialogOpen?: boolean;
		noteDetails?: Notes;
		changesNotSynced?: boolean;
		onSaveRequired?: () => void;
	} = {}
) {
	return render(DeleteNoteDialogQueryWrapper, {
		deleteDialogOpen: options.deleteDialogOpen ?? true,
		noteDetails: options.noteDetails ?? defaultNote,
		changesNotSynced: options.changesNotSynced ?? false,
		onSaveRequired: options.onSaveRequired ?? vi.fn()
	});
}

describe('DeleteNoteDialog', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		localStorage.clear();

		worker.resetHandlers();

		worker.use(
			http.delete('*/api/notes/delete', () => {
				return HttpResponse.json({
					data: [
						{
							folder: 'work'
						}
					]
				});
			})
		);
	});

	test('renders the delete confirmation dialog', async () => {
		renderDialog();

		await expect.element(page.getByRole('dialog')).toBeInTheDocument();

		await expect.element(page.getByRole('heading', { name: 'Delete note?' })).toBeInTheDocument();

		await expect.element(page.getByText('"Meeting Notes"')).toBeInTheDocument();

		await expect
			.element(page.getByText('This will move the note to the trash.'))
			.toBeInTheDocument();
	});

	test('renders Cancel and Delete note buttons', async () => {
		renderDialog();

		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

		await expect.element(page.getByRole('button', { name: 'Delete note' })).toBeInTheDocument();
	});

	test('closes the dialog when Cancel is clicked', async () => {
		renderDialog();

		await page.getByRole('button', { name: 'Cancel' }).click();

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	test('does not close when clicking inside the dialog', async () => {
		renderDialog();

		await page.getByRole('dialog').click();

		await expect.element(page.getByTestId('delete-note-dialog')).toBeInTheDocument();

		await expect.element(page.getByRole('heading', { name: 'Delete note?' })).toBeInTheDocument();
	});

	test('sends the note details when deleting', async () => {
		let requestCount = 0;

		worker.use(
			http.delete('*/api/notes/delete', async ({ request }) => {
				requestCount++;

				const body = await request.json();

				expect(body).toEqual(defaultNote);

				return HttpResponse.json({
					data: [
						{
							folder: 'work'
						}
					]
				});
			})
		);

		renderDialog();

		await page.getByRole('button', { name: 'Delete note' }).click();

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();

		expect(requestCount).toBe(1);
	});

	test('shows deleting state while the delete request is pending', async () => {
		worker.use(
			http.delete('*/api/notes/delete', async () => {
				await delay(1000);

				return HttpResponse.json(
					{
						message: 'Failed to delete note'
					},
					{
						status: 500
					}
				);
			})
		);

		renderDialog();

		await page.getByRole('button', { name: 'Delete note' }).click();

		await expect.element(page.getByRole('button', { name: 'Deleting...' })).toBeInTheDocument();
	});

	test('disables Cancel while deleting', async () => {
		worker.use(
			http.delete('*/api/notes/delete', async () => {
				await delay(1000);

				return HttpResponse.json(
					{
						message: 'Failed to delete note'
					},
					{
						status: 500
					}
				);
			})
		);

		renderDialog();

		await page.getByRole('button', { name: 'Delete note' }).click();

		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeDisabled();
	});

	test('disables the delete button while deleting', async () => {
		worker.use(
			http.delete('*/api/notes/delete', async () => {
				await delay(1000);

				return HttpResponse.json(
					{
						message: 'Failed to delete note'
					},
					{
						status: 500
					}
				);
			})
		);

		renderDialog();

		await page.getByRole('button', { name: 'Delete note' }).click();

		await expect.element(page.getByRole('button', { name: 'Deleting...' })).toBeDisabled();
	});

	test('closes and navigates to the deleted note folder after successful deletion', async () => {
		renderDialog();

		await page.getByRole('button', { name: 'Delete note' }).click();

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();

		expect(mockGoto).toHaveBeenCalledTimes(1);
		expect(mockGoto).toHaveBeenCalledWith('/folders/work');
	});

	test('removes the note from localStorage after successful deletion', async () => {
		const storageKey = 'note-work-Meeting Notes';

		localStorage.setItem(storageKey, 'cached note');

		renderDialog();

		await page.getByRole('button', { name: 'Delete note' }).click();

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();

		expect(localStorage.getItem(storageKey)).toBeNull();
	});

	test('keeps the dialog open when deletion fails', async () => {
		worker.use(
			http.delete('*/api/notes/delete', () => {
				return HttpResponse.json(
					{
						message: 'Failed to delete note'
					},
					{
						status: 500
					}
				);
			})
		);

		renderDialog();

		await page.getByRole('button', { name: 'Delete note' }).click();

		await expect.element(page.getByRole('dialog')).toBeInTheDocument();

		await expect.element(page.getByRole('heading', { name: 'Delete note?' })).toBeInTheDocument();

		expect(mockGoto).not.toHaveBeenCalled();
	});

	test('does not remove localStorage when deletion fails', async () => {
		const storageKey = 'note-work-Meeting Notes';

		localStorage.setItem(storageKey, 'cached note');

		worker.use(
			http.delete('*/api/notes/delete', () => {
				return HttpResponse.json(
					{
						message: 'Failed to delete note'
					},
					{
						status: 500
					}
				);
			})
		);

		renderDialog();

		await page.getByRole('button', { name: 'Delete note' }).click();

		await expect.element(page.getByRole('dialog')).toBeInTheDocument();

		expect(localStorage.getItem(storageKey)).toBe('cached note');
	});

	test('renders the save and sync confirmation when changes are not synced', async () => {
		renderDialog({
			changesNotSynced: true
		});

		await expect
			.element(
				page.getByRole('heading', {
					name: 'Save changes before deleting?'
				})
			)
			.toBeInTheDocument();

		await expect
			.element(page.getByText("This note has changes that haven't been synced to GitHub yet."))
			.toBeInTheDocument();

		await expect
			.element(
				page.getByRole('button', {
					name: 'Save & Sync'
				})
			)
			.toBeInTheDocument();
	});

	test('renders Save & Sync instead of Delete note when changes are not synced', async () => {
		renderDialog({
			changesNotSynced: true
		});

		await expect
			.element(
				page.getByRole('button', {
					name: 'Save & Sync'
				})
			)
			.toBeInTheDocument();

		await expect
			.element(
				page.getByRole('button', {
					name: 'Delete note'
				})
			)
			.not.toBeInTheDocument();
	});

	test('calls onSaveRequired when Save & Sync is clicked', async () => {
		const onSaveRequired = vi.fn();

		renderDialog({
			changesNotSynced: true,
			onSaveRequired
		});

		await page
			.getByRole('button', {
				name: 'Save & Sync'
			})
			.click();

		expect(onSaveRequired).toHaveBeenCalledTimes(1);
	});

	test('closes the dialog instead of deleting when Save & Sync is clicked', async () => {
		const onSaveRequired = vi.fn();

		renderDialog({
			changesNotSynced: true,
			onSaveRequired
		});

		await page
			.getByRole('button', {
				name: 'Save & Sync'
			})
			.click();

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	test('does not send a DELETE request when changes are not synced', async () => {
		let requestCount = 0;

		worker.use(
			http.delete('*/api/notes/delete', () => {
				requestCount++;

				return HttpResponse.json({
					data: [
						{
							folder: 'work'
						}
					]
				});
			})
		);

		const onSaveRequired = vi.fn();

		renderDialog({
			changesNotSynced: true,
			onSaveRequired
		});

		await page
			.getByRole('button', {
				name: 'Save & Sync'
			})
			.click();

		expect(requestCount).toBe(0);
	});

	test('calls onSaveRequired exactly once when changes are not synced', async () => {
		const onSaveRequired = vi.fn();

		renderDialog({
			changesNotSynced: true,
			onSaveRequired
		});

		await page
			.getByRole('button', {
				name: 'Save & Sync'
			})
			.click();

		expect(onSaveRequired).toHaveBeenCalledTimes(1);
	});
});
