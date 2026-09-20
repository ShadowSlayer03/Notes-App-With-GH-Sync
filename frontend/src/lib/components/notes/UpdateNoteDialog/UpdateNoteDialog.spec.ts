import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';

import UpdateNoteDialog from './UpdateNoteDialog.svelte';
import type { Notes } from '../../../../types/pages/notes.types';

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
        open?: boolean;
        loading?: boolean;
        noteDetails?: Notes;
        onSave?: (desc: string, commitMsg: string) => Promise<void>;
    } = {}
) {
    return render(UpdateNoteDialog, {
        open: options.open ?? true,
        loading: options.loading ?? false,
        noteDetails: options.noteDetails ?? defaultNote,
        onSave: options.onSave ?? vi.fn().mockResolvedValue(undefined)
    });
}

describe('UpdateNoteDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('does not render when closed', async () => {
        renderDialog({ open: false });

        await expect
            .element(page.getByRole('dialog'))
            .not.toBeInTheDocument();
    });

    test('renders the dialog when open', async () => {
        renderDialog();

        await expect
            .element(page.getByRole('dialog'))
            .toBeInTheDocument();

        await expect
            .element(page.getByRole('heading', { name: 'Save changes' }))
            .toBeInTheDocument();
    });

    test('renders the dialog description', async () => {
        renderDialog();

        await expect
            .element(
                page.getByText(
                    'Update the note and create a new version.'
                )
            )
            .toBeInTheDocument();
    });

    test('renders the initial note description', async () => {
        renderDialog();

        const description = page.getByRole('textbox', {
            name: 'Description'
        });

        await expect
            .element(description)
            .toHaveValue(defaultNote.desc);
    });

    test('renders an empty version note initially', async () => {
        renderDialog();

        const versionNote = page.getByRole('textbox', {
            name: 'Version note'
        });

        await expect
            .element(versionNote)
            .toHaveValue('');
    });

    test('renders the character counters', async () => {
        renderDialog();

        await expect
            .element(page.getByText(`${defaultNote.desc.length}/180`))
            .toBeInTheDocument();

        await expect
            .element(page.getByText('0/80'))
            .toBeInTheDocument();
    });

    test('renders Cancel and Save & Sync buttons', async () => {
        renderDialog();

        await expect
            .element(page.getByRole('button', { name: 'Cancel' }))
            .toBeInTheDocument();

        await expect
            .element(page.getByRole('button', { name: 'Save & Sync' }))
            .toBeInTheDocument();
    });

    test('Save & Sync is disabled initially because version note is empty', async () => {
        renderDialog();

        await expect
            .element(page.getByRole('button', { name: 'Save & Sync' }))
            .toBeDisabled();
    });

    test('enables Save & Sync when both fields are valid', async () => {
        renderDialog();

        const description = page.getByRole('textbox', {
            name: 'Description'
        });

        const versionNote = page.getByRole('textbox', {
            name: 'Version note'
        });

        await description.fill('Updated description');
        await versionNote.fill('Updated the content');

        await expect
            .element(page.getByRole('button', { name: 'Save & Sync' }))
            .toBeEnabled();
    });

    test('updates the description character counter', async () => {
        renderDialog();

        const description = page.getByRole('textbox', {
            name: 'Description'
        });

        const value = 'Updated description';

        await description.fill(value);

        await expect
            .element(page.getByText(`${value.length}/180`))
            .toBeInTheDocument();
    });

    test('updates the version note character counter', async () => {
        renderDialog();

        const versionNote = page.getByRole('textbox', {
            name: 'Version note'
        });

        await versionNote.fill('Fixed editor issue');

        await expect
            .element(page.getByText('18/80'))
            .toBeInTheDocument();
    });

    test('disables Save & Sync when description is empty', async () => {
        renderDialog();

        const description = page.getByRole('textbox', {
            name: 'Description'
        });

        const versionNote = page.getByRole('textbox', {
            name: 'Version note'
        });

        await description.fill('');
        await versionNote.fill('Updated content');

        await expect
            .element(page.getByRole('button', { name: 'Save & Sync' }))
            .toBeDisabled();
    });

    test('disables Save & Sync when description contains only whitespace', async () => {
        renderDialog();

        const description = page.getByRole('textbox', {
            name: 'Description'
        });

        const versionNote = page.getByRole('textbox', {
            name: 'Version note'
        });

        await description.fill('   ');
        await versionNote.fill('Updated content');

        await expect
            .element(page.getByRole('button', { name: 'Save & Sync' }))
            .toBeDisabled();
    });

    test('disables Save & Sync when version note contains only whitespace', async () => {
        renderDialog();

        const description = page.getByRole('textbox', {
            name: 'Description'
        });

        const versionNote = page.getByRole('textbox', {
            name: 'Version note'
        });

        await description.fill('Valid description');
        await versionNote.fill('   ');

        await expect
            .element(page.getByRole('button', { name: 'Save & Sync' }))
            .toBeDisabled();
    });

    test('allows a description of exactly 180 characters', async () => {
        renderDialog();

        const description = page.getByRole('textbox', {
            name: 'Description'
        });

        const versionNote = page.getByRole('textbox', {
            name: 'Version note'
        });

        await description.fill('a'.repeat(180));
        await versionNote.fill('Valid version note');

        await expect
            .element(page.getByRole('button', { name: 'Save & Sync' }))
            .toBeEnabled();

        await expect
            .element(page.getByText('180/180'))
            .toBeInTheDocument();
    });

    test('allows a version note of exactly 80 characters', async () => {
        renderDialog();

        const description = page.getByRole('textbox', {
            name: 'Description'
        });

        const versionNote = page.getByRole('textbox', {
            name: 'Version note'
        });

        await description.fill('Valid description');
        await versionNote.fill('a'.repeat(80));

        await expect
            .element(page.getByRole('button', { name: 'Save & Sync' }))
            .toBeEnabled();

        await expect
            .element(page.getByText('80/80'))
            .toBeInTheDocument();
    });

    test('calls onSave with trimmed values', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);

        renderDialog({ onSave });

        const description = page.getByRole('textbox', {
            name: 'Description'
        });

        const versionNote = page.getByRole('textbox', {
            name: 'Version note'
        });

        await description.fill('   Updated description   ');
        await versionNote.fill('   Fixed the editor   ');

        await page.getByRole('button', { name: 'Save & Sync' }).click();

        await expect
            .poll(() => onSave.mock.calls.length)
            .toBe(1);

        expect(onSave).toHaveBeenCalledWith(
            'Updated description',
            'Fixed the editor'
        );
    });

    test('closes after a successful save', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);

        renderDialog({ onSave });

        await page
            .getByRole('textbox', { name: 'Version note' })
            .fill('Updated content');

        await page
            .getByRole('button', { name: 'Save & Sync' })
            .click();

        await expect
            .element(page.getByRole('dialog'))
            .toBeInTheDocument();
    });

    test('shows saving state while onSave is pending', async () => {
        let resolveSave!: () => void;

        const onSave = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveSave = resolve;
                })
        );

        renderDialog({ onSave });

        await page
            .getByRole('textbox', { name: 'Version note' })
            .fill('Updated content');

        await page
            .getByRole('button', { name: 'Save & Sync' })
            .click();

        await expect
            .element(page.getByRole('button', { name: 'Saving...' }))
            .toBeInTheDocument();

        resolveSave();
    });

    test('disables inputs while saving', async () => {
        let resolveSave!: () => void;

        const onSave = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveSave = resolve;
                })
        );

        renderDialog({ onSave });

        const description = page.getByRole('textbox', {
            name: 'Description'
        });

        const versionNote = page.getByRole('textbox', {
            name: 'Version note'
        });

        await versionNote.fill('Updated content');

        await page.getByRole('button', { name: 'Save & Sync' }).click();

        await expect.element(description).toBeDisabled();
        await expect.element(versionNote).toBeDisabled();

        resolveSave();
    });

    test('disables Cancel while saving', async () => {
        let resolveSave!: () => void;

        const onSave = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveSave = resolve;
                })
        );

        renderDialog({ onSave });

        await page
            .getByRole('textbox', { name: 'Version note' })
            .fill('Updated content');

        await page.getByRole('button', { name: 'Save & Sync' }).click();

        await expect
            .element(page.getByRole('button', { name: 'Cancel' }))
            .toBeDisabled();

        await expect
            .element(page.getByRole('button', { name: 'Close' }))
            .toBeDisabled();

        resolveSave();
    });

    test('does not allow another save while already loading', async () => {
        let resolveSave!: () => void;

        const onSave = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveSave = resolve;
                })
        );

        renderDialog({ onSave });

        await page
            .getByRole('textbox', { name: 'Version note' })
            .fill('Updated content');

        const saveButton = page.getByRole('button', {
            name: 'Save & Sync'
        });

        await saveButton.click();

        await expect
            .element(page.getByRole('button', { name: 'Saving...' }))
            .toBeInTheDocument();

        expect(onSave).toHaveBeenCalledTimes(1);

        resolveSave();
    });

    test('keeps the dialog open when saving fails', async () => {
        const onSave = vi
            .fn()
            .mockRejectedValue(new Error('Save failed'));

        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => { });

        renderDialog({ onSave });

        await page
            .getByRole('textbox', { name: 'Version note' })
            .fill('Updated content');

        await page.getByRole('button', { name: 'Save & Sync' }).click();

        await expect
            .element(page.getByRole('dialog'))
            .toBeInTheDocument();

        expect(onSave).toHaveBeenCalledWith(
            defaultNote.desc,
            'Updated content'
        );

        consoleError.mockRestore();
    });

    test('re-enables the dialog after saving fails', async () => {
        const onSave = vi
            .fn()
            .mockRejectedValue(new Error('Save failed'));

        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => { });

        renderDialog({ onSave });

        await page
            .getByRole('textbox', { name: 'Version note' })
            .fill('Updated content');

        await page.getByRole('button', { name: 'Save & Sync' }).click();

        await expect
            .element(page.getByRole('button', { name: 'Cancel' }))
            .toBeEnabled();

        await expect
            .element(
                page.getByRole('button', { name: 'Save & Sync' })
            )
            .toBeEnabled();

        consoleError.mockRestore();
    });

    test('closes when Cancel is clicked', async () => {
        renderDialog();

        await page.getByRole('button', { name: 'Cancel' }).click();

        await expect
            .element(page.getByRole('dialog'))
            .not.toBeInTheDocument();
    });

    test('closes when the Close button is clicked', async () => {
        renderDialog();

        await page.getByRole('button', { name: 'Close' }).click();

        await expect
            .element(page.getByRole('dialog'))
            .not.toBeInTheDocument();
    });

    test('does not close from the Close button while loading', async () => {
        renderDialog({ loading: true });

        await expect
            .element(page.getByRole('button', { name: 'Close' }))
            .toBeDisabled();
    });

    test('does not close from Cancel while loading', async () => {
        renderDialog({ loading: true });

        await expect
            .element(page.getByRole('button', { name: 'Cancel' }))
            .toBeDisabled();
    });

    test('closes when Escape is pressed', async () => {
        renderDialog();

        await userEvent.keyboard('{Escape}');

        await expect
            .element(page.getByRole('dialog'))
            .not.toBeInTheDocument();
    });

    test('does not close with Escape while loading', async () => {
        renderDialog({ loading: true });

        await userEvent.keyboard('{Escape}');

        await expect
            .element(page.getByRole('dialog'))
            .toBeInTheDocument();
    });

    test('does not close when clicking inside the dialog', async () => {
        renderDialog();

        const dialog = page.getByRole('dialog');

        await dialog.click();

        await expect
            .element(dialog)
            .toBeInTheDocument();
    });

    test('does not save when the form is invalid', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);

        renderDialog({ onSave });

        await expect
            .element(page.getByRole('button', { name: 'Save & Sync' }))
            .toBeDisabled();

        expect(onSave).not.toHaveBeenCalled();
    });

    test('saves with Ctrl+Enter', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);

        renderDialog({ onSave });

        await page
            .getByRole('textbox', { name: 'Version note' })
            .fill('Updated content');

        await userEvent.keyboard('{Control>}{Enter}{/Control}');

        await expect
            .poll(() => onSave.mock.calls.length)
            .toBe(1);

        expect(onSave).toHaveBeenCalledWith(
            defaultNote.desc,
            'Updated content'
        );
    });

    test('saves with Meta+Enter', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);

        renderDialog({ onSave });

        await page
            .getByRole('textbox', { name: 'Version note' })
            .fill('Updated content');

        await userEvent.keyboard('{Meta>}{Enter}{/Meta}');

        await expect
            .poll(() => onSave.mock.calls.length)
            .toBe(1);

        expect(onSave).toHaveBeenCalledWith(
            defaultNote.desc,
            'Updated content'
        );
    });

    test('does not save with Ctrl+Enter when fields are invalid', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);

        renderDialog({ onSave });

        await userEvent.keyboard('{Control>}{Enter}{/Control}');

        expect(onSave).not.toHaveBeenCalled();
    });

    test('does not save with Meta+Enter when fields are invalid', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);

        renderDialog({ onSave });

        await userEvent.keyboard('{Meta>}{Enter}{/Meta}');

        expect(onSave).not.toHaveBeenCalled();
    });

    test('renders the provided loading state', async () => {
        renderDialog({ loading: true });

        await expect
            .element(page.getByRole('button', { name: 'Saving...' }))
            .toBeInTheDocument();
    });

    test('Save & Sync is disabled while loading', async () => {
        renderDialog({ loading: true });

        await expect
            .element(page.getByRole('button', { name: 'Saving...' }))
            .toBeDisabled();
    });
});