import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import ErrorState from "./ErrorState.svelte";

test('renders ErrorState component with correct text', () => {
    render(ErrorState);

    const errorStateHeading = page.getByText(/Couldn't load your notes/i);
    const noteIcon = page.getByTestId('note-icon');
    const fetchNotesAgainBtn = page.getByRole('button', { name: /Try Again/i });

    expect(noteIcon).toBeInTheDocument();
    expect(errorStateHeading).toBeInTheDocument();
    expect(fetchNotesAgainBtn).toBeInTheDocument();
});

test('message passed by props is rendered correctly', ()=>{
    render(ErrorState, { props: { message: "An error occurred while fetching notes.", refetch: ()=>{} }});
    
    const errorStateDescription = page.getByText(/An error occurred while fetching notes./i);
    expect(errorStateDescription).toBeInTheDocument();
});

test('button click triggers the getNotes event', async () => {
    const mockRefetch = vi.fn();
    render(ErrorState, { props: { message: "An error occurred while fetching notes.", refetch: mockRefetch }});

    const fetchNotesAgainBtn = page.getByRole('button', { name: /Try Again/i });
    await fetchNotesAgainBtn.click();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
}); 