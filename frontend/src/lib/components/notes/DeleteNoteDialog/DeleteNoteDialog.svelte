<script lang="ts">
	import { AlertTriangle, Trash, Cloud } from '@boxicons/svelte';
	import type { DeletedNote, Notes } from '../../../../types/pages/notes.types';
	import { createMutation } from '@tanstack/svelte-query';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';
	import { api } from '$lib/util/api';
	import { goto } from '$app/navigation';
	import queryClient from '$lib/util/queryClient';

	let {
		deleteDialogOpen = $bindable(),
		noteDetails = $bindable(),
		changesNotSynced = false,
		onSaveRequired
	} = $props<{
		deleteDialogOpen: boolean;
		noteDetails: Notes;
		changesNotSynced: boolean;
		onSaveRequired: () => void;
	}>();

	const deleteMutation = createMutation(() => ({
		mutationFn: () =>
			api<DeletedNote[]>(`${PUBLIC_BACKEND_URI}/api/notes/delete`, {
				method: 'DELETE',
				credentials: 'include',
				body: JSON.stringify(noteDetails),
				headers: {
					'Content-Type': 'application/json'
				}
			}),

		onMutate: () => {
			deleting = true;
		},

		onSuccess: async (data) => {
			const deletedDetails = data?.[0];

			deleting = false;

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ['get-notes', 'all-notes']
				}),
				queryClient.invalidateQueries({
					queryKey: ['get-notes', noteDetails.folder]
				}),
				queryClient.invalidateQueries({
					queryKey: ['deleted-notes']
				})
			]);

			deleteDialogOpen = false;
			goto(`/folders/${deletedDetails.folder}`);
		},

		onError: (err) => {
			deleting = false;
			console.error('Delete notes failed:', err);
		}
	}));

	let deleting = $state(false);

	function handlePrimaryAction() {
		if (changesNotSynced) {
			deleteDialogOpen = false;
			onSaveRequired();
			return;
		}

		handleDeleteNote();
	}

	const handleDeleteNote = async () => {
		if (deleting) return;

		try {
			await deleteMutation.mutateAsync();
			localStorage.removeItem(`note-${noteDetails.folder}-${noteDetails.title}`);
		} catch (err) {
			console.error('Delete failed:', err);
		}
	};
</script>

<div
	class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
	role="presentation"
	onclick={(event) => {
		if (event.target === event.currentTarget && !deleting) {
			deleteDialogOpen = false;
		}
	}}
	data-testid="delete-note-dialog-backdrop"
>
	<div
		class="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#111318] shadow-2xl shadow-black/50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="delete-note-title"
		aria-describedby="delete-note-description"
		data-testid="delete-note-dialog"
	>
		<div class="p-6">
			{#if changesNotSynced}
				<div
					class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400"
				>
					<AlertTriangle class="h-5 w-5" />
				</div>

				<h2 id="delete-note-title" class="text-lg font-normal tracking-tight text-zinc-100">
					Save changes before deleting?
				</h2>

				<p id="delete-note-description" class="mt-2 text-sm leading-6 text-zinc-400">
					This note has changes that haven't been synced to GitHub yet. Please save and sync them
					before moving the note to the trash.
				</p>
			{:else}
				<div
					class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400"
				>
					<Trash class="h-5 w-5" />
				</div>

				<h2 id="delete-note-title" class="text-lg font-semibold tracking-tight text-zinc-100">
					Delete note?
				</h2>

				<p id="delete-note-description" class="mt-2 text-sm leading-6 text-zinc-400">
					Are you sure you want to delete
					<span class="font-medium text-zinc-200">
						"{noteDetails.title || ''}"
					</span>
					?

					<br />

					<span class="mt-2 inline-flex items-center gap-1.5 font-medium text-red-400">
						<AlertTriangle class="h-4 w-4" />
						This will move the note to the trash.
					</span>
				</p>
			{/if}
		</div>

		<div
			class="flex items-center justify-between border-t border-zinc-800/80 bg-[#0d0f13] px-6 py-4"
		>
			<button
				type="button"
				class="cursor-pointer rounded-xl border border-zinc-800/80 bg-[#12141c] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800/70 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={deleting}
				onclick={() => (deleteDialogOpen = false)}
			>
				Cancel
			</button>

			<button
				type="button"
				class={`flex min-w-[125px] cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
					changesNotSynced ? 'bg-fuchsia-500 hover:bg-fuchsia-400' : 'bg-red-500 hover:bg-red-400'
				}`}
				disabled={deleting}
				onclick={handlePrimaryAction}
			>
				{#if deleting}
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
					></div>

					<span>Deleting...</span>
				{:else if changesNotSynced}
					<Cloud class="h-4 w-4" />
					<span>Save & Sync</span>
				{:else}
					<Trash class="h-4 w-4" />
					<span>Delete note</span>
				{/if}
			</button>
		</div>
	</div>
</div>
