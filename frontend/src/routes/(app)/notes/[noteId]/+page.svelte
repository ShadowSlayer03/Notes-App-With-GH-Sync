<script lang="ts">
	import { page } from '$app/state';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Editor from '$lib/components/notes/Editor/Editor.svelte';

	const { params } = $props<{
		params: {
			noteId: string;
			share?: string;
		};
	}>();

	const { noteId } = $derived(params);
	let folderId = $derived(page.url.searchParams.get('folder') ?? '');
	let share = $derived(page.url.searchParams.get('share') ?? 'false');

	let changesNotSynced = $state(false);
	let noteDetails = $state({
		id: noteId,
		title: '',
		desc: '',
		folder: '',
		data: '',
		theme: 'default',
		pinned: false,
		updatedByAvatarUrl: '',
		updatedAt: '',
		updatedBy: ''
	});

	let viewingHistoricalVersion = $state(false);
</script>

<div class="p-6 text-white bg-[#0D0F12] h-full">
	 <!-- SELFNOTE: Added noteId and folderId here since noteDetails gets populated only in Editor  -->
	<PageHeader {noteId} {folderId} bind:noteDetails bind:changesNotSynced bind:viewingHistoricalVersion />
	<Editor {noteId} {folderId} bind:noteDetails bind:changesNotSynced bind:viewingHistoricalVersion />
</div>
