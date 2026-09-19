import { expect, test } from "vitest";
import FolderSkeleton from "./FolderSkeleton.svelte";
import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";

test('renders FolderSkeleton properly', async () => {
    render(FolderSkeleton);

    await expect
        .element(page.getByTestId('main-animated-skeleton'))
        .toBeInTheDocument();

    await expect
        .element(page.getByTestId('top-box-skeleton'))
        .toBeInTheDocument();

        await expect
        .element(page.getByTestId('icon-skeleton'))
        .toBeInTheDocument();

        await expect
        .element(page.getByTestId('num-notes-skeleton'))
        .toBeInTheDocument();

    await expect
        .element(page.getByTestId('bottom-text-skeleton'))
        .toBeInTheDocument();
});

test('Main skeleton has an animated pulse effect', async()=>{
    render(FolderSkeleton);

    await expect
        .element(page.getByTestId('main-animated-skeleton'))
        .toHaveClass('animate-pulse');
});