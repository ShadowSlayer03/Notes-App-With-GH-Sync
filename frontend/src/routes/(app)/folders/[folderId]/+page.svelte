<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { api } from '$lib/util/api';
	import { Note, ChevronDown, DotsVerticalRounded, Check } from '@boxicons/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import type { DetailedNotes, Notes } from '../../../../types/pages/notes.types.js';
	import {
		formatLastEditedDate,
		getNoteColor,
		normalizeTitlesOfNotes,
		sortNotes
	} from '$lib/util/noteUtils.js';
	import LoadingState from '$lib/components/notes/LoadingState/LoadingState.svelte';
	import ErrorState from '$lib/components/notes/ErrorState/ErrorState.svelte';
	import EmptyState from '$lib/components/notes/EmptyState/EmptyState.svelte';
	import { sortOptions } from '$lib/constants/notes.js';
	import { goto } from '$app/navigation';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';

	const notesConst = [
		{
			id: '1',
			title: 'Books I Want to Read',
			desc: 'A collection of must-read books across fiction, non-fiction and more.',
			date: 'Today at 09:41',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '2',
			title: 'Monthly Reflections – May 2024',
			desc: "What went well, what didn't, and what I learned.",
			date: 'Today at 08:17',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '3',
			title: 'Gym Plan & Progress Tracker 🏋️',
			desc: 'Workouts, goals, and weekly progress.',
			date: 'Yesterday at 21:33',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '4',
			title: 'Ideas for Side Projects',
			desc: 'A dump of random ideas that might turn into something.',
			date: 'Yesterday at 18:52',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '5',
			title: 'Travel Bucket List',
			desc: 'Places to visit, experiences to have, things to do.',
			date: 'May 20, 2024',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '6',
			title: 'Journal – 18 May 2024',
			desc: 'A short journal entry about today.',
			date: 'May 18, 2024',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '6',
			title: 'Journal – 18 May 2024',
			desc: 'A short journal entry about today.',
			date: 'May 18, 2024',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '6',
			title: 'Journal – 18 May 2024',
			desc: 'A short journal entry about today.',
			date: 'May 18, 2024',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '6',
			title: 'Journal – 18 May 2024',
			desc: 'A short journal entry about today.',
			date: 'May 18, 2024',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '6',
			title: 'Journal – 18 May 2024',
			desc: 'A short journal entry about today.',
			date: 'May 18, 2024',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '6',
			title: 'Journal – 18 May 2024',
			desc: 'A short journal entry about today.',
			date: 'May 18, 2024',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		},
		{
			id: '6',
			title: 'Journal – 18 May 2024',
			desc: 'A short journal entry about today.',
			date: 'May 18, 2024',
			user: {
				name: 'Mike Storm',
				avatar:
					'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
			}
		}
	];

	const { params } = $props<{
		params: {
			folderId: string;
		};
	}>();

	let showSortMenu = $state(false);
	let sortedBy = $state('lastEdited');
	let folderId = $derived(params.folderId);

	let search = $state('');

	const getNotesQuery = createQuery(() => ({
		queryKey: ['get-notes', folderId],
		queryFn: () =>
			api<DetailedNotes[] | DetailedNotes>(`${PUBLIC_BACKEND_URI}/api/notes?folder=${folderId}`, {
				method: 'GET',
				credentials: 'include'
			}),
		staleTime: 1000 * 60 * 20,
		retry: false
	}));

	let sortedNotes = $derived.by(() => {
		const data = getNotesQuery.data;

		if (!data) return [];

		if (folderId === 'all-notes') {
			return (data as DetailedNotes[])?.flatMap((detailedNote) =>
				normalizeTitlesOfNotes(sortNotes(detailedNote.notes, sortedBy))
			);
		}

		return normalizeTitlesOfNotes(sortNotes((data as DetailedNotes)?.notes, sortedBy));
	});

	let pinnedNotes = $derived.by(() => {
		return sortedNotes.filter((note: Notes) => note.pinned);
	});

	let nonPinnedNotes = $derived.by(() => {
		return sortedNotes.filter((note: Notes) => !note.pinned);
	});

	let filteredNotes = $derived.by(() => {
		return sortedNotes.filter((note: Notes) =>
			note.title.toLocaleLowerCase().includes(search.toLocaleLowerCase())
		);
	});
	
</script>

{#if getNotesQuery.isPending}
	<LoadingState />
{:else if getNotesQuery.isError}
	<ErrorState message={getNotesQuery.error.message} refetch={() => getNotesQuery.refetch()} />
{:else if sortedNotes?.length === 0}
	<EmptyState />
{:else}
	<div
		class="p-6 text-zinc-100 bg-[#0D0F12] h-full flex flex-col font-sans antialiased select-none"
	>
		<PageHeader bind:search />

		<div class="flex items-center justify-between mt-6 mb-4">
			<div class="relative">
				<button
					onclick={() => (showSortMenu = !showSortMenu)}
					class="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-800/80 bg-[#12141c]/40 px-3.5 py-2 text-xs font-medium text-zinc-300 transition-all hover:bg-[#161920]/60"
				>
					<span>
						Sort: {sortOptions.find((o) => o.id === sortedBy)?.name}
					</span>

					<ChevronDown
						class="h-3.5 w-3.5 transition-transform {showSortMenu ? 'rotate-180' : ''}"
					/>
				</button>

				{#if showSortMenu}
					<div
						class="absolute left-0 top-11 z-50 w-36 overflow-hidden rounded-xl border border-zinc-800 bg-[#111318] shadow-2xl"
					>
						{#each sortOptions as option}
							<button
								onclick={() => {
									sortedBy = option.id;
									showSortMenu = false;
								}}
								class="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left text-xs transition
							{sortedBy === option.id
									? 'bg-violet-500/10 text-violet-300'
									: 'text-zinc-300 hover:bg-zinc-800/60'}"
							>
								<span>{option.name}</span>

								{#if sortedBy === option.id}
									<Check class="h-4 w-4" />
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="flex-1 w-full overflow-x-auto">
			<table class="w-full text-left border-collapse min-w-175">
				<thead>
					<tr
						class="border-b border-zinc-800/30 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase"
					>
						<th class="pb-3 pl-4 font-medium w-[55%]">Title</th>
						<th class="pb-3 font-medium w-[20%]">Last edited</th>
						<th class="pb-3 font-medium w-[20%]">Updated by</th>
						<th class="pb-3 pr-4 text-right font-medium w-[5%]"></th>
					</tr>
				</thead>
				{#if search.length > 0}
					<tbody class="divide-y divide-zinc-800/20">
						{#each filteredNotes as note (note.title)}
							<tr
								class="group hover:bg-white/1.5 transition-colors cursor-pointer"
								onclick={() => goto(`/notes/${note.id}?folder=${note.folder}`)}
							>
								<td class="py-3.5 pl-4 pr-3 flex items-start gap-3.5 min-w-0">
									<div
										class={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 group-hover:text-zinc-200 transition-colors ${getNoteColor(note.title)}`}
									>
										<Note class="h-4 w-4" />
									</div>
									<div class="flex flex-col min-w-0 justify-center">
										<span
											class="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate"
										>
											{note.title}
										</span>
										<span class="text-xs text-zinc-500 truncate mt-0.5 max-w-125">
											{note.desc}
										</span>
									</div>
								</td>

								<td class="py-3.5 text-xs text-zinc-400 font-medium align-middle">
									{formatLastEditedDate(note.updatedAt)}
								</td>

								<td class="py-3.5 align-middle">
									<div class="flex items-center gap-2">
										<img
											src={note.updatedByAvatarUrl}
											alt={note.updatedBy}
											class="h-5 w-5 rounded-full object-cover ring-1 ring-white/10"
										/>
										<span class="text-xs font-medium text-zinc-300">{note.updatedBy}</span>
									</div>
								</td>

								<td class="py-3.5 pr-4 text-right align-middle">
									<button
										class="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg transition-all cursor-pointer"
									>
										<DotsVerticalRounded class="h-4 w-4" />
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				{:else}
					{#if pinnedNotes.length > 0}
						<tbody class="divide-y divide-zinc-800/20">
							<tr>
								<td colspan="4" class="px-4 pb-2 pt-5">
									<div class="flex items-center gap-2">
										<span class="text-xs font-semibold uppercase tracking-wider text-zinc-500">
											Pinned
										</span>
										<span
											class="rounded-md bg-zinc-800/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500"
										>
											{pinnedNotes.length}
										</span>
									</div>
								</td>
							</tr>

							{#each pinnedNotes as note (note.title)}
								<tr
									class="group cursor-pointer transition-colors hover:bg-white/1.5"
									onclick={() => goto(`/notes/${note.id}?folder=${note.folder}`)}
								>
									<td class="flex min-w-0 items-start gap-3.5 py-3.5 pl-4 pr-3">
										<div
											class={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 transition-colors group-hover:text-zinc-200 ${getNoteColor(note.title)}`}
										>
											<Note class="h-4 w-4" />
										</div>

										<div class="flex min-w-0 flex-col justify-center">
											<span
												class="truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-white"
											>
												{note.title}
											</span>

											<span class="mt-0.5 max-w-125 truncate text-xs text-zinc-500">
												{note.desc}
											</span>
										</div>
									</td>

									<td class="py-3.5 align-middle text-xs font-medium text-zinc-400">
										{formatLastEditedDate(note.updatedAt)}
									</td>

									<td class="py-3.5 align-middle">
										<div class="flex items-center gap-2">
											<img
												src={note.updatedByAvatarUrl}
												alt={note.updatedBy}
												class="h-5 w-5 rounded-full object-cover ring-1 ring-white/10"
											/>
											<span class="text-xs font-medium text-zinc-300">
												{note.updatedBy}
											</span>
										</div>
									</td>

									<td class="py-3.5 pr-4 text-right align-middle">
										<button
											class="cursor-pointer rounded-lg p-1 text-zinc-500 opacity-0 transition-all hover:text-zinc-300 group-hover:opacity-100"
										>
											<DotsVerticalRounded class="h-4 w-4" />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					{/if}

					{#if nonPinnedNotes.length > 0}
						<tbody class="divide-y divide-zinc-800/20">
							<tr>
								<td colspan="4" class="px-4 pb-2 pt-6">
									<div class="flex items-center gap-2">
										<span class="text-xs font-semibold uppercase tracking-wider text-zinc-500">
											Other notes
										</span>
										<span
											class="rounded-md bg-zinc-800/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500"
										>
											{nonPinnedNotes.length}
										</span>
									</div>
								</td>
							</tr>

							{#each nonPinnedNotes as note (note.title)}
								<tr
									class="group cursor-pointer transition-colors hover:bg-white/1.5"
									onclick={() => goto(`/notes/${note.id}?folder=${note.folder}`)}
								>
									<td class="flex min-w-0 items-start gap-3.5 py-3.5 pl-4 pr-3">
										<div
											class={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 transition-colors group-hover:text-zinc-200 ${getNoteColor(note.title)}`}
										>
											<Note class="h-4 w-4" />
										</div>

										<div class="flex min-w-0 flex-col justify-center">
											<span
												class="truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-white"
											>
												{note.title}
											</span>

											<span class="mt-0.5 max-w-125 truncate text-xs text-zinc-500">
												{note.desc}
											</span>
										</div>
									</td>

									<td class="py-3.5 align-middle text-xs font-medium text-zinc-400">
										{formatLastEditedDate(note.updatedAt)}
									</td>

									<td class="py-3.5 align-middle">
										<div class="flex items-center gap-2">
											<img
												src={note.updatedByAvatarUrl}
												alt={note.updatedBy}
												class="h-5 w-5 rounded-full object-cover ring-1 ring-white/10"
											/>
											<span class="text-xs font-medium text-zinc-300">
												{note.updatedBy}
											</span>
										</div>
									</td>

									<td class="py-3.5 pr-4 text-right align-middle">
										<button
											class="cursor-pointer rounded-lg p-1 text-zinc-500 opacity-0 transition-all hover:text-zinc-300 group-hover:opacity-100"
										>
											<DotsVerticalRounded class="h-4 w-4" />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					{/if}
				{/if}
			</table>
		</div>
	</div>
{/if}
