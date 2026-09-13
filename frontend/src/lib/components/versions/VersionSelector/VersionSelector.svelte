<script lang="ts">
	import { GitBranch, ChevronDown, Check } from '@boxicons/svelte';
	import type { NoteVersion } from '../../../../types/pages/versions.types';
	import { createQuery } from '@tanstack/svelte-query';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';
	import { api } from '$lib/util/api';
	import type { Notes } from '../../../../types/pages/notes.types';

	let {
		noteId,
		folderId,
		editorContent = $bindable(),
		onVersionChange
	} = $props<{
		noteId: string;
		folderId: string;
		editorContent: string;
		onVersionChange: (content: string, isLatest: boolean) => void;
	}>();

	let showVersionPicker = $state(false);
	

	const getVersionsOfNoteQuery = createQuery(() => ({
		queryKey: ['get-versions', noteId, folderId],
		queryFn: () =>
			api<NoteVersion[]>(`${PUBLIC_BACKEND_URI}/api/versions/${noteId}?folder=${folderId}`, {
				method: 'GET',
				credentials: 'include'
			}),
		staleTime: 1000 * 60 * 20,
		retry: false
	}));

	let versions = $derived(getVersionsOfNoteQuery.data);

	let selectedVersion = $state({ sha: versions?.[0].sha, label: 'Latest', date: '' });
	
	const isNoteLoading = $derived(getVersionsOfNoteQuery.isPending);

	async function fetchAndUpdateNoteVersionContent(version: NoteVersion) {
		try {
			const noteDetails = await api<Notes>(
				`${PUBLIC_BACKEND_URI}/api/notes/${folderId}/${noteId}?ref=${version.sha}`,
				{
					method: 'GET',
					credentials: 'include'
				}
			);

			if (!noteDetails?.data) return;

			editorContent = noteDetails.data;
			onVersionChange(noteDetails.data, versions?.[0].sha === selectedVersion.sha);
		} catch (err) {
			console.error('Could not load note version:', err);
		}
	}
</script>

<div class="relative">
	<button
		type="button"
		disabled={isNoteLoading}
		onclick={() => (showVersionPicker = !showVersionPicker)}
		class={`flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-sm text-zinc-300 transition ${
			isNoteLoading
				? 'cursor-wait opacity-70'
				: 'cursor-pointer hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-white'
		}`}
		aria-expanded={showVersionPicker}
	>
		{#if isNoteLoading}
			<div
				class="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-fuchsia-400"
				aria-label="Loading versions"
			></div>

			<span>Loading versions...</span>
		{:else}
			<GitBranch class="h-4 w-4 text-fuchsia-400" />

			<span class="max-w-48 truncate">
				{selectedVersion.label}
			</span>

			<ChevronDown
				class={`h-4 w-4 transition-transform ${showVersionPicker ? 'rotate-180' : ''}`}
			/>
		{/if}
	</button>

	{#if showVersionPicker}
		<div
			class="absolute left-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111318] shadow-2xl shadow-black/40 backdrop-blur-xl"
		>
			<div class="border-b border-zinc-800 px-4 py-3">
				<p class="text-xs font-medium uppercase tracking-wider text-zinc-500">Version history</p>
			</div>

			<div class="max-h-80 overflow-y-auto p-2">
				{#if isNoteLoading}
					{#each Array(4) as _}
						<div class="flex items-start gap-3 rounded-xl px-3 py-3">
							<div class="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-zinc-700"></div>

							<div class="min-w-0 flex-1 space-y-2">
								<div class="h-3.5 w-3/4 animate-pulse rounded bg-zinc-800"></div>
								<div class="h-3 w-1/3 animate-pulse rounded bg-zinc-900"></div>
							</div>
						</div>
					{/each}
				{:else if versions?.length}
					{#each versions as version}
						<button
							type="button"
							onclick={async () => {
								selectedVersion = version;
								showVersionPicker = false;
								await fetchAndUpdateNoteVersionContent(version);
							}}
							class={`flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
								selectedVersion.sha === version.sha
									? 'bg-fuchsia-500/10 text-fuchsia-300'
									: 'text-zinc-300 hover:bg-white/5'
							}`}
						>
							<div class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-fuchsia-400"></div>

							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">
									{version.label}
								</p>

								<p class="mt-1 text-xs text-zinc-500">
									{version.date}
								</p>
							</div>

							{#if selectedVersion.sha === version.sha}
								<Check class="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-400" />
							{/if}
						</button>
					{/each}
				{:else}
					<div class="px-3 py-8 text-center">
						<p class="text-sm text-zinc-500">No versions found</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
