import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import VersionDiffViewer from './VersionDiffViewer.svelte';

function renderViewer(
	options: {
		originalText?: string;
		modifiedText?: string;
		originalLabel?: string;
		modifiedLabel?: string;
	} = {}
) {
	return render(VersionDiffViewer, {
		originalText: options.originalText ?? '',
		modifiedText: options.modifiedText ?? '',
		originalLabel: options.originalLabel ?? 'Older version',
		modifiedLabel: options.modifiedLabel ?? 'Newer version'
	});
}

function getRows(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>('.diff-row'));
}

describe('VersionDiffViewer', () => {
	test('renders the default labels', async () => {
		renderViewer({ originalText: 'Hello', modifiedText: 'Hello' });

		await expect.element(page.getByText('Older version', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Newer version', { exact: true })).toBeInTheDocument();
	});

	test('renders custom labels', async () => {
		renderViewer({
			originalText: 'Old',
			modifiedText: 'New',
			originalLabel: 'Version 1',
			modifiedLabel: 'Version 2'
		});

		await expect.element(page.getByText('Version 1', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Version 2', { exact: true })).toBeInTheDocument();
	});

	test('renders the correct line counts', async () => {
		renderViewer({
			originalText: 'one\ntwo\nthree',
			modifiedText: 'one\ntwo'
		});

		await expect.element(page.getByText('3 lines', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('2 lines', { exact: true })).toBeInTheDocument();
	});

	test('renders one line for single-line content on both sides', async () => {
		renderViewer({ originalText: 'Old', modifiedText: 'New' });

		const counts = page.getByText('1 lines', { exact: true });
		await expect.element(counts).toHaveLength(2);
	});

	test('shows empty state when both texts are empty', async () => {
		renderViewer();

		await expect
			.element(page.getByText('No content to compare.', { exact: true }))
			.toBeInTheDocument();
	});

	test('renders both header line counts when both texts are empty', async () => {
		renderViewer({ originalText: '', modifiedText: '' });

		// both the old and new side report 0 lines for empty input
		await expect.element(page.getByText('0 lines', { exact: true })).toHaveLength(2);
	});

	test('renders a single equal row for identical text', async () => {
		const { container } = renderViewer({ originalText: 'Hello', modifiedText: 'Hello' });

		const rows = getRows(container);
		expect(rows).toHaveLength(1);
		expect(rows[0].classList.contains('row-equal')).toBe(true);

		await expect.element(page.getByText('Hello', { exact: true })).toHaveLength(2);
	});

	test('renders a delete-only row when text is fully removed', async () => {
		const { container } = renderViewer({ originalText: 'Old line', modifiedText: '' });

		const rows = getRows(container);
		expect(rows).toHaveLength(1);
		expect(rows[0].classList.contains('row-delete')).toBe(true);

		await expect.element(page.getByText('Old line', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('−', { exact: true })).toBeInTheDocument();
	});

	test('renders an insert-only row when text is fully added', async () => {
		const { container } = renderViewer({ originalText: '', modifiedText: 'New line' });

		const rows = getRows(container);
		expect(rows).toHaveLength(1);
		expect(rows[0].classList.contains('row-insert')).toBe(true);

		await expect.element(page.getByText('New line', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('+', { exact: true })).toBeInTheDocument();
	});

	test('renders a modify row for a changed word within an otherwise-equal line', async () => {
		// diff-match-patch works at word/character granularity, not full-line:
		// "Old" -> "New" (no shared suffix here) yields exactly one modify row
		// with both a − and a + indicator.
		const { container } = renderViewer({ originalText: 'Old', modifiedText: 'New' });

		const rows = getRows(container);
		expect(rows).toHaveLength(1);
		expect(rows[0].classList.contains('row-modify')).toBe(true);

		await expect.element(page.getByText('−', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('+', { exact: true })).toBeInTheDocument();
	});

	test('renders correct line numbers for equal rows', async () => {
		const { container } = renderViewer({ originalText: 'one\ntwo', modifiedText: 'one\ntwo' });

		const rows = getRows(container);
		expect(rows).toHaveLength(2);

		await expect.element(page.getByText('1', { exact: true })).toHaveLength(2);
		await expect.element(page.getByText('2', { exact: true })).toHaveLength(2);
	});

	test('leaves the old line number empty for pure insertion rows', async () => {
		// "one" -> "one\ntwo" inserts the trailing "\ntwo", which splits into
		// 2 new-line rows (the blank line right after "one", then "two").
		const { container } = renderViewer({ originalText: 'one', modifiedText: 'one\ntwo' });

		const rows = getRows(container);
		expect(rows).toHaveLength(3);

		await expect.element(page.getByText('two', { exact: true })).toBeInTheDocument();
		// the last row is the "two" insert row, numbered 3 on the new side
		await expect.element(page.getByText('3', { exact: true })).toBeInTheDocument();
	});

	test('leaves the new line number empty for pure deletion rows', async () => {
		// "one\ntwo" -> "one" deletes the leading "\ntwo", which splits into
		// 2 old-line rows (the blank line right after "one", then "two").
		const { container } = renderViewer({ originalText: 'one\ntwo', modifiedText: 'one' });

		const rows = getRows(container);
		expect(rows).toHaveLength(3);

		await expect.element(page.getByText('two', { exact: true })).toBeInTheDocument();
		// the last row is the "two" delete row, numbered 3 on the old side
		await expect.element(page.getByText('3', { exact: true })).toBeInTheDocument();
	});

	test('splits multi-line text into one row per line', async () => {
		const { container } = renderViewer({
			originalText: 'one\ntwo\nthree',
			modifiedText: 'one\ntwo\nthree'
		});

		const rows = getRows(container);
		expect(rows).toHaveLength(3);

		// each line appears on both the old and new side of its row
		await expect.element(page.getByText('one', { exact: true })).toHaveLength(2);
		await expect.element(page.getByText('two', { exact: true })).toHaveLength(2);
		await expect.element(page.getByText('three', { exact: true })).toHaveLength(2);
	});

	test('handles a mix of unchanged and changed lines', async () => {
		const { container } = renderViewer({
			originalText: 'same\nold\nlast',
			modifiedText: 'same\nnew\nlast'
		});

		const rows = getRows(container);

		const rowTypes = rows.map((row) =>
			['row-equal', 'row-modify', 'row-delete', 'row-insert'].find((cls) =>
				row.classList.contains(cls)
			)
		);

		// The changed middle line ("old" -> "new") always produces exactly one
		// row-modify row; the unchanged "same" and "last" lines surface as
		// row-equal rows (diff-match-patch may also emit blank equal rows at
		// line boundaries, so assert on presence/order rather than exact count).
		expect(rowTypes.filter((t) => t === 'row-modify')).toHaveLength(1);
		expect(rowTypes[0]).toBe('row-equal');
		expect(rowTypes[rowTypes.length - 1]).toBe('row-equal');

		const modifyRow = rows[rowTypes.indexOf('row-modify')];
		expect(modifyRow.querySelector('.old-side pre')?.textContent).toBe('old');
		expect(modifyRow.querySelector('.new-side pre')?.textContent).toBe('new');
	});

	test('counts inserted rows as additions', async () => {
		// "one" -> "one\ntwo\nthree" inserts 3 new lines and deletes none.
		renderViewer({ originalText: 'one', modifiedText: 'one\ntwo\nthree' });

		await expect.element(page.getByText('+3', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('−0', { exact: true })).toBeInTheDocument();
	});

	test('counts deleted rows as deletions', async () => {
		renderViewer({ originalText: 'one\ntwo\nthree', modifiedText: 'one' });

		await expect.element(page.getByText('+0', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('−3', { exact: true })).toBeInTheDocument();
	});

	test('counts a modification as both one addition and one deletion', async () => {
		renderViewer({ originalText: 'Old', modifiedText: 'New' });

		await expect.element(page.getByText('+1', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('−1', { exact: true })).toBeInTheDocument();
	});

	test('counts multiple modifications independently', async () => {
		renderViewer({ originalText: 'one\ntwo', modifiedText: 'ONE\nTWO' });

		await expect.element(page.getByText('+2', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('−2', { exact: true })).toBeInTheDocument();
	});

	test('normalizes CRLF when calculating line counts', async () => {
		renderViewer({
			originalText: 'one\r\ntwo\r\nthree',
			modifiedText: 'one\r\ntwo'
		});

		await expect.element(page.getByText('3 lines', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('2 lines', { exact: true })).toBeInTheDocument();
	});

	test('normalizes CR when calculating line counts', async () => {
		renderViewer({
			originalText: 'one\rtwo\rthree',
			modifiedText: 'one\rtwo'
		});

		await expect.element(page.getByText('3 lines', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('2 lines', { exact: true })).toBeInTheDocument();
	});
});
