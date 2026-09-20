<script lang="ts">
	import FolderList from '$lib/components/home/FolderList/FolderList.svelte';
	import RecentNotes from '$lib/components/home/RecentNotes/RecentNotes.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { api } from '$lib/util/api';
	import { createQuery } from '@tanstack/svelte-query';
	import type { Folder } from '../../../types/pages/folder.types';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';

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

	let search = $state('');

	const isLoading = $derived(getAllFoldersQuery.isPending);

	const folders = $derived.by(() => {
		const result = getAllFoldersQuery.data ?? [];

		return result.filter((folder: Folder) =>
			folder.title.toLowerCase().includes(search.toLowerCase())
		);
	});
</script>

<div class="p-6 text-white bg-[#0D0F12] h-full">
	<PageHeader bind:search />
	<div class="p-4">
		<div class="mt-5 mb-10">
			<FolderList {folders} {isLoading} />
		</div>
		<RecentNotes />
	</div>
</div>
