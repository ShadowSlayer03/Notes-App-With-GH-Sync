<script lang="ts">
	import { ChevronRight } from '@boxicons/svelte';
	import FolderBox from '../FolderBox/FolderBox.svelte';
	import FolderBoxCreate from '../FolderBoxCreate/FolderBoxCreate.svelte';
	import FolderSkeleton from '../FolderSkeleton/FolderSkeleton.svelte';
	import { goto } from '$app/navigation';

	/*
	const foldersConstants = [
		{
			id: '1',
			title: 'All Notes',
			noteCount: 128,
			createdAt: '',
			updatedAt: '',
			icon: 'star',
			theme: 'paper'
		},
		{
			id: '2',
			title: 'Daily',
			noteCount: 65,
			createdAt: '',
			updatedAt: '',
			icon: 'sun',
			theme: 'paper'
		},
		{
			id: '3',
			title: 'Personal',
			noteCount: 43,
			createdAt: '',
			updatedAt: '',
			icon: 'star',
			isLocked: true,
			theme: 'midnight'
		},
		{
			id: '4',
			title: 'Work',
			noteCount: 80,
			createdAt: '',
			updatedAt: '',
			icon: 'work',
			theme: 'paper'
		},
		{
			id: '5',
			title: 'Shared Notes',
			noteCount: 23,
			createdAt: '',
			updatedAt: '',
			icon: 'shared',
			theme: 'paper'
		}
	] satisfies Folder[];
	 */

	const { folders, isLoading } = $props();

	const handleClickViewAllFolders = () => {
		goto('/all');
	};
</script>

<div class="space-y-4 px-2">
	<div class="flex items-center justify-between">
		<h2 class="text-sm font-semibold text-zinc-300 tracking-wider uppercase" data-testid="folderlist-heading">Folders</h2>
		<button
			class="flex items-center gap-0.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
			onclick={handleClickViewAllFolders}
		>
			<span>View all</span>
			<ChevronRight class="h-3.5 w-3.5" />
		</button>
	</div>

	<div class="grid grid-cols-2 gap-x-12 gap-y-5 sm:flex sm:flex-wrap">
		{#if isLoading}
			{#each Array(5) as _}
				<FolderSkeleton />
			{/each}
		{:else}
			{#each folders.slice(0, 5) as folder}
				<FolderBox {...folder} />
			{/each}

			<FolderBoxCreate />
		{/if}
	</div>
</div>
