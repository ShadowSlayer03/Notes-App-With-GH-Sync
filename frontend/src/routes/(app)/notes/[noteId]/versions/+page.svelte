<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';
	import { api } from '$lib/util/api';
	import { createQuery } from '@tanstack/svelte-query';

	import { ArrowLeft, GitBranch, Minus, Plus, RefreshCw } from '@boxicons/svelte';
	import type { NoteVersion } from '../../../../../types/pages/versions.types';
	import { getVersionNumber } from '$lib/util/versionUtils';
	import type { Notes } from '../../../../../types/pages/notes.types';
	import VersionDiffViewer from '$lib/components/versions/VersionDiffViewer/VersionDiffViewer.svelte';
	import VersionSelector from '$lib/components/versions/VersionSelector/VersionSelector.svelte';

	const { params } = $props<{
		params: {
			noteId: string;
		};
	}>();

	const { noteId } = $derived(params);

	let folderId = $derived(page.url.searchParams.get('folder') ?? '');

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

	const noteVersions = $derived(getVersionsOfNoteQuery.data ?? []);

	let olderVersionSha = $state<string | null>(null);
	let newerVersionSha = $state<string | null>(null);

	// Initially latest version on the right and the previosu version will be on left
	$effect(() => {
		if (noteVersions.length < 2) return;

		if (!olderVersionSha || !noteVersions.some((version) => version.sha === olderVersionSha)) {
			olderVersionSha = noteVersions[1].sha;
		}

		if (!newerVersionSha || !noteVersions.some((version) => version.sha === newerVersionSha)) {
			newerVersionSha = noteVersions[0].sha;
		}
	});

	const olderVersion = $derived(
		noteVersions.find((version) => version.sha === olderVersionSha) ?? null
	);

	const newerVersion = $derived(
		noteVersions.find((version) => version.sha === newerVersionSha) ?? null
	);

	const getOlderVersionQuery = createQuery(() => ({
		queryKey: ['get-version-content', noteId, folderId, olderVersionSha],

		queryFn: () =>
			api<Notes>(`${PUBLIC_BACKEND_URI}/api/notes/${folderId}/${noteId}?ref=${olderVersionSha}`, {
				method: 'GET',
				credentials: 'include'
			}),

		enabled: Boolean(olderVersionSha),
		staleTime: 1000 * 60 * 30,
		retry: false
	}));

	const getNewerVersionQuery = createQuery(() => ({
		queryKey: ['get-version-content', noteId, folderId, newerVersionSha],

		queryFn: () =>
			api<Notes>(`${PUBLIC_BACKEND_URI}/api/notes/${folderId}/${noteId}?ref=${newerVersionSha}`, {
				method: 'GET',
				credentials: 'include'
			}),

		enabled: Boolean(newerVersionSha) && getOlderVersionQuery.isSuccess,
		staleTime: 1000 * 60 * 30,
		retry: false
	}));

	$effect(() => {
		console.log('Older version query data:', getOlderVersionQuery.data);
		console.log('Newer version query data:', getNewerVersionQuery.data);
	});

	const olderContent = $derived(getOlderVersionQuery.data?.data ?? '\n');

	const newerContent = $derived(getNewerVersionQuery.data?.data ?? '\n');

	const olderTheme = $derived(getOlderVersionQuery.data?.theme ?? 'default');

	const newerTheme = $derived(getNewerVersionQuery.data?.theme ?? 'default');

	function selectOlderVersion(version: NoteVersion) {
		olderVersionSha = version.sha;
	}

	function selectNewerVersion(version: NoteVersion) {
		newerVersionSha = version.sha;
	}
</script>

<svelte:head>
	<title>Version History</title>
</svelte:head>

<div class="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
	<div class="mx-auto max-w-[1700px]">
		<header class="mb-7">
			<button
				type="button"
				onclick={() => history.back()}
				class="mb-5 flex cursor-pointer items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-200"
			>
				<ArrowLeft class="h-4 w-4" />
				Back to note
			</button>

			<div class="flex items-start justify-between gap-6">
				<div>
					<div class="flex items-center gap-3">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10"
						>
							<GitBranch class="h-5 w-5 text-fuchsia-400" />
						</div>

						<div>
							<h1 class="text-xl font-semibold tracking-tight">Version History</h1>

							<p class="mt-0.5 text-xs text-zinc-500">Compare saved versions of this note.</p>
						</div>
					</div>
				</div>
			</div>
		</header>

		{#if getVersionsOfNoteQuery.isPending}
			<div
				class="flex min-h-[600px] items-center justify-center rounded-3xl border border-white/8 bg-white/[0.02]"
			>
				<div class="flex items-center gap-3 text-sm text-zinc-500">
					<RefreshCw class="h-4 w-4 animate-spin" />
					Loading version history...
				</div>
			</div>
		{:else if getVersionsOfNoteQuery.isError}
			<div class="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
				<h2 class="font-medium text-red-400">Couldn't load version history</h2>

				<p class="mt-2 text-sm text-zinc-500">
					We couldn't retrieve the saved versions for this note.
				</p>
			</div>
		{:else if noteVersions.length === 0}
			<div
				class="flex min-h-[600px] items-center justify-center rounded-3xl border border-white/8 bg-white/[0.02]"
			>
				<div class="max-w-sm text-center">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]"
					>
						<GitBranch class="h-5 w-5 text-zinc-600" />
					</div>

					<h2 class="mt-4 font-medium text-zinc-300">No versions yet</h2>

					<p class="mt-2 text-sm leading-6 text-zinc-500">
						Save and sync this note to create its first version.
					</p>
				</div>
			</div>
		{:else if noteVersions.length === 1}
			<div
				class="flex min-h-[600px] items-center justify-center rounded-3xl border border-white/8 bg-white/[0.02]"
			>
				<div class="max-w-sm text-center">
					<div
						class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]"
					>
						<GitBranch class="h-5 w-5 text-zinc-600" />
					</div>

					<h2 class="mt-4 font-medium text-zinc-300">Only one version exists</h2>

					<p class="mt-2 text-sm leading-6 text-zinc-500">
						Save another version of this note to compare changes.
					</p>
				</div>
			</div>
		{:else if olderVersion && newerVersion}
			<div class="mb-6 grid grid-cols-[1fr_auto_1fr] items-end gap-4">
				<!-- LEFT / OLDER -->
				<div class="min-w-0">
					<div class="mb-2 flex items-center justify-between px-1">
						<div>
							<p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
								Compare from
							</p>

							<p class="mt-1 text-xs text-zinc-500">Older version</p>
						</div>
					</div>

					<VersionSelector
						{noteId}
						{folderId}
						selectedSha={olderVersionSha}
						label="Select older version"
						onVersionChange={selectOlderVersion}
					/>
				</div>

				<!-- SWAP / DIRECTION -->
				<div class="flex h-10 items-center justify-center">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-xs text-zinc-600"
						title="Older → newer"
					>
						→
					</div>
				</div>

				<!-- RIGHT / NEWER -->
				<div class="min-w-0">
					<div class="mb-2 flex items-center justify-between px-1">
						<div>
							<p class="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
								Compare to
							</p>

							<p class="mt-1 text-xs text-zinc-500">Newer version</p>
						</div>
					</div>

					<VersionSelector
						{noteId}
						{folderId}
						selectedSha={newerVersionSha}
						label="Select newer version"
						onVersionChange={selectNewerVersion}
					/>
				</div>
			</div>

			<div class="mb-4 flex items-center justify-center">
				<div
					class="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-500"
				>
					<span>
						Version {getVersionNumber(noteVersions, olderVersion)}
					</span>

					<span class="text-zinc-700">→</span>

					<span>
						Version {getVersionNumber(noteVersions, newerVersion)}
					</span>
				</div>
			</div>

			<VersionDiffViewer
				originalText={olderContent}
				modifiedText={newerContent}
				originalLabel={`Version ${getVersionNumber(noteVersions, olderVersion)}`}
				modifiedLabel={`Version ${getVersionNumber(noteVersions, newerVersion)}`}
			/>
		{/if}
	</div>
</div>
