<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { api, ConflictError } from '$lib/util/api';
	import { Note, RotateCcw, X } from '@boxicons/svelte';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import type { DeletedNote } from '../../../../types/pages/notes.types.js';
	import { getNoteColor, replaceUnderscoresWithBlankAndCapitalize } from '$lib/util/noteUtils.js';
	import LoadingState from '$lib/components/notes/LoadingState/LoadingState.svelte';
	import ErrorState from '$lib/components/notes/ErrorState/ErrorState.svelte';
	import EmptyState from '$lib/components/notes/EmptyState/EmptyState.svelte';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';

	let search = $state('');
	let conflictingNote = $state<DeletedNote | null>(null);
	let restoringNoteId = $state<string | null>(null);

	const queryClient = useQueryClient();

	const deletedNotesQuery = createQuery(() => ({
		queryKey: ['deleted-notes'],
		queryFn: () =>
			api<DeletedNote[]>(`${PUBLIC_BACKEND_URI}/api/notes/deleted`, {
				method: 'GET',
				credentials: 'include'
			}),
		staleTime: 1000 * 60 * 5,
		retry: false
	}));

	const restoreNoteMutation = createMutation(() => ({
		mutationFn: (note: DeletedNote) =>
			api(`${PUBLIC_BACKEND_URI}/api/notes/restore`, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify(note),
				headers: {
					'Content-Type': 'application/json'
				}
			}),

		onMutate: (note) => {
			console.log('Restoring note:', note);
		},

		onSuccess: () => {
			conflictingNote = null;

			queryClient.invalidateQueries({
				queryKey: ['deleted-notes']
			});

			queryClient.invalidateQueries({
				queryKey: ['get-notes']
			});
		},

		onError: (error, note) => {
			if (error instanceof ConflictError) {
				conflictingNote = note;
				return;
			}

			console.error('Failed to restore note:', error);
		}
	}));

	let filteredNotes = $derived.by(() => {
		const notes = deletedNotesQuery.data ?? [];

		if (!search.trim()) {
			return notes;
		}

		const searchTerm = search.toLocaleLowerCase();

		return notes.filter(
			(note) =>
				note.title.toLocaleLowerCase().includes(searchTerm) ||
				note.folder.toLocaleLowerCase().includes(searchTerm)
		);
	});

	const formatDeletedDate = (date: Date | string) => {
		return new Date(date).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	const restoreNote = (note: DeletedNote) => {
		restoringNoteId = note.id;
		restoreNoteMutation.mutate(note);
	};

	const closeConflictDialog = () => {
		conflictingNote = null;
	};

	const restoreAsCopy = () => {
		if (!conflictingNote) return;

		const now = new Date();

		const timestamp =
			now.getFullYear().toString() +
			(now.getMonth() + 1).toString().padStart(2, '0') +
			now.getDate().toString().padStart(2, '0') +
			now.getHours().toString().padStart(2, '0') +
			now.getMinutes().toString().padStart(2, '0') +
			now.getSeconds().toString().padStart(2, '0');

		const restoredTitle = `${conflictingNote.title}-restored-${timestamp}`;

		const noteToRestore: DeletedNote = {
			...conflictingNote,
			restoreAsTitle: restoredTitle
		};

		conflictingNote = null;

		restoreNoteMutation.mutate(noteToRestore);
	};
</script>

{#if deletedNotesQuery.isPending}
	<LoadingState />
{:else if deletedNotesQuery.isError}
	<ErrorState
		message={deletedNotesQuery.error.message}
		refetch={() => deletedNotesQuery.refetch()}
	/>
{:else if filteredNotes.length === 0 && !search}
	<EmptyState />
{:else}
	<div
		class="p-6 text-zinc-100 bg-[#0D0F12] h-full flex flex-col font-sans antialiased select-none"
	>
		<PageHeader bind:search />

		<div class="px-4 flex-1 w-full overflow-x-auto mt-8 mb-4">
			<table class="w-full text-left border-collapse min-w-175">
				<thead>
					<tr
						class="border-b border-zinc-800/30 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase"
					>
						<th class="pb-3 pl-4 font-medium w-[55%]">Note</th>
						<th class="pb-3 font-medium w-[20%]">Folder</th>
						<th class="pb-3 font-medium w-[15%]">Deleted</th>
						<th class="pb-3 pr-4 text-right font-medium w-[10%]"></th>
					</tr>
				</thead>

				<tbody class="divide-y divide-zinc-800/20">
					{#each filteredNotes as note (note.id)}
					
						<tr class="group transition-colors hover:bg-white/1.5">
							<td class="py-3.5 pl-4 pr-3">
								<div class="flex items-start gap-3.5 min-w-0">
									<div
										class={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 transition-colors group-hover:text-zinc-200 ${getNoteColor(note.title)}`}
									>
										<Note class="h-4 w-4" />
									</div>

									<div class="flex flex-col min-w-0 justify-center">
										<span
											class="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate"
										>
											{replaceUnderscoresWithBlankAndCapitalize(note.title)}
										</span>

										<span class="text-xs text-zinc-500 truncate mt-0.5 max-w-125">
											{note.desc}
										</span>
									</div>
								</div>
							</td>

							<td class="py-3.5 align-middle">
								<span
									class="inline-flex max-w-40 truncate rounded-md bg-zinc-800/50 px-2 py-1 text-xs font-medium text-zinc-400"
									title={note.folder}
								>
									{note.folder}
								</span>
							</td>

							<td class="py-3.5 text-xs text-zinc-500 font-medium align-middle">
								{formatDeletedDate(note.deletedAt)}
							</td>

							<td class="py-3.5 pr-4 text-right align-middle">
								<button
									type="button"
									disabled={restoreNoteMutation.isPending}
									onclick={() => restoreNote(note)}
									class="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<RotateCcw class="h-3.5 w-3.5" />

									{restoreNoteMutation.isPending && restoringNoteId === note.id ? 'Restoring...' : 'Restore'}
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

			{#if search && filteredNotes.length === 0}
				<div class="flex flex-col items-center justify-center py-16">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50"
					>
						<Note class="h-4 w-4 text-zinc-600" />
					</div>

					<p class="mt-3 text-sm font-medium text-zinc-400">No deleted notes found</p>

					<p class="mt-1 text-xs text-zinc-600">Try searching for a different note.</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if conflictingNote}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
		<div class="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#111318] shadow-2xl">
			<div class="flex items-start justify-between border-b border-zinc-800/60 px-5 py-4">
				<div>
					<h2 class="text-lg font-semibold text-zinc-100">File already exists</h2>
				</div>

				<button
					type="button"
					onclick={closeConflictDialog}
					class="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<div class="px-5 py-5">
				<p class="text-sm text-zinc-300">
					<strong class="font-medium text-zinc-100">
						{replaceUnderscoresWithBlankAndCapitalize(conflictingNote.title)}
					</strong>
					already exists in
					<strong class="font-medium text-zinc-100">
						{conflictingNote.folder}
					</strong>.
				</p>

				<p class="mt-2 text-xs leading-5 text-zinc-500">
					You can restore the deleted note as a separate copy instead.
				</p>
			</div>

			<div class="flex items-center justify-end gap-2 border-t border-zinc-800/60 px-5 py-4">
				<button
					type="button"
					onclick={closeConflictDialog}
					class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
				>
					Cancel
				</button>

				<button
					type="button"
					onclick={restoreAsCopy}
					disabled={restoreNoteMutation.isPending}
					class="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-normal text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<RotateCcw class="h-3.5 w-3.5" />
					{restoreNoteMutation.isPending ? 'Restoring...' : 'Restore as copy'}
				</button>
			</div>
		</div>
	</div>
{/if}
