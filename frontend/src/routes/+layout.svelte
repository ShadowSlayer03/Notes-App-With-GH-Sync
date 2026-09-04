<script lang="ts">
	import type { Snippet } from 'svelte';
	import './layout.css';
	import { appUrl, mainDesc, mainTitle } from '$lib/constants/app';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import queryClient from '$lib/util/queryClient';

	interface Props {
		data: {
			title?: string;
			description?: string;
		};
		children: Snippet;
	}

	let { data, children }: Props = $props();

	let title = $derived(data?.title ?? mainTitle);
	let description = $derived(data?.description ?? mainDesc);
</script>

<svelte:head>
	<title>{title}</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" href={"favicon.ico"} />

	<meta name="description" content={description} />
	<meta
		name="keywords"
		content="markdown notes, git notes, github notes, knowledge management, second brain, developer notes, markdown editor, note taking app, version control notes"
	/>
	<meta name="author" content="Kairno" />
	<meta name="robots" content="index, follow, max-image-preview:large" />
	<link rel="canonical" href={appUrl} />

	<meta name="theme-color" content="#0B0B12" />
	<meta name="color-scheme" content="dark" />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Kairno" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={appUrl} />
	<meta property="og:image" content={`${appUrl}/og-image.png`} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={`${appUrl}/og-image.png`} />

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
		rel="stylesheet"
	/>

	<link rel="manifest" href="/manifest.json" />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Kairno',
		applicationCategory: 'ProductivityApplication',
		operatingSystem: 'Web',
		description: description,
		url: appUrl,
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD'
		}
	})}</script>`}
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
