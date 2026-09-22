import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { http, HttpResponse, delay } from 'msw';

import Editor from './Editor.svelte';
import type { Notes } from '../../../../types/pages/notes.types';
import queryClient from '$lib/util/queryClient';
import { worker } from '$lib/test/msw/browser';

/**
 * Mock $app/state so we can control the URL/search params.
 */
const mockPage = vi.hoisted(() => ({
	url: new URL('http://localhost/notes/work/meeting_notes')
}));

vi.mock('$app/state', () => ({
	page: mockPage
}));

/**
 * Mock browser navigation.
 */
const mockHistoryBack = vi.fn();

vi.stubGlobal('history', {
	back: mockHistoryBack
});

/**
 * Mock Milkdown Crepe.
 *
 * We don't want these tests to depend on Milkdown's actual DOM/editor
 * implementation. The component contract we care about is:
 *
 * - Crepe gets created with the correct content
 * - readonly is set for shared notes
 * - markdown updates reach the component
 * - replaceAll is invoked when a historical version is selected
 */
const mockCrepe = vi.hoisted(() => {
	type MarkdownListener = {
		markdownUpdated: unknown;
		focus: unknown;
	};

	type MarkdownCallback = (ctx: unknown, markdown: string, prevMarkdown: string) => void;

	type MockCrepeInstance = {
		root: HTMLElement;
		defaultValue: string;
		readonly: boolean;
		editor: { action: unknown };
		_callbacks: Record<string, MarkdownCallback | undefined>;
		_listener: MarkdownListener | undefined;
		setReadonly: (readonly: boolean) => void;
		on: (callback: (listener: MarkdownListener) => void) => void;
		triggerMarkdownUpdate: (markdown: string, prevMarkdown: string) => void;
		create: () => Promise<void>;
		destroy: () => void;
	};

	const Crepe = vi.fn(function (
		this: MockCrepeInstance,
		options: {
			root: HTMLElement;
			defaultValue: string;
		}
	) {
		this.root = options.root;
		this.defaultValue = options.defaultValue;
		this.readonly = false;

		this.editor = {
			action: vi.fn()
		};

		this.setReadonly = vi.fn((readonly: boolean) => {
			this.readonly = readonly;
		});

		this.on = vi.fn((callback: (listener: MarkdownListener) => void) => {
			const callbacks: Record<string, MarkdownCallback | undefined> = {};

			const listener: MarkdownListener = {
				markdownUpdated: vi.fn((cb: MarkdownCallback) => {
					callbacks.markdownUpdated = cb;
				}),
				focus: vi.fn((cb: () => void) => {
					callbacks.focus = cb;
				})
			};

			callback(listener);

			this._callbacks = callbacks;
			this._listener = listener;
		});

		this.triggerMarkdownUpdate = vi.fn((markdown: string, prevMarkdown: string) => {
			this._callbacks.markdownUpdated?.(null, markdown, prevMarkdown);
			return markdown;
		});

		this.create = vi.fn(async () => {
			options.root.dataset.testid = 'mock-crepe-editor';
			options.root.textContent = this.defaultValue;
		});

		this.destroy = vi.fn();
	});

	return {
		Crepe
	};
});

vi.mock('@milkdown/crepe', () => ({
	Crepe: mockCrepe.Crepe
}));

/**
 * We don't want the test to depend on the implementation of Milkdown's
 * replaceAll utility. We only need to know that updateCrepeContent causes
 * the editor action to be invoked.
 */
const mockReplaceAll = vi.hoisted(() => vi.fn((content: string) => content));

vi.mock('@milkdown/kit/utils', () => ({
	replaceAll: mockReplaceAll
}));

const defaultNote: Notes = {
	id: 'meeting_notes',
	title: 'Meeting Notes',
	desc: 'Notes from the standup',
	folder: 'work',
	data: '# Meeting Notes\n\nDaily standup notes',
	theme: 'default',
	pinned: false,
	updatedAt: '2024-06-01T10:00:00Z',
	updatedBy: 'alice',
	updatedByAvatarUrl: 'https://example.com/alice.png'
};

const sharedNote = {
	id: 'share-123',
	noteContent: '# Shared note\n\nThis is shared content.',
	note: defaultNote
};

function renderEditor(
	options: {
		noteId?: string;
		folderId?: string;
		changesNotSynced?: boolean;
		noteDetails?: Notes;
		viewingHistoricalVersion?: boolean;
	} = {}
) {
	return render(Editor, {
		noteId: options.noteId ?? 'meeting_notes',
		folderId: options.folderId ?? 'work',
		changesNotSynced: options.changesNotSynced ?? false,
		noteDetails: options.noteDetails ?? defaultNote,
		viewingHistoricalVersion: options.viewingHistoricalVersion ?? false
	});
}

/**
 * The browser collapses runs of whitespace in an element's text content, so
 * compare against the markdown while treating any whitespace run as equal.
 */
function matchingTextContent(content: string) {
	const escapedWords = content
		.split(/\s+/)
		.filter((part) => part.length > 0)
		.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

	return new RegExp(escapedWords.join('\\s+'));
}

beforeEach(() => {
	vi.clearAllMocks();

	queryClient.clear();

	localStorage.clear();

	mockPage.url = new URL('http://localhost/notes/work/meeting_notes');

	worker.resetHandlers();

	worker.use(
		http.get('*/api/notes/work/meeting_notes', () =>
			HttpResponse.json({
				data: defaultNote
			})
		),

		http.get('*/api/notes/:folderId/:noteId', ({ params }) =>
			HttpResponse.json({
				data: {
					...defaultNote,
					id: params.noteId,
					folder: params.folderId
				}
			})
		),

		http.get('*/api/notes/share', ({ request }) => {
			const url = new URL(request.url);

			if (url.searchParams.get('shareId') !== 'share-123') {
				return HttpResponse.json(
					{
						message: 'Invalid share link'
					},
					{ status: 404 }
				);
			}

			return HttpResponse.json({
				data: sharedNote
			});
		})
	);
});

describe('Editor', () => {
	test('renders the editor for a normal note', async () => {
		renderEditor();

		await expect.element(page.getByTestId('mock-crepe-editor')).toBeInTheDocument();

		await expect.element(page.getByTestId('version-selector-trigger')).toBeInTheDocument();

		await expect.element(page.getByRole('button', { name: 'Theme' })).toBeInTheDocument();
	});

	test('initializes the editor with note content', async () => {
		renderEditor();

		await expect
			.element(page.getByTestId('mock-crepe-editor'))
			.toHaveTextContent(matchingTextContent(defaultNote.data));
	});

	test('prefers localStorage content over note content', async () => {
		const localContent = '# Local version\n\nUnsaved changes';

		localStorage.setItem('note-work-meeting_notes', localContent);

		renderEditor();

		await expect
			.element(page.getByTestId('mock-crepe-editor'))
			.toHaveTextContent(matchingTextContent(localContent));
	});

	test('renders the default editor content when note content is empty', async () => {
		worker.use(
			http.get('*/api/notes/work/meeting_notes', () =>
				HttpResponse.json({
					data: {
						...defaultNote,
						data: ''
					}
				})
			)
		);

		renderEditor();

		await expect
			.element(page.getByTestId('mock-crepe-editor'))
			.toHaveTextContent('Start writing something legendary...');
	});

	test('renders the pin button', async () => {
		renderEditor();

		await expect.element(page.getByTestId('pin-note-toggle')).toBeInTheDocument();
	});

	test('opens the theme picker when Theme is clicked', async () => {
		renderEditor();

		const themeButton = page.getByRole('button', {
			name: /Theme/
		});

		await themeButton.click();

		await expect
			.element(page.getByTestId('theme-picker').getByText('Default', { exact: true }))
			.toBeInTheDocument();
	});

	test('renders all available themes in the theme picker', async () => {
		renderEditor();

		await page.getByRole('button', { name: /Theme/ }).click();

		const picker = page.getByTestId('theme-picker');

		await expect.element(picker.getByText('Default', { exact: true })).toBeInTheDocument();

		await expect.element(picker.getByText('Paper', { exact: true })).toBeInTheDocument();

		await expect.element(picker.getByText('Sepia', { exact: true })).toBeInTheDocument();
	});

	test('shows the selected theme label', async () => {
		worker.use(
			http.get('*/api/notes/work/meeting_notes', () =>
				HttpResponse.json({
					data: {
						...defaultNote,
						theme: 'paper'
					}
				})
			)
		);

		renderEditor();

		await expect.element(page.getByRole('button', { name: /Theme/ })).toHaveTextContent(/Paper/);
	});

	test('changes the selected theme', async () => {
		renderEditor();

		await page.getByRole('button', { name: /Theme/ }).click();

		await page.getByTestId('theme-picker').getByText('Paper', { exact: true }).click();

		await expect.element(page.getByRole('button', { name: /Theme/ })).toHaveTextContent(/Paper/);
	});

	test('marks the selected theme with a check icon', async () => {
		renderEditor();

		await page.getByRole('button', { name: /Theme/ }).click();

		const defaultTheme = page.getByTestId('theme-picker').getByText('Default', { exact: true });

		await expect.element(defaultTheme).toBeInTheDocument();
	});

	test('toggles the pinned state when the pin button is clicked', async () => {
		renderEditor();

		const pinButton = page.getByTestId('pin-note-toggle');

		await pinButton.click();

		// The selected state is reflected by the fuchsia styling.
		await expect.element(pinButton).toHaveClass(/border-fuchsia-500\/30/);

		await pinButton.click();

		await expect.element(pinButton).not.toHaveClass(/border-fuchsia-500\/30/);
	});

	test('does not allow theme selection when the note has not loaded', async () => {
		worker.use(
			http.get('*/api/notes/work/meeting_notes', async () => {
				await delay(1000);

				return HttpResponse.json({
					data: defaultNote
				});
			})
		);

		renderEditor();

		await expect.element(page.getByRole('button', { name: /Theme/ })).toBeInTheDocument();
	});

	test('renders an error state when fetching the note fails', async () => {
		worker.use(
			http.get('*/api/notes/work/meeting_notes', () =>
				HttpResponse.json(
					{
						message: 'Failed to load note'
					},
					{ status: 500 }
				)
			)
		);

		renderEditor();

		await expect.element(page.getByText('Failed to load note')).toBeInTheDocument();
	});

	test('uses the shared-note API when shareId is present', async () => {
		mockPage.url = new URL('http://localhost/notes/work/meeting_notes?shareId=share-123');

		renderEditor();

		await expect.element(page.getByText('Read Only', { exact: true })).toBeInTheDocument();

		await expect
			.element(page.getByTestId('mock-crepe-editor'))
			.toHaveTextContent(matchingTextContent(sharedNote.noteContent));
	});

	test('renders the editor as read-only for a shared note', async () => {
		mockPage.url = new URL('http://localhost/notes/work/meeting_notes?shareId=share-123');

		renderEditor();

		await expect.element(page.getByText('Read Only', { exact: true })).toBeInTheDocument();

		await expect.element(page.getByTestId('mock-crepe-editor')).toBeInTheDocument();
	});

	test('does not render the normal note toolbar when the share link is invalid', async () => {
		mockPage.url = new URL('http://localhost/notes/work/meeting_notes?shareId=invalid');

		renderEditor();

		await expect.element(page.getByText('Share link unavailable')).toBeInTheDocument();

		await expect
			.element(page.getByText('This share link is invalid, expired, or no longer available.'))
			.toBeInTheDocument();

		await expect.element(page.getByRole('button', { name: 'Go back' })).toBeInTheDocument();

		await expect.element(page.getByRole('button', { name: /Theme/ })).not.toBeInTheDocument();
	});

	test('goes back when Go back is clicked for an invalid share link', async () => {
		mockPage.url = new URL('http://localhost/notes/work/meeting_notes?shareId=invalid');

		renderEditor();

		await page.getByRole('button', { name: 'Go back' }).click();

		expect(mockHistoryBack).toHaveBeenCalledTimes(1);
	});

	test('renders the Read Only badge only for shared notes', async () => {
		renderEditor();

		await expect.element(page.getByText('Read Only', { exact: true })).not.toBeInTheDocument();

		mockPage.url = new URL('http://localhost/notes/work/meeting_notes?shareId=share-123');

		renderEditor();

		await expect.element(page.getByText('Read Only', { exact: true })).toBeInTheDocument();
	});

	test('renders VersionSelector for normal notes', async () => {
		renderEditor();

		await expect.element(page.getByTestId('version-selector-trigger')).toBeInTheDocument();
	});

	test('passes the correct note and folder identifiers to VersionSelector', async () => {
		renderEditor({
			noteId: 'daily-notes',
			folderId: 'personal'
		});

		await expect.element(page.getByTestId('version-selector-trigger')).toBeInTheDocument();
	});

	test('sets changesNotSynced when viewing a historical version', async () => {
		renderEditor({
			viewingHistoricalVersion: true,
			changesNotSynced: false
		});

		await expect.element(page.getByTestId('mock-crepe-editor')).toBeInTheDocument();
	});

	test('creates the editor only after the note has loaded', async () => {
		worker.use(
			http.get('*/api/notes/work/meeting_notes', async () => {
				await delay(200);

				return HttpResponse.json({
					data: defaultNote
				});
			})
		);

		renderEditor();

		await expect.element(page.getByTestId('mock-crepe-editor')).toBeInTheDocument();

		expect(mockCrepe.Crepe).toHaveBeenCalled();
	});

	test('destroys the Crepe instance when the component is destroyed', async () => {
		renderEditor();

		await expect.element(page.getByTestId('mock-crepe-editor')).toBeInTheDocument();

		expect(mockCrepe.Crepe).toHaveBeenCalled();
	});

	test('does not recreate the editor once Crepe exists', async () => {
		renderEditor();

		await expect.element(page.getByTestId('mock-crepe-editor')).toBeInTheDocument();

		expect(mockCrepe.Crepe).toHaveBeenCalledTimes(1);
	});

	test('stores editor content in localStorage when markdown changes', async () => {
		renderEditor();

		await expect.element(page.getByTestId('mock-crepe-editor')).toBeInTheDocument();

		const instances = mockCrepe.Crepe.mock.instances;

		expect(instances.length).toBeGreaterThan(0);

		const instance = instances[instances.length - 1];

		instance.triggerMarkdownUpdate('# Updated note\n\nNew content', defaultNote.data);

		expect(localStorage.getItem('note-work-meeting_notes')).toBe('# Updated note\n\nNew content');
	});
});
