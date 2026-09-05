<script>
	import { Plus } from "@boxicons/svelte";
	import FolderDialog from "../FolderDialog/FolderDialog.svelte";

    let createNewFolderDialog = $state(false);

	const createNewFolder = () => {
		createNewFolderDialog = true;
	};

    const cancelNewFolder = ()=>{
        createNewFolderDialog = false;
    }
</script>

{#if createNewFolderDialog}
	<FolderDialog cancel={cancelNewFolder} />
{/if}

<button
	class="flex flex-col items-center justify-center border border-dotted border-zinc-800/90 bg-[#12141c]/20 rounded-2xl p-5 hover:border-zinc-700 hover:bg-zinc-800/10 transition-all cursor-pointer group w-[200px] h-[190px] shrink-0"
	onclick={createNewFolder}
>
	<div
		class="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 group-hover:text-zinc-300 transition-all"
	>
		<Plus class="h-5 w-5" />
	</div>
	<span
		class="text-xs font-medium text-zinc-500 mt-3 group-hover:text-zinc-400 text-center leading-tight"
		>Create new<br />folder</span
	>
</button>
