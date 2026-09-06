<script lang="ts">
	import '@milkdown/crepe/theme/common/style.css';
	import './Editor.css';

	import { onDestroy } from 'svelte';
	import { Crepe } from '@milkdown/crepe';

	import { createQuery } from '@tanstack/svelte-query';
	import { noteThemes } from '$lib/constants/notes';

	import { api } from '$lib/util/api';
	import { compareOptions } from '$lib/util/noteUtils';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';

	import { ArrowBigLeftLine, Check, ChevronDown, GitBranch, Link, Palette, Pin } from '@boxicons/svelte';
	import type { Notes, NoteTheme, SharedNoteLink } from '../../../../types/pages/notes.types';
	import { page } from '$app/state';

	let root: HTMLElement | null = $state(null);
	let crepe: Crepe | null = null;

	let {
		noteId,
		folderId,
		changesNotSynced = $bindable(),
		noteDetails = $bindable()
	} = $props<{
		noteId: string;
		folderId: string;
		changesNotSynced: boolean;
		noteDetails: Notes;
	}>();

	const shareId = $derived(page.url.searchParams.get('shareId'));
	const shareable = $derived(Boolean(shareId));

	let editorContent = $state('\n');
	let selectedTheme = $state<NoteTheme>('default');
	let pinned = $state(false);

	let showThemePicker = $state(false);
	let latestVersion = $state('Latest');

	let currentTheme = $derived(noteThemes.find((theme) => theme.id === selectedTheme));

	const getNoteDetailsQuery = createQuery(() => ({
		queryKey: ['get-note-details', folderId, noteId],
		queryFn: () =>
			api<Notes>(`${PUBLIC_BACKEND_URI}/api/notes/${folderId}/${noteId}`, {
				method: 'GET',
				credentials: 'include'
			}),
		staleTime: 1000 * 60 * 20,
		retry: false,
		enabled: !shareable
	}));

	const getSharedNoteQuery = createQuery(() => ({
		queryKey: ['get-shared-note', shareId],
		queryFn: () =>
			api<SharedNoteLink>(`${PUBLIC_BACKEND_URI}/api/notes/share?shareId=${shareId}`, {
				method: 'GET',
				credentials: 'include'
			}),
		staleTime: 1000 * 60 * 20,
		retry: false,
		enabled: shareable && Boolean(shareId)
	}));

	const note = $derived(getNoteDetailsQuery.data);
	const isLoading = $derived(
		shareable ? getSharedNoteQuery.isPending : getNoteDetailsQuery.isPending
	);
	const isError = $derived(shareable ? getSharedNoteQuery.isError : getNoteDetailsQuery.isError);

	const shareLinkInvalid = $derived(shareable && !isLoading && isError);

	const shareableContent = $derived(getSharedNoteQuery.data?.noteContent);

	$effect(() => {
		if (isLoading || isError) return;

		noteDetails = {
			...note,
			data: editorContent,
			theme: selectedTheme,
			pinned
		};
	});

	$effect(() => {
		if (shareable || !note) return;

		changesNotSynced = compareOptions(
			{
				data: note.data,
				theme: note.theme,
				pinned: note.pinned
			},
			{
				data: editorContent,
				theme: selectedTheme,
				pinned
			}
		);
	});

	$effect(() => {
		if (!note) return;
		console.log('Note details updated:', note);
		selectedTheme = (note.theme as NoteTheme) ?? 'default';
		pinned = note.pinned;
	});

	$effect(() => {
		if (!root || crepe || isLoading || isError) return;

		let contentInsideEditor: string = '';

		if (shareable) {
			contentInsideEditor = shareableContent ?? 'Default note';
		} else {
			contentInsideEditor =
				localStorage.getItem(`note-${folderId}-${noteId}`) ??
				note?.data ??
				'Start writing something legendary...';
		}

		editorContent = contentInsideEditor;

		console.log('Creating a new Crepe instance');
		crepe = new Crepe({
			root,
			defaultValue: contentInsideEditor
		});

		crepe.setReadonly(shareable);

		crepe.on((listener) => {
			listener.markdownUpdated((ctx, markdown, prevMarkdown) => {
				if (markdown === prevMarkdown) return;

				console.log('Markdown updated:', markdown);

				if (markdown === '') markdown = '\n';

				editorContent = markdown;
				localStorage.setItem(`note-${folderId}-${noteId}`, markdown);
			});

			listener.focus(() => {
				console.log('Editor focused!');
			});
		});

		crepe
			.create()
			.then(() => {
				console.log('Editor ready to use!');
			})
			.catch((err) => {
				console.error('Error occurred while creating Editor:', err);
			});
	});

	onDestroy(() => {
		crepe?.destroy();
		crepe = null;
		console.log('Editor destroyed!');
	});

	function selectTheme(theme: NoteTheme) {
		if (theme === selectedTheme) return;

		if (!note) return;

		selectedTheme = theme;
		showThemePicker = false;
	}

	function togglePinned() {
		if (!note) return;

		pinned = !pinned;
	}
</script>

<div class="editor-shell">
	{#if shareLinkInvalid}
		<div class="flex min-h-[520px] items-center justify-center px-6">
			<div class="w-full max-w-md text-center">
				<div
					class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/60"
				>
					<Link class="h-6 w-6 text-zinc-500" />
				</div>

				<h2 class="text-lg font-semibold tracking-tight text-zinc-100">Share link unavailable</h2>

				<p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
					This share link is invalid, expired, or no longer available.
				</p>

				<button
					type="button"
					onclick={() => history.back()}
					class="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100"
				>
					<ArrowBigLeftLine class="h-4 w-4" />
					Go back
				</button>
			</div>
		</div>
	{:else}
		<div class="relative mb-5 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<button
					class="flex cursor-pointer items-center gap-2 rounded-xl border border-white/8 bg-white/3 px-3 py-2 text-sm text-zinc-300 transition hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-white"
				>
					<GitBranch class="text-fuchsia-400" />

					<span>{latestVersion}</span>

					<ChevronDown />
				</button>

				<button
					onclick={togglePinned}
					class={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition

				${
					pinned
						? 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400'
						: 'border-white/8 bg-white/3 text-zinc-400 hover:border-fuchsia-500/20 hover:bg-fuchsia-500/10 hover:text-white'
				}`}
				>
					<Pin />
				</button>
			</div>

			<div>
				{#if shareable}
					<span class="rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-xs text-fuchsia-400">
						Read Only
					</span>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				<button
					class="group flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-2 text-sm text-zinc-300 transition hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-white"
					onclick={() => (showThemePicker = !showThemePicker)}
				>
					<Palette class="text-fuchsia-400" />

					<span>Theme</span>

					<span class="rounded-full bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
						{currentTheme?.label}
					</span>

					<ChevronDown class={`transition-transform ${showThemePicker ? 'rotate-180' : ''}`} />
				</button>
			</div>

			{#if showThemePicker}
				<div
					class="absolute right-0 top-14 z-50 grid w-[470px] grid-cols-2 gap-3 rounded-3xl border border-white/8 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-xl"
				>
					{#each noteThemes as theme}
						<button
							onclick={() => selectTheme(theme.id)}
							class={`group flex cursor-pointer items-center gap-4 rounded-2xl border p-3 text-left transition

						${
							selectedTheme === theme.id
								? 'border-fuchsia-500/40 bg-fuchsia-500/10'
								: 'border-transparent hover:border-white/8 hover:bg-white/3'
						}`}
						>
							<div
								class={`relative h-14 w-11 overflow-hidden rounded-lg border border-white/10 ${theme.preview}`}
							>
								<div class="absolute inset-x-2 top-3 h-px bg-black/10"></div>

								<div class="absolute inset-x-2 top-6 h-px bg-black/10"></div>

								<div class="absolute inset-x-2 top-9 h-px bg-black/10"></div>
							</div>

							<div class="flex-1">
								<div class="font-medium text-white">
									{theme.label}
								</div>

								<div class="mt-0.5 text-xs text-zinc-500">
									{theme.description}
								</div>
							</div>

							{#if selectedTheme === theme.id}
								<Check class="text-fuchsia-400" />
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="editor-root" data-theme={selectedTheme} bind:this={root}></div>
	{/if}
</div>
