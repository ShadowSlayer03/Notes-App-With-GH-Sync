<script lang="ts">
	import { GitBranch, ChevronDown, Check } from '@boxicons/svelte';
	import type { NoteVersion } from '../../../../types/pages/versions.types';
	import type { Notes } from '../../../../types/pages/notes.types';
	import { createQuery } from '@tanstack/svelte-query';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';
	import { api } from '$lib/util/api';

	import { formatVersionDate } from '$lib/util/versionUtils';

	let {
		noteId,
		folderId,
		selectedSha = null,
		label = 'Select version',
		disabled = false,

		// SELFNOTE: Used by version history
		onVersionChange = () => {},

		// SELFNOTE: Used by editor
		onContentChange = undefined
	}: {
		noteId: string;
		folderId: string;
		selectedSha?: string | null;
		label?: string;
		disabled?: boolean;

		onVersionChange?: (version: NoteVersion) => void;

		onContentChange?: (content: string, isLatest: boolean) => void;
	} = $props();

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

	const versions = $derived(getVersionsOfNoteQuery.data ?? []);

	const isLoading = $derived(getVersionsOfNoteQuery.isPending);

	const selectedVersion = $derived(
		versions.find((version) => version.sha === selectedSha) ?? versions[0] ?? null
	);

	async function selectVersion(version: NoteVersion) {
		selectedSha = version.sha;
		showVersionPicker = false;

		onVersionChange(version);

		if (!onContentChange) return;

		try {
			const noteDetails = await api<Notes>(
				`${PUBLIC_BACKEND_URI}/api/notes/${folderId}/${noteId}?ref=${version.sha}`,
				{
					method: 'GET',
					credentials: 'include'
				}
			);

			if (!noteDetails?.data) return;

			const isLatest = versions[0]?.sha === version.sha;

			onContentChange(noteDetails.data, isLatest);
		} catch (error) {
			console.error('Could not load note version:', error);
		}
	}
</script>

<div class="relative">
	<button
		type="button"
		disabled={disabled || isLoading}
		onclick={() => (showVersionPicker = !showVersionPicker)}
		class={`flex items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-sm text-zinc-300 transition ${
			disabled || isLoading
				? 'cursor-wait opacity-70'
				: 'cursor-pointer hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-white'
		}`}
		aria-expanded={showVersionPicker}
		data-testid="version-selector-trigger"
	>
		{#if isLoading}
			<div
				class="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-fuchsia-400"
				aria-label="Loading versions"
			></div>

			<span>Loading versions...</span>
		{:else}
			<GitBranch class="h-4 w-4 text-fuchsia-400" />

			<span class="max-w-48 truncate">
				{selectedVersion?.label ?? label}
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
				<p class="text-xs font-medium uppercase tracking-wider text-zinc-500">
					{label === 'Select version' ? 'Version history' : label}
				</p>
			</div>

			<div class="max-h-80 overflow-y-auto p-2" data-testid="version-selector-list">
				{#if isLoading}
					{#each [0, 1, 2, 3] as skeleton (skeleton)}
						<div class="flex items-start gap-3 rounded-xl px-3 py-3">
							<div class="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-zinc-700"></div>

							<div class="min-w-0 flex-1 space-y-2">
								<div class="h-3.5 w-3/4 animate-pulse rounded bg-zinc-800"></div>
								<div class="h-3 w-1/3 animate-pulse rounded bg-zinc-900"></div>
							</div>
						</div>
					{/each}
				{:else if versions.length}
					{#each versions as version, index (version.sha)}
						<button
							type="button"
							onclick={() => selectVersion(version)}
							class={`flex w-full cursor-pointer items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
								selectedVersion?.sha === version.sha
									? 'bg-fuchsia-500/10 text-fuchsia-300'
									: 'text-zinc-300 hover:bg-white/5'
							}`}
							data-testid="version-selector-item"
						>
							<div
								class={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
									index === 0 ? 'bg-emerald-400' : 'bg-fuchsia-400'
								}`}
							></div>

							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<p class="truncate text-sm font-medium">
										{version.label}
									</p>

									{#if index === 0}
										<span
											class="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-400"
										>
											Latest
										</span>
									{/if}
								</div>

								<p class="mt-1 text-xs text-zinc-500">
									{formatVersionDate(version.date)}
								</p>
							</div>

							{#if selectedVersion?.sha === version.sha}
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
