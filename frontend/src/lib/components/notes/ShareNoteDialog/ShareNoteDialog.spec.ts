import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page, userEvent } from 'vitest/browser';

import ShareNoteDialog from './ShareNoteDialog.svelte';

const shareUrl = 'https://kairno.app/share/abc123';

function renderDialog(
    options: {
        open?: boolean;
        shareUrl?: string;
    } = {}
) {
    return render(ShareNoteDialog, {
        open: options.open ?? true,
        shareUrl: options.shareUrl ?? shareUrl
    });
}

describe('ShareNoteDialog', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText: vi.fn().mockResolvedValue(undefined)
            }
        });

        vi.stubGlobal('open', vi.fn());
    });

    test('does not render when closed', async () => {
        renderDialog({ open: false });

        await expect
            .element(page.getByRole('dialog'))
            .not.toBeInTheDocument();
    });

    test('renders the share dialog when open', async () => {
        renderDialog();

        await expect
            .element(page.getByRole('dialog'))
            .toBeInTheDocument();

        await expect
            .element(page.getByRole('heading', { name: 'Share note' }))
            .toBeInTheDocument();
    });

    test('renders the share description', async () => {
        renderDialog();

        await expect
            .element(
                page.getByText('Anyone with this link can view this note.')
            )
            .toBeInTheDocument();
    });

    test('renders the provided share URL', async () => {
        renderDialog();

        await expect
            .element(page.getByText(shareUrl, { exact: true }))
            .toBeInTheDocument();
    });

    test('renders the share link label', async () => {
        renderDialog();

        await expect
            .element(page.getByText('Share link', { exact: true }))
            .toBeInTheDocument();
    });

    test('renders the Copy button', async () => {
        renderDialog();

        await expect
            .element(page.getByRole('button', { name: 'Copy' }))
            .toBeInTheDocument();
    });

    test('renders all share options', async () => {
        renderDialog();

        await expect
            .element(page.getByRole('button', { name: 'X' }))
            .toBeInTheDocument();

        await expect
            .element(page.getByRole('button', { name: 'Facebook' }))
            .toBeInTheDocument();

        await expect
            .element(page.getByRole('button', { name: 'LinkedIn' }))
            .toBeInTheDocument();

        await expect
            .element(page.getByRole('button', { name: 'Email' }))
            .toBeInTheDocument();
    });

    test('renders the close button', async () => {
        renderDialog();

        await expect
            .element(page.getByRole('button', { name: 'Close' }))
            .toBeInTheDocument();
    });

    test('closes when the close button is clicked', async () => {
        renderDialog();

        await page.getByRole('button', { name: 'Close' }).click();

        await expect
            .element(page.getByTestId('share-note-dialog'))
            .not.toBeInTheDocument();
    });

    test('does not close when clicking inside the dialog', async () => {
        renderDialog();

        const shareNoteDialog = page.getByTestId('share-note-dialog');

        await shareNoteDialog.click();

        await expect
            .element(shareNoteDialog)
            .toBeInTheDocument();
    });

    test('closes when Escape is pressed', async () => {
        renderDialog();

        await userEvent.keyboard('{Escape}')

        await expect
            .element(page.getByTestId('share-note-dialog'))
            .not.toBeInTheDocument();
    });

    test('copies the share URL when Copy is clicked', async () => {
        renderDialog();

        await page.getByRole('button', { name: 'Copy' }).click();

        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(shareUrl);
    });

    test('changes Copy button to Copied after successfully copying', async () => {
        renderDialog();

        await page.getByRole('button', { name: 'Copy' }).click();

        await expect
            .element(page.getByRole('button', { name: 'Copied' }))
            .toBeInTheDocument();
    });

    test('resets Copied state after two seconds', async () => {
        vi.useFakeTimers();

        renderDialog();

        await page.getByRole('button', { name: 'Copy' }).click();

        await expect
            .element(page.getByRole('button', { name: 'Copied' }))
            .toBeInTheDocument();

        vi.advanceTimersByTime(2000);

        await expect
            .element(page.getByRole('button', { name: 'Copy' }))
            .toBeInTheDocument();

        vi.useRealTimers();
    });

    test('does not show Copied when clipboard copy fails', async () => {
        const writeText = vi
            .fn()
            .mockRejectedValue(new Error('Clipboard unavailable'));

        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {
                writeText
            }
        });

        const consoleError = vi
            .spyOn(console, 'error')
            .mockImplementation(() => { });

        renderDialog();

        await page.getByRole('button', { name: 'Copy' }).click();

        await expect
            .element(page.getByRole('button', { name: 'Copy' }))
            .toBeInTheDocument();

        expect(writeText).toHaveBeenCalledWith(shareUrl);
        expect(consoleError).toHaveBeenCalled();

        consoleError.mockRestore();
    });

    test('opens X sharing URL', async () => {
        renderDialog();

        await page.getByRole('button', { name: 'X' }).click();

        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = encodeURIComponent(
            'Check out this note on Kairno'
        );

        expect(window.open).toHaveBeenCalledWith(
            `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            '_blank',
            'width=600,height=600,noopener,noreferrer'
        );
    });

    test('opens Facebook sharing URL', async () => {
        renderDialog();

        await page.getByRole('button', { name: 'Facebook' }).click();

        const encodedUrl = encodeURIComponent(shareUrl);

        expect(window.open).toHaveBeenCalledWith(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            '_blank',
            'width=600,height=600,noopener,noreferrer'
        );
    });

    test('opens LinkedIn sharing URL', async () => {
        renderDialog();

        await page.getByRole('button', { name: 'LinkedIn' }).click();

        const encodedUrl = encodeURIComponent(shareUrl);

        expect(window.open).toHaveBeenCalledWith(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            '_blank',
            'width=600,height=600,noopener,noreferrer'
        );
    });

    test('opens email sharing URL', async () => {
        renderDialog();

        await page.getByRole('button', { name: 'Email' }).click();

        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = encodeURIComponent(
            'Check out this note on Kairno'
        );

        expect(window.open).toHaveBeenCalledWith(
            `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
            '_blank',
            'width=600,height=600,noopener,noreferrer'
        );
    });

    test('encodes special characters in the share URL', async () => {
        const specialShareUrl =
            'https://kairno.app/share/abc?foo=hello world&bar=a+b';

        renderDialog({
            shareUrl: specialShareUrl
        });

        await page.getByRole('button', { name: 'X' }).click();

        expect(window.open).toHaveBeenCalledWith(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                specialShareUrl
            )}&text=${encodeURIComponent('Check out this note on Kairno')}`,
            '_blank',
            'width=600,height=600,noopener,noreferrer'
        );
    });

    test('resets copied state when the dialog is closed', async () => {
        renderDialog();

        await page.getByRole('button', { name: 'Copy' }).click();

        await expect
            .element(page.getByRole('button', { name: 'Copied' }))
            .toBeInTheDocument();

        await page.getByRole('button', { name: 'Close' }).click();

        await expect
            .element(page.getByRole('dialog'))
            .not.toBeInTheDocument();
    });
});