<script lang="ts">
	import { api } from '$lib/util/api';
	import { createQuery } from '@tanstack/svelte-query';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { ArrowLeft } from '@boxicons/svelte';
	import type { Folder } from '../../../types/pages/folder.types';
	import FolderBox from '$lib/components/home/FolderBox/FolderBox.svelte';

	const getAllFoldersQuery = createQuery(() => ({
		queryKey: ['get-folders'],
		queryFn: () =>
			api<Folder[]>(`${PUBLIC_BACKEND_URI}/api/folders`, {
				method: 'GET',
				credentials: 'include'
			}),
		staleTime: 1000 * 60 * 20,
		retry: false
	}));

	const isLoading = $derived(getAllFoldersQuery.isPending);
	const isError = $derived(getAllFoldersQuery.isError);

	const folders = $derived(getAllFoldersQuery.data ?? []);

	function goBack() {
		goto('/home');
	}
</script>

<svelte:head>
	<title>All Folders | Kairno</title>
	<meta
		name="description"
		content="Browse all your folders in Kairno."
	/>
</svelte:head>

<div class="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
	<div class="mb-8">
		<button
			type="button"
			onclick={goBack}
			class="mb-8 flex cursor-pointer items-center gap-2 rounded-lg text-sm text-zinc-500 transition hover:text-zinc-200"
		>
			<ArrowLeft class="h-4 w-4" />
			<span>Back to Home</span>
		</button>

		<div>
			<h1 class="text-2xl font-semibold tracking-tight text-white">
				All Folders
			</h1>

			<p class="mt-1 text-sm text-zinc-500">
				{#if isLoading}
					Your folders
				{:else}
					{folders.length}
					{folders.length === 1 ? 'folder' : 'folders'}
				{/if}
			</p>
		</div>
	</div>

	{#if isLoading}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
			{#each Array(8) as _}
				<div
					class="h-40 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/40"
				></div>
			{/each}
		</div>

	{:else if isError}
		<div
			class="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-[#111318] px-6 text-center"
		>
			<h2 class="text-sm font-medium text-zinc-200">
				Unable to load folders
			</h2>

			<p class="mt-1 text-sm text-zinc-500">
				Something went wrong while fetching your folders.
			</p>
		</div>

	{:else if folders.length === 0}
		<div
			class="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 px-6 text-center"
		>
			<h2 class="text-sm font-medium text-zinc-200">
				No folders yet
			</h2>

			<p class="mt-1 max-w-sm text-sm text-zinc-500">
				Create your first folder to start organizing your notes.
			</p>
		</div>

	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
			{#each folders as folder (folder.id)}
				<FolderBox {...folder} />
			{/each}
		</div>
	{/if}
</div>