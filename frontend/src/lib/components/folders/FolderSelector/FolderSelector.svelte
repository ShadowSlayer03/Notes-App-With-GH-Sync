<script lang="ts">
	import type { Folder } from '../../../../types/pages/folder.types';
	import { Folder as FolderIcon, Check, ChevronDown } from '@boxicons/svelte';

	type Props = {
		folders: Folder[];
		selectedFolderId: string;
		placeholder?: string;
	};

	let {
		folders,
		selectedFolderId = $bindable(),
		placeholder = 'Select a folder'
	}: Props = $props();

	let open = $state(false);

	let wrapper: HTMLDivElement | undefined;

	const selectedFolder = $derived(folders.find((folder) => folder.id === selectedFolderId));

	function selectFolder(id: string) {
		selectedFolderId = id;
		open = false;
	}

	$effect(() => {
		function handleClick(event: MouseEvent) {
			if (!wrapper?.contains(event.target as Node)) {
				open = false;
			}
		}

		window.addEventListener('click', handleClick);

		return () => {
			window.removeEventListener('click', handleClick);
		};
	});
</script>

<div bind:this={wrapper} class="relative">
	<button
		type="button"
		onclick={(e) => {
			e.stopPropagation();
			open = !open;
		}}
		class="flex h-12 w-full items-center justify-between rounded-xl border border-zinc-800 bg-[#181b22] px-4 transition hover:border-zinc-700 cursor-pointer"
		data-testid="folder-selector-button"
	>
		<div class="flex items-center gap-3">
			<FolderIcon class="h-5 w-5 text-zinc-500" data-testid="folder-icon" />

			{#if selectedFolder}
				<span class="text-sm text-zinc-100">
					{selectedFolder.title}
				</span>
			{:else}
				<span class="text-sm text-zinc-500">
					{placeholder}
				</span>
			{/if}
		</div>

		<div class={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
			<ChevronDown class="h-5 w-5 text-zinc-500" data-testid="down-arrow-icon" />
		</div>
	</button>

	{#if open}
		<div
			class="absolute left-0 top-14 z-50 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#111318] shadow-2xl"
			data-testid="folder-dropdown"
		>
			{#if folders.length === 0}
				<div class="py-8 text-center text-sm text-zinc-500">No folders available</div>
			{:else}
				<div class="max-h-64 overflow-y-auto p-2">
					{#each folders as folder}
						<button
							type="button"
							onclick={() => selectFolder(folder.id)}
							class={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition cursor-pointer ${
								selectedFolderId === folder.id ? 'bg-violet-500/10' : 'hover:bg-zinc-800/60'
							}`}
							data-testid={`folder-option-${folder.id}`}
						>
							<div class="flex items-center gap-3">
								<FolderIcon
									class={`h-5 w-5 ${
										selectedFolderId === folder.id ? 'text-violet-400' : 'text-zinc-500'
									}`}
								/>

								<span
									class={`text-sm ${
										selectedFolderId === folder.id ? 'text-white' : 'text-zinc-300'
									}`}
								>
									{folder.title}
								</span>
							</div>

							{#if selectedFolderId === folder.id}
								<Check class="h-5 w-5 text-violet-400" data-testid="check-icon" />
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
