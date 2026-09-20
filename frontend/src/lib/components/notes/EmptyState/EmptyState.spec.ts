import { expect, test } from "vitest";
import { render } from "vitest-browser-svelte";
import EmptyState from "./EmptyState.svelte";
import { page } from "vitest/browser";

test('renders EmptyState component with correct text', () => {
    render(EmptyState);

    const emptyStateHeading = page.getByText(/No notes yet/i);
    const emptyStateDescription = page.getByText(/Create your first note and it will be stored directly inside this GitHub folder./i);
    const noteIcon = page.getByTestId('note-icon');

    expect(noteIcon).toBeInTheDocument();
    expect(emptyStateHeading).toBeInTheDocument();
    expect(emptyStateDescription).toBeInTheDocument();
});

test('noteIcon and description is rendered in a different color', ()=>{
    render(EmptyState);
    
    const emptyStateDescription = page.getByText(/Create your first note and it will be stored directly inside this GitHub folder./i);
    const noteIcon = page.getByTestId('note-icon');

    expect(noteIcon).toHaveClass('text-zinc-500');
    expect(emptyStateDescription).toHaveClass('text-zinc-500');
});