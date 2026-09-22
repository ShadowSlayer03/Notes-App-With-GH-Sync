import { expect, test, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { http, HttpResponse } from 'msw';
import { worker } from '$lib/test/msw/browser';
import RecentNotesQueryWrapper from '$lib/test/wrappers/RecentNotesQueryWrapper.svelte';

vi.mock('$app/navigation', () => ({
    goto: vi.fn()
}));

test('renders the "Recent Notes" heading', async () => {
    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText('Recent Notes'))
        .toBeInTheDocument();
});

test('renders the "View all" button', async () => {
    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByRole('button', { name: 'View all' }))
        .toBeInTheDocument();
});

test('renders 5 skeleton rows while the query is pending', async () => {
    worker.use(
        http.get('*/api/notes', async () => {
            await new Promise(() => { });
        })
    );

    render(RecentNotesQueryWrapper);

    const skeletons = document.querySelectorAll('.animate-pulse');

    expect(skeletons.length).toBe(5);
});

test('renders note titles after a successful fetch', async () => {
    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText('Meeting Notes'))
        .toBeInTheDocument();

    await expect
        .element(page.getByText('Project Plan'))
        .toBeInTheDocument();
});

test('renders note descriptions after a successful fetch', async () => {
    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText('Notes from the standup'))
        .toBeInTheDocument();
});

test('renders at most 5 notes when more than 5 are returned', async () => {
    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText('Meeting Notes'))
        .toBeInTheDocument();

    await expect
        .element(page.getByText('Sixth Note'))
        .not.toBeInTheDocument();
});

test('sorts notes by most recently updated first', async () => {
    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText('Project Plan'))
        .toBeInTheDocument();

    const links = document.querySelectorAll('a[href^="/notes/"]');

    expect(links[0].textContent).toContain('Project Plan');
});

test('renders the updater avatar for each note', async () => {
    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText('Meeting Notes'))
        .toBeInTheDocument();

    const avatars = document.querySelectorAll('img[alt="Editor context profile"]');

    expect(avatars.length).toBeGreaterThan(0);
});

test('renders the pin icon only for pinned notes', async () => {
    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText('Project Plan'))
        .toBeInTheDocument();

    const pinIcons = document.querySelectorAll('.fill-amber-400');

    expect(pinIcons.length).toBe(1);
});

test('each note links to the correct /notes/:id URL with folder param', async () => {
    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText('Meeting Notes'))
        .toBeInTheDocument();

    const meetingLink = Array.from(document.querySelectorAll('a[href^="/notes/"]')).find(
        (el) => el.textContent?.includes('Meeting Notes')
    );

    expect(meetingLink).toBeDefined();
    expect(meetingLink?.getAttribute('href')).toBe('/notes/meeting_notes?folder=work');
});

test('renders the empty state when no notes are returned', async () => {
    worker.use(
        http.get('*/api/notes', () => HttpResponse.json({ "message": "Notes retreived successfully!", data: [] }))
    );

    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText('No recent notes'))
        .toBeInTheDocument();

    await expect
        .element(page.getByText('Your recently edited notes will appear here.'))
        .toBeInTheDocument();
});

test('renders the error state when the fetch fails', async () => {
    worker.use(
        http.get('*/api/notes', () => HttpResponse.json({ message: 'Internal server error' }, { status: 500 }))
    );

    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText("Couldn't load recent notes"))
        .toBeInTheDocument();
});

test('renders a "Try Again" button in the error state', async () => {
    worker.use(
        http.get('*/api/notes', () => HttpResponse.json({ message: 'Internal server error' }, { status: 500 }))
    );

    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByRole('button', { name: 'Try Again' }))
        .toBeInTheDocument();
});

test('displays the error message returned by the server', async () => {
    worker.use(
        http.get('*/api/notes', () =>
            HttpResponse.json({ message: 'Something went wrong on our end' }, { status: 500 })
        )
    );

    render(RecentNotesQueryWrapper);

    await expect
        .element(page.getByText('Something went wrong on our end'))
        .toBeInTheDocument();
});

test('clicking "View all" navigates to /folders/all-notes', async () => {
    const { goto } = await import('$app/navigation');

    render(RecentNotesQueryWrapper);

    await page.getByRole('button', { name: 'View all' }).click();

    expect(goto).toHaveBeenCalledWith('/folders/all-notes');
});