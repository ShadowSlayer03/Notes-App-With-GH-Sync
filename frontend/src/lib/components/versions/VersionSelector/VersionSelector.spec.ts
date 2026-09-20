import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { http, HttpResponse } from 'msw';

import type { NoteVersion } from '../../../../types/pages/versions.types';
import { worker } from '$lib/test/msw/browser';
import VersionSelectorQueryWrapper from '$lib/test/wrappers/VersionSelectorQueryWrapper.svelte';

const secondVersion: NoteVersion = {
	sha: '5446247890abcdef1234567890abcdef12345678',
	label: 'Tested ABC',
	date: '2026-09-19T10:45:37Z',
	committerUsername: 'John123',
	content: '# Tested version\n\nThis is a tested version of the note.'
};

const noteContent = '# Updated note\n\nThis is the selected version.';

const noteId = 'note-123';
const folderId = 'folder-456';

function renderSelector(
	options: {
		noteId?: string;
		folderId?: string;
		selectedSha?: string | null;
		label?: string;
		disabled?: boolean;
		onVersionChange?: (version: NoteVersion) => void;
		onContentChange?: (content: string, isLatest: boolean) => void;
	} = {}
) {
	return render(VersionSelectorQueryWrapper, {
		noteId: options.noteId ?? noteId,
		folderId: options.folderId ?? folderId,
		selectedSha: options.selectedSha === undefined ? null : options.selectedSha,
		label: options.label ?? 'Select version',
		disabled: options.disabled ?? false,
		onVersionChange: options.onVersionChange ?? (() => {}),
		onContentChange: options.onContentChange
	});
}

describe('VersionSelector', () => {
	test('renders the loading state while versions are being fetched', async () => {
		worker.use(
			http.get('*/api/versions/:noteId', async () => {
				await new Promise(() =>
					HttpResponse.json({ message: 'Retrieved note versions successfully', data: [] })
				);
			})
		);

		renderSelector();

		await expect
			.element(page.getByText('Loading versions...', { exact: true }))
			.toBeInTheDocument();

		await expect.element(page.getByLabelText('Loading versions')).toBeInTheDocument();
	});

	test('disables the trigger while versions are loading', async () => {
		worker.use(
			http.get('*/api/versions/:noteId', async () => {
				await new Promise(() =>
					HttpResponse.json({ message: 'Retrieved note versions successfully', data: [] })
				);
			})
		);

		renderSelector();

		await expect.element(page.getByRole('button')).toBeDisabled();
	});

	test('renders the first version when no version is selected', async () => {
		renderSelector();

		await expect.element(page.getByText('Did ABC', { exact: true })).toBeInTheDocument();
	});

	test('uses the selectedSha version when one is provided', async () => {
		renderSelector({
			selectedSha: secondVersion.sha
		});

		await expect.element(page.getByText('Tested ABC', { exact: true })).toBeInTheDocument();
	});

	test('falls back to the provided label when there are no versions', async () => {
		worker.use(
			http.get('*/api/versions/:noteId*', () =>
				HttpResponse.json({ message: 'Retrieved note versions successfully', data: [] })
			)
		);

		await renderSelector({
			label: 'Choose a version'
		});

		const trigger = page.getByTestId('version-selector-trigger');

		await trigger.click();

		await expect
			.element(
				page.getByRole('button', {
					name: /Choose a version/
				})
			)
			.toBeInTheDocument();
	});

	test('opens the version picker when the trigger is clicked', async () => {
		renderSelector();

		const trigger = page.getByTestId('version-selector-trigger');

		await trigger.click();

		await expect.element(page.getByText('Version history', { exact: true })).toBeInTheDocument();

		await expect.element(page.getByText('Tested ABC', { exact: true })).toBeInTheDocument();

		await expect.element(page.getByText('Did DEF', { exact: true })).toBeInTheDocument();
	});

	test('closes the version picker when the trigger is clicked again', async () => {
		renderSelector();

		const trigger = page.getByTestId('version-selector-trigger');

		await trigger.click();

		await expect.element(page.getByText('Version history', { exact: true })).toBeInTheDocument();

		await trigger.click();

		await expect
			.element(page.getByText('Version history', { exact: true }))
			.not.toBeInTheDocument();
	});

	test('renders the Latest badge for the newest version and only the newest version', async () => {
		renderSelector();

		await page.getByTestId('version-selector-trigger').click();

		const latestBadge = page.getByText('Latest', { exact: true });

		await expect.element(latestBadge).toBeInTheDocument();

		await expect.element(latestBadge).toHaveLength(1);
	});

	test('renders all available versions', async () => {
		renderSelector();

		await page.getByTestId('version-selector-trigger').click();

		const picker = page.getByTestId('version-selector-list');

		await expect.element(picker.getByText('Did ABC', { exact: true })).toBeInTheDocument();

		await expect.element(picker.getByText('Tested ABC', { exact: true })).toBeInTheDocument();

		await expect.element(picker.getByText('Did DEF', { exact: true })).toBeInTheDocument();

		await expect.element(picker.getByText('Tested DEF', { exact: true })).toBeInTheDocument();

		await expect
			.element(picker.getByText('Implemented version control', { exact: true }))
			.toBeInTheDocument();
	});

	test('shows No versions found when the API returns an empty array', async () => {
		worker.use(
			http.get('*/api/versions/:noteId', () =>
				HttpResponse.json({ message: 'Retrieved note versions successfully', data: [] })
			)
		);

		renderSelector();

		await page
			.getByRole('button', {
				name: /Select version/
			})
			.click();

		await expect.element(page.getByText('No versions found', { exact: true })).toBeInTheDocument();
	});

	test('calls onVersionChange when a version is selected', async () => {
		const onVersionChange = vi.fn();

		renderSelector({
			onVersionChange
		});

		await page.getByTestId('version-selector-trigger').click();

		await page
			.getByRole('button', {
				name: /Tested ABC/
			})
			.click();

		expect(onVersionChange).toHaveBeenCalledTimes(1);

		expect(onVersionChange).toHaveBeenCalledWith(secondVersion);
	});

	test('closes the picker after selecting a version', async () => {
		const onVersionChange = vi.fn();

		renderSelector({
			onVersionChange
		});

		await page.getByTestId('version-selector-trigger').click();

		await page
			.getByRole('button', {
				name: /Tested ABC/
			})
			.click();

		await expect
			.element(page.getByText('Version history', { exact: true }))
			.not.toBeInTheDocument();
	});

	test('changes the selected version after selecting a version', async () => {
		const onVersionChange = vi.fn();

		renderSelector({
			onVersionChange
		});

		await page.getByTestId('version-selector-trigger').click();

		await page
			.getByRole('button', {
				name: /Tested ABC/
			})
			.click();

		await expect
			.element(
				page.getByRole('button', {
					name: /Tested ABC/
				})
			)
			.toBeInTheDocument();
	});

	test('loads the selected version content when onContentChange is provided', async () => {
		const onContentChange = vi.fn();

		worker.use(
			http.get('*/api/notes/:folderId/:noteId', () =>
				HttpResponse.json({
					data: {
						data: noteContent
					}
				})
			)
		);

		renderSelector({
			onContentChange
		});

		await page.getByTestId('version-selector-trigger').click();

		await page
			.getByRole('button', {
				name: /Tested ABC/
			})
			.click();

		await vi.waitFor(() => {
			expect(onContentChange).toHaveBeenCalled();
		});

		expect(onContentChange).toHaveBeenCalledWith(noteContent, false);
	});

	test('reports isLatest=true when the latest version is selected', async () => {
		const onContentChange = vi.fn();

		worker.use(
			http.get('*/api/notes/:folderId/:noteId', () =>
				HttpResponse.json({
					data: {
						data: noteContent
					}
				})
			)
		);

		renderSelector({
			onContentChange
		});

		await page.getByTestId('version-selector-trigger').click();

		await page.getByTestId('version-selector-item').first().click();

		await vi.waitFor(() => {
			expect(onContentChange).toHaveBeenCalled();
		});

		expect(onContentChange).toHaveBeenCalledWith(noteContent, true);
	});

	test('does not request note content when onContentChange is not provided', async () => {
		const onVersionChange = vi.fn();

		worker.use(
			http.get('*/api/notes/:folderId/:noteId', () => {
				throw new Error('Note endpoint should not be called');
			})
		);

		renderSelector({
			onVersionChange
		});

		await page.getByTestId('version-selector-trigger').click();

		await page
			.getByRole('button', {
				name: /Tested ABC/
			})
			.click();

		expect(onVersionChange).toHaveBeenCalledTimes(1);
	});

	test('does not allow interaction when disabled', async () => {
		renderSelector({
			disabled: true
		});

		const trigger = page.getByRole('button');

		await expect.element(trigger).toBeDisabled();

		await expect
			.element(page.getByText('Version history', { exact: true }))
			.not.toBeInTheDocument();
	});

	test('uses a custom label in the picker header', async () => {
		renderSelector({
			label: 'Compare version'
		});

		await page.getByTestId('version-selector-trigger').click();

		await expect.element(page.getByText('Compare version', { exact: true })).toBeInTheDocument();
	});

	test('uses "Select Version" as the picker heading for the default label', async () => {
		renderSelector();

		await page.getByTestId('version-selector-trigger').click();

		await expect.element(page.getByText('Version history', { exact: true })).toBeInTheDocument();
	});

	test('handles a failed version-content request without calling onContentChange', async () => {
		worker.use(
			http.get('*/api/notes/:folderId/:noteId', () =>
				HttpResponse.json(
					{
						message: 'Failed to load version'
					},
					{ status: 500 }
				)
			)
		);

		const onContentChange = vi.fn();

		renderSelector({
			onContentChange
		});

		await page.getByTestId('version-selector-trigger').click();

		await page
			.getByRole('button', {
				name: /Tested ABC/
			})
			.click();

		await vi.waitFor(() => {
			expect(onContentChange).not.toHaveBeenCalled();
		});
	});

	test('renders the version dates', async () => {
		renderSelector();

		await page.getByTestId('version-selector-trigger').click();

		await expect
			.element(
				page
					.getByTestId('version-selector-item')
					.first()
					.getByText(/Sep.*2026|2026.*Sep/)
			)
			.toBeInTheDocument();
	});
});
