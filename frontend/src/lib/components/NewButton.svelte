<script lang="ts">
	import { page } from '$app/state';
	import { ChevronDown, Folder, Note, Plus } from '@boxicons/svelte';
	import FolderDialog from './home/FolderDialog/FolderDialog.svelte';
	import NoteDialog from './folders/NoteDialog/NoteDialog.svelte';

	const fullPath = $derived(page.url.pathname);

    let isSelectorDialogOpen = $state(false);

	let isNewFolderDialogOpen = $state(false);
	let isNewNoteDialogOpen = $state(false);

	function clickNew() {
        isSelectorDialogOpen = false;

        if(fullPath==="/home"){
            isNewFolderDialogOpen = true;
        }
        else if(fullPath.includes("/folders/")){
            isNewNoteDialogOpen = true;
        }

    }

    function clickArrow(){
        isSelectorDialogOpen = !isSelectorDialogOpen
    }

	function createFolder() {
        isNewNoteDialogOpen = false;
		isNewFolderDialogOpen = true;
	}

	function createNote() {
		isNewFolderDialogOpen = false;
		isNewNoteDialogOpen = true;
	}
</script>

{#if isNewFolderDialogOpen}
	<FolderDialog cancel={() => (isNewFolderDialogOpen = false)} />

{:else if isNewNoteDialogOpen}
    <NoteDialog cancel={() => (isNewNoteDialogOpen = false)} />
{/if}


<div class="relative inline-block">
	<div
		class="group flex items-center overflow-hidden rounded-xl border border-zinc-700/20 bg-[#1d1f2b] text-zinc-100 shadow-sm shadow-black/20"
	>
		<button
			class="flex cursor-pointer items-center gap-1.5 px-3.5 py-2 text-sm transition-colors hover:bg-black/10"
			onclick={clickNew}
		>
			<Plus class="h-4 w-4" />
			<span>New</span>
		</button>

		<div class="h-4 w-px bg-zinc-700/40"></div>

		<button
			class="cursor-pointer px-2 py-2 text-zinc-400 transition-colors hover:bg-black/10 hover:text-zinc-200"
			onclick={clickArrow}
			aria-label="New item options"
		>
			<ChevronDown
				class={`h-3.5 w-3.5 transition-transform duration-200 ${isSelectorDialogOpen ? 'rotate-180' : ''}`}
			/>
		</button>
	</div>

	{#if isSelectorDialogOpen}
		<button
			class="fixed inset-0 z-10 cursor-default"
			onclick={() => (isSelectorDialogOpen = false)}
			aria-label="Close menu"
		></button>

		<div
			class="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-52 overflow-hidden rounded-xl border border-zinc-700/30 bg-[#1d1f2b] p-1 shadow-xl shadow-black/40"
		>
			<button
				class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/5"
				onclick={createNote}
			>
				<Note class="h-4 w-4 text-zinc-400" />

				<div class="flex flex-col">
					<span>Note</span>
					<span class="text-xs text-zinc-500"> Create a new note </span>
				</div>
			</button>

			<button
				class="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-200 transition-colors hover:bg-white/5"
				onclick={createFolder}
			>
				<Folder class="h-4 w-4 text-zinc-400" />

				<div class="flex flex-col">
					<span>Folder</span>
					<span class="text-xs text-zinc-500"> Create a new folder </span>
				</div>
			</button>
		</div>
	{/if}
</div>
