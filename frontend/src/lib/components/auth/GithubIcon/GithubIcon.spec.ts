import { expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';

import GithubIcon from './GithubIcon.svelte';

test('renders an SVG with the default size prop', async () => {
	render(GithubIcon, {
		props: { size: 24 }
	});

	const svg = page.getByRole('img');
	await expect(svg).toBeInTheDocument();
	await expect.element(svg).toHaveAttribute('size', '24');
});

test('renders an SVG with a custom size prop', async () => {
	const customSize = 48;
	render(GithubIcon, {
		props: { size: customSize }
	});

	const svg = page.getByRole('img');
	 expect(svg).toBeInTheDocument();
	await expect.element(svg).toHaveAttribute('size', String(customSize));
});

test('passes through additional attributes via rest props', async () => {
	render(GithubIcon, {
		props: {
			size: 32,
			class: 'custom-class',
			'aria-label': 'GitHub logo'
		}
	});

	const svg = page.getByRole('img');
	await expect(svg).toBeInTheDocument();
	await expect.element(svg).toHaveAttribute('size', '32');
	await expect.element(svg).toHaveAttribute('class', 'custom-class');
	await expect.element(svg).toHaveAttribute('aria-label', 'GitHub logo');
});