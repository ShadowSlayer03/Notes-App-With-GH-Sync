<script lang="ts">
	import { createMutation, createQuery } from '@tanstack/svelte-query';
	import { api } from '$lib/util/api';
	import type { Folder } from '../../../../types/pages/folder.types';
	import FolderSelector from '../FolderSelector/FolderSelector.svelte';
	import queryClient from '$lib/util/queryClient';
	import { replaceSpacesWithUnderscores } from '$lib/util/noteUtils';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';

	const { cancel } = $props<{
		cancel: () => void;
	}>();

	let selectedFolderId = $state('');
	let noteTitle = $state('');
	let noteDescription = $state('');
	let errorMessage = $state('');

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

	const noteMutation = createMutation(() => ({
		mutationFn: () =>
			api<void>(`${PUBLIC_BACKEND_URI}/api/notes/create`, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify({
					title: replaceSpacesWithUnderscores(noteTitle),
					desc: noteDescription,
					folder: selectedFolderId
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			}),
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ['get-notes', selectedFolderId] });
		},
		onError: (err) => {
			console.error('Could not create note:', err);
		}
	}));

	const folders = $derived(getAllFoldersQuery.data ?? []);

	const selectedFolder = $derived(folders.find((folder) => folder.id === selectedFolderId));

	const duplicateExists = $derived.by(() => {
		if (!selectedFolder || !noteTitle.trim()) return false;

		// TODO:
		// Query notes in the selected folder and check whether
		// a note with the same title already exists.

		return false;
	});

	$effect(() => {
		errorMessage = duplicateExists
			? 'A note with this title already exists in the selected folder.'
			: '';
	});

	function createNote() {
		if (!selectedFolderId) return;
		if (!noteTitle.trim()) return;
		if (!noteDescription.trim()) return;
		if (duplicateExists) return;

		console.log({
			title: noteTitle,
			desc: noteDescription,
			folder: selectedFolderId
		});

		noteMutation.mutate();

		cancel();
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') cancel();
	}}
/>

<dialog
	class="fixed inset-0 z-200 flex h-full w-full items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
	onclick={(e) => {
		if (e.target === e.currentTarget) cancel();
	}}
>
	<div
		class="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#111318] shadow-2xl shadow-black/50"
	>
		<div class="border-b border-zinc-800 px-7 py-6">
			<h2 class="text-xl font-semibold text-white">Create New Note</h2>

			<p class="mt-1 text-sm text-zinc-500">Create a new note inside one of your folders.</p>
		</div>

		<div class="space-y-7 px-7 py-6">
			<div class="flex flex-col gap-2">
				<label class="text-sm font-medium text-zinc-300"> Folder </label>

				<FolderSelector {folders} bind:selectedFolderId />
			</div>

			<div class="flex flex-col gap-2">
				<label for="noteTitle" class="text-sm font-medium text-zinc-300"> Title </label>

				<input
					id="noteTitle"
					bind:value={noteTitle}
					placeholder="Meeting Notes"
					class="w-full rounded-xl border border-zinc-800 bg-[#181b22] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-500/70"
				/>

				<p class="text-xs text-zinc-500">This will also become the markdown filename.</p>
			</div>

			<div class="flex flex-col gap-2">
				<label for="noteDescription" class="text-sm font-medium text-zinc-300"> Description </label>

				<textarea
					id="noteDescription"
					rows="3"
					maxlength="180"
					bind:value={noteDescription}
					placeholder="A short description of what this note is about..."
					class="w-full resize-none rounded-xl border border-zinc-800 bg-[#181b22] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-500/70"
				></textarea>

				<div class="flex items-center justify-between">
					<p class="text-xs text-zinc-500">Shown on note cards and search results.</p>

					<span class="text-xs text-zinc-500">
						{noteDescription.length}/180
					</span>
				</div>
			</div>
		</div>

		{#if errorMessage}
			<div class="px-7 pb-5">
				<div
					class="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
				>
					{errorMessage}
				</div>
			</div>
		{/if}

		<div class="flex items-center justify-end gap-3 border-t border-zinc-800 px-7 py-5">
			<button
				type="button"
				onclick={cancel}
				class="cursor-pointer rounded-xl border border-zinc-800 px-5 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white"
			>
				Cancel
			</button>

			<button
				type="button"
				onclick={createNote}
				disabled={!selectedFolderId ||
					!noteTitle.trim() ||
					!noteDescription.trim() ||
					duplicateExists}
				class="cursor-pointer rounded-xl bg-violet-400 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Create Note
			</button>
		</div>
	</div>
</dialog>
