import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import LoadingState from './LoadingState.svelte';

describe('LoadingState', () => {
    test('renders the notes table', async () => {
        render(LoadingState);

        await expect
            .element(page.getByRole('table'))
            .toBeInTheDocument();
    });

    test('renders all table column headers', async () => {
        render(LoadingState);

        await expect
            .element(page.getByText('Title', { exact: true }))
            .toBeInTheDocument();

        await expect
            .element(page.getByText('Last edited', { exact: true }))
            .toBeInTheDocument();

        await expect
            .element(page.getByText('Updated by', { exact: true }))
            .toBeInTheDocument();
    });

    test('renders 8 loading rows', async () => {
        render(LoadingState);

        const rows = page.getByRole('row');

        expect(rows).toHaveLength(9);
    });

    test('renders 8 skeleton note title placeholders', async () => {
        render(LoadingState);

        const titleSkeletons = page.getByTestId('title-skeleton');

        expect(titleSkeletons).toHaveLength(8);
    });

    test('renders 8 note icon skeletons', async () => {
        render(LoadingState);

        const iconSkeletons = page.getByTestId('icon-skeleton');

        expect(iconSkeletons).toHaveLength(8);
    });

    test('renders 8 last-edited skeletons', async () => {
        render(LoadingState);

        const lastEditedSkeletons =
            page.getByTestId('last-edited-skeleton');

        expect(lastEditedSkeletons).toHaveLength(8);
    });

    test('renders 8 updater skeletons', async () => {
        render(LoadingState);

        const updaterSkeletons =
            page.getByTestId('updated-by-skeleton');

        expect(updaterSkeletons).toHaveLength(8);
    });

    test('does not render actual note content while loading', async () => {
        render(LoadingState);

        await expect
            .element(page.getByText('Meeting Notes'))
            .not.toBeInTheDocument();

        await expect
            .element(page.getByText('Last edited'))
            .toBeInTheDocument();
    });
});