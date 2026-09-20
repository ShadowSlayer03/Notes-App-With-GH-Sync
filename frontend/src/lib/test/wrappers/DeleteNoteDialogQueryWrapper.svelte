<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	import DeleteNoteDialog from '$lib/components/notes/DeleteNoteDialog/DeleteNoteDialog.svelte';
	import type { Notes } from '../../../types/pages/notes.types';

	let {
		deleteDialogOpen: initialDeleteDialogOpen = true,
		noteDetails: initialNoteDetails,
		changesNotSynced = false,
		onSaveRequired = () => {}
	} = $props<{
		deleteDialogOpen?: boolean;
		noteDetails: Notes;
		changesNotSynced?: boolean;
		onSaveRequired?: () => void;
	}>();

	let deleteDialogOpen = $state(initialDeleteDialogOpen);
	let noteDetails = $state(initialNoteDetails);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false
			},
			mutations: {
				retry: false
			}
		}
	});
</script>

<QueryClientProvider client={queryClient}>
	{#if deleteDialogOpen}
		<DeleteNoteDialog
			bind:deleteDialogOpen
			bind:noteDetails
			{changesNotSynced}
			{onSaveRequired}
		/>
	{/if}
</QueryClientProvider>