<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		ArrowLeft,
		ArrowOutUpRightSquare,
		Check,
		ChevronDown,
		Cloud,
		DotsVerticalRounded,
		History,
		Search,
		Share,
		SliderAlt,
		Trash
	} from '@boxicons/svelte';

	import {
		extractPageName,
		extractPageDesc,
		extractPageIcon,
		isFolderPage,
		isNotePage
	} from '$lib/util/pageUtils';

	import { sidebarIconMap } from '$lib/constants/sidebar';
	import NewButton from './NewButton.svelte';
	import {
		replaceSpacesWithUnderscores,
		replaceUnderscoresWithBlankAndCapitalize
	} from '$lib/util/noteUtils';
	import { autoSyncOptions } from '$lib/constants/notes';
	import { onDestroy } from 'svelte';
	import UpdateNoteDialog from './notes/UpdateNoteDialog/UpdateNoteDialog.svelte';
	import type { Notes, SharedNoteLink } from '../../types/pages/notes.types';
	import { createMutation } from '@tanstack/svelte-query';
	import { api } from '$lib/util/api';
	import queryClient from '$lib/util/queryClient';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';
	import DeleteNoteDialog from './notes/DeleteNoteDialog/DeleteNoteDialog.svelte';
	import ShareNoteDialog from './notes/ShareNoteDialog/ShareNoteDialog.svelte';

	type SaveNoteInput = {
		desc: string;
		commitMsg: string;
	};

	const fullPath = $derived(page.url.pathname);

	const pageName = $derived(extractPageName(fullPath));
	const pageDesc = $derived(extractPageDesc(fullPath));
	const pageIcon = $derived(extractPageIcon(fullPath));

	const folderPage = $derived(isFolderPage(fullPath));
	const notePage = $derived(isNotePage(fullPath));

	const parentFolder = $derived(fullPath.split('/').filter(Boolean).at(-2) ?? '');

	const Icon = $derived(sidebarIconMap[pageIcon ?? 'notes'] ?? sidebarIconMap.notes);

	let {
		search = $bindable(),
		changesNotSynced = $bindable(),
		noteDetails = $bindable(),
		noteId = $bindable(),
		folderId = $bindable()
	} = $props<{
		search?: string;
		changesNotSynced?: boolean;
		noteId?: string;
		folderId?: string;
		noteDetails?: Notes;
	}>();

	let showSaveOptions = $state(false);
	let showMoreOptions = $state(false);
	let showUpdateNoteDialog = $state(false);
	let showShareNoteDialog = $state(false);

	let deleteDialogOpen = $state(false);

	type AutoSyncOption = (typeof autoSyncOptions)[number];
	let selectedAutoSync = $state<AutoSyncOption>(autoSyncOptions[0]);

	const updateNoteMutation = createMutation(() => ({
		mutationFn: ({ desc, commitMsg }: SaveNoteInput) =>
			api<void>(`${PUBLIC_BACKEND_URI}/api/notes/update`, {
				method: 'PUT',
				credentials: 'include',
				body: JSON.stringify({
					title: replaceSpacesWithUnderscores(noteId || ''),
					desc,
					folder: folderId,
					commitMsg,
					theme: noteDetails.theme,
					data: noteDetails.data,
					pinned: noteDetails.pinned
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			}),
		onSuccess: async () => {
			localStorage.removeItem(`note-${folderId}-${noteId}`);
			changesNotSynced = false;

			queryClient.invalidateQueries({ queryKey: ['get-note-details', folderId, noteId] });

			showUpdateNoteDialog = false;
		},
		onError: (err) => {
			console.error('Could not update note:', err);
		}
	}));

	const createSharedLinkMutation = createMutation(() => ({
		mutationFn: () =>
			api<SharedNoteLink>(`${PUBLIC_BACKEND_URI}/api/notes/share`, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify({
					...noteDetails
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			}),
		onError: (err) => {
			console.error('Could not create shared link:', err);
		}
	}));

	let shareUrl = $derived(
		`${page.url.origin}/notes/${noteId}?folder=${folderId}&shareId=${createSharedLinkMutation?.data?.shareId}`
	);

	let loading = $derived(updateNoteMutation.isPending);

	let intervalId: ReturnType<typeof setInterval> | undefined;

	function setupAutoSync(autoSyncOption: AutoSyncOption) {
		if (intervalId !== undefined) clearInterval(intervalId);

		if (!autoSyncOption) return;

		const intervalTime = autoSyncOption.time || 0;

		if (intervalTime > 0) {
			intervalId = setInterval(handleAutoSave, intervalTime);
		}
	}

	$effect.pre(() => {
		const saved = localStorage.getItem('kairno-auto-sync');
		const option = saved ? JSON.parse(saved) : autoSyncOptions[0];

		selectedAutoSync = option;
		setupAutoSync(option);
	});

	async function saveNote(desc: string, commitMsg: string) {
		if (!noteDetails) return;

		await updateNoteMutation.mutateAsync({
			desc,
			commitMsg
		});
	}

	const handleManualSave = () => {
		showUpdateNoteDialog = true;
	};

	async function handleAutoSave() {
		if (!changesNotSynced || !noteDetails) return;

		try {
			await saveNote(noteDetails.desc, 'Auto-saved changes');
		} catch (err) {
			console.error('Auto-save failed:', err);
		}
	}

	const handleSaveOptions = () => {
		showSaveOptions = !showSaveOptions;
	};

	const handleMoreOptions = () => {
		showMoreOptions = !showMoreOptions;
	};

	const selectAutoSync = (autoSyncOption: AutoSyncOption) => {
		setupAutoSync(autoSyncOption);
		localStorage.setItem('kairno-auto-sync', JSON.stringify(autoSyncOption));
		selectedAutoSync = autoSyncOption;
		showSaveOptions = false;
	};

	const handleShare = async () => {
		showMoreOptions = false;
		showSaveOptions = false;
		// API call to insert inside the sharedLinks table
		// shareUrl must be generated from the API call
		await createSharedLinkMutation.mutateAsync();
		showShareNoteDialog = true;
	};

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});
</script>

{#if notePage}
	{#if showUpdateNoteDialog}
		<UpdateNoteDialog
			bind:loading
			bind:open={showUpdateNoteDialog}
			bind:noteDetails
			onSave={saveNote}
		/>
	{:else}
		{#if deleteDialogOpen}
			<DeleteNoteDialog
				bind:deleteDialogOpen
				bind:noteDetails
				{changesNotSynced}
				onSaveRequired={handleManualSave}
			/>
		{/if}

		{#if showShareNoteDialog}
			<ShareNoteDialog bind:open={showShareNoteDialog} {shareUrl} />
		{/if}

		<div
			class="flex flex-col gap-4 border-b border-zinc-800/80 pb-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="flex min-w-0 items-center gap-3">
				<button
					onclick={() => history.back()}
					class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-zinc-800/60 bg-[#12141c] text-zinc-400 transition-all hover:bg-zinc-800/40 hover:text-zinc-200"
					aria-label="Go back"
				>
					<ArrowLeft class="h-4 w-4" />
				</button>

				<div class="min-w-0">
					<h1 class="truncate text-xl font-semibold tracking-tight text-zinc-100">
						{replaceUnderscoresWithBlankAndCapitalize(pageName)}
					</h1>

					<div class="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
						{#if parentFolder}
							<button
								onclick={() => goto(`/folders/${parentFolder}`)}
								class="cursor-pointer transition-colors hover:text-zinc-300"
							>
								{extractPageName(`/folders/${parentFolder}`)}
							</button>

							<span class="text-zinc-700">/</span>
						{/if}

						<span class="truncate text-zinc-400">
							{pageName}
						</span>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<div class="mr-2 flex items-center gap-1.5 text-xs">
					{#if changesNotSynced}
						<div class="h-2 w-2 shrink-0 rounded-full bg-amber-400"></div>
						<span class="hidden text-amber-400 lg:inline"> Unsynced changes </span>
					{:else}
						<Check class="h-4 w-4 shrink-0 text-emerald-500" />
						<span class="hidden lg:inline">All changes saved</span>
					{/if}
				</div>

				<button
					class={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-all ${
						changesNotSynced
							? 'cursor-not-allowed border-zinc-800/60 bg-zinc-900/50 text-zinc-600 opacity-60'
							: 'cursor-pointer border-zinc-800/60 bg-[#12141c] text-zinc-300 hover:bg-zinc-800/40 hover:text-zinc-100'
					}`}
					onclick={handleShare}
					disabled={changesNotSynced}
					aria-label={'Share note'}
				>
					<Share class="h-4 w-4" />
					<span class="hidden lg:inline">Share</span>
				</button>

				<div class="relative">
					<div
						class={`flex items-center overflow-hidden rounded-xl border text-white shadow-sm shadow-black/20 transition-all
						${
							changesNotSynced
								? ' border-indigo-400/20 bg-purple-600 hover:bg-purple-500'
								: 'cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-500 opacity-60'
						}`}
					>
						<button
							class="flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer"
							disabled={!changesNotSynced}
							onclick={handleManualSave}
						>
							<Cloud class="h-4 w-4" />
							<span class="whitespace-nowrap">Save & Sync</span>
						</button>

						<div class={`h-4 w-px ${changesNotSynced ? 'bg-white/20' : 'bg-zinc-700'}`}></div>

						<button
							class={`px-2.5 py-2 transition-colors ${
								changesNotSynced ? 'cursor-pointer hover:bg-black/10' : 'cursor-not-allowed'
							}`}
							disabled={!changesNotSynced}
							aria-label="Save options"
							onclick={handleSaveOptions}
						>
							<ChevronDown
								class={`h-3.5 w-3.5 transition-transform ${showSaveOptions ? 'rotate-180' : ''}`}
							/>
						</button>
					</div>

					{#if showSaveOptions}
						<div
							class="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111318] shadow-2xl"
						>
							<div class="border-b border-zinc-800 px-4 py-3">
								<h3 class="text-sm font-medium text-zinc-100">Auto Sync</h3>

								<p class="mt-1 text-xs text-zinc-500">Automatically save changes to GitHub.</p>
							</div>

							<div class="p-2">
								{#each autoSyncOptions as option}
									<button
										class={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition
									${
										selectedAutoSync.label === option.label
											? 'bg-purple-500/15 text-purple-300'
											: 'text-zinc-300 hover:bg-zinc-800/70'
									}`}
										onclick={() => selectAutoSync(option)}
									>
										<span>{option.label}</span>

										{#if selectedAutoSync.label === option.label}
											<Check class="h-4 w-4 text-purple-400" />
										{/if}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class="relative">
					<button
						class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-800/60 bg-[#12141c] text-zinc-400 transition-all hover:bg-zinc-800/40 hover:text-zinc-200"
						aria-label="More options"
						aria-expanded={showMoreOptions}
						onclick={handleMoreOptions}
					>
						<DotsVerticalRounded
							class={`h-4 w-4 transition-transform ${showMoreOptions ? 'rotate-90' : ''}`}
						/>
					</button>

					{#if showMoreOptions}
						<div
							class="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-2xl border border-zinc-800 bg-[#111318] p-1.5 shadow-2xl shadow-black/40"
						>
							<button
								class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800/70 hover:text-zinc-100"
								onclick={() => {
									showMoreOptions = false;
									// TODO: open version history
								}}
							>
								<History class="h-4 w-4 text-zinc-500" />

								<span>Version history</span>
							</button>

							<button
								class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800/70 hover:text-zinc-100"
								onclick={() => {
									showMoreOptions = false;
									// TODO: Change this to reflect proper owner once collaborative edit feature is enabled
									window.open(`https://github.com/${noteDetails.updatedBy}/Kairno-Notes`, '_blank');
								}}
							>
								<ArrowOutUpRightSquare class="h-4 w-4 text-zinc-500" />

								<span>Open in GitHub </span>
							</button>

							<div class="my-1.5 h-px bg-zinc-800"></div>

							<button
								class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
								onclick={() => {
									showMoreOptions = false;
									deleteDialogOpen = true;
								}}
							>
								<Trash class="h-4 w-4" />

								<span>Delete note</span>
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
{:else if folderPage}
	<div
		class="flex flex-col gap-4 border-b border-zinc-800/80 pb-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="flex min-w-0 items-start gap-3">
			<div class="mt-1 text-zinc-500">
				<Icon class="h-5 w-5" />
			</div>

			<div>
				<h1 class="text-xl font-semibold tracking-tight text-zinc-100">
					{pageName}
				</h1>

				{#if pageDesc}
					<p class="mt-0.5 text-xs text-zinc-500">
						{pageDesc}
					</p>
				{/if}
			</div>
		</div>

		<div class="flex w-full items-center gap-2 sm:w-auto">
			<div class="group relative flex-1 sm:w-64 lg:w-80">
				<Search
					class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-purple-400"
				/>

				<input
					type="text"
					placeholder={`Search in ${pageName}...`}
					class="w-full rounded-xl border border-zinc-800/60 bg-[#12141c] py-2 pl-10 pr-12 text-sm text-zinc-200 placeholder-zinc-600 transition-all focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700/50"
					bind:value={search}
				/>

				<kbd
					class="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 md:inline-flex"
				>
					⌘ K
				</kbd>
			</div>

			<button
				class="cursor-pointer rounded-xl border border-zinc-800/60 bg-[#12141c] p-2 text-zinc-400 transition-all hover:bg-zinc-800/40 hover:text-zinc-200"
				aria-label="Filter notes"
			>
				<SliderAlt class="h-4 w-4" />
			</button>

			<NewButton />
		</div>
	</div>
{:else}
	<div
		class="flex flex-col gap-4 border-b border-zinc-800/80 pb-4 sm:flex-row sm:items-center sm:justify-between"
	>
		<div class="flex min-w-0 items-start gap-3">
			<div class="mt-1 text-zinc-500">
				<Icon class="h-5 w-5" />
			</div>

			<div>
				<h1 class="text-xl font-semibold tracking-tight text-zinc-100">
					{pageName}
				</h1>

				{#if pageDesc}
					<p class="mt-0.5 text-xs text-zinc-500">
						{pageDesc}
					</p>
				{/if}
			</div>
		</div>

		<div class="flex w-full items-center gap-2 sm:w-auto">
			<div class="group relative flex-1 sm:w-64 lg:w-80">
				<Search
					class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-purple-400"
				/>

				<input
					type="text"
					placeholder="Search folders..."
					class="w-full rounded-xl border border-zinc-800/60 bg-[#12141c] py-2 pl-10 pr-12 text-sm text-zinc-200 placeholder-zinc-600 transition-all focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700/50"
					bind:value={search}
				/>

				<kbd
					class="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 md:inline-flex"
				>
					⌘ K
				</kbd>
			</div>

			<button
				class="cursor-pointer rounded-xl border border-zinc-800/60 bg-[#12141c] p-2 text-zinc-400 transition-all hover:bg-zinc-800/40 hover:text-zinc-200"
				aria-label="Filter notes"
			>
				<SliderAlt class="h-4 w-4" />
			</button>

			<NewButton />
		</div>
	</div>
{/if}
