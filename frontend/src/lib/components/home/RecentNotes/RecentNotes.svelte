<script lang="ts">
	import { api } from '$lib/util/api';
	import { goto } from '$app/navigation';
	import { createQuery } from '@tanstack/svelte-query';
	import type { DetailedNotes, Notes } from '../../../../types/pages/notes.types';
	import { Note, ChevronRight, DotsVerticalRounded, Pin } from '@boxicons/svelte';
	import { formatLastEditedDate, getNoteColor, normalizeTitlesOfNotes } from '$lib/util/noteUtils';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';

	const getNotesQuery = createQuery(() => ({
		queryKey: ['get-notes', 'all-notes'],
		queryFn: () =>
			api<DetailedNotes[]>(`${PUBLIC_BACKEND_URI}/api/notes?folder=all-notes`, {
				method: 'GET',
				credentials: 'include'
			}),
		staleTime: 1000 * 60 * 20,
		retry: false
	}));

	let recents = $derived.by(() => {
		const data = getNotesQuery.data || [];

		const notes: Notes[] = normalizeTitlesOfNotes(data.flatMap((val) => val.notes));

		return notes
			.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
			.slice(0, 5);
	});

	function handleClickViewAll() {
		goto('/folders/all-notes');
	}
</script>

<div class="space-y-4 px-2">
	<div class="flex items-center justify-between">
		<h2 class="text-sm font-semibold text-zinc-300 tracking-wider uppercase">Recent Notes</h2>
		<button
			class="flex items-center gap-0.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
			onclick={handleClickViewAll}
		>
			<span>View all</span>
			<ChevronRight class="h-3.5 w-3.5" />
		</button>
	</div>

	<div
		class="divide-y divide-zinc-800/30 overflow-hidden rounded-2xl border border-zinc-800/40 bg-[#0d0f12]/40 shadow-xl"
	>
		{#if getNotesQuery.isPending}
			{#each Array(5) as _}
				<div class="flex items-center justify-between p-3.5 animate-pulse">
					<div class="flex min-w-0 flex-1 items-center gap-3.5">
						<div class="h-9 w-9 shrink-0 rounded-xl border border-zinc-800 bg-zinc-800/70"></div>

						<div class="min-w-0 flex-1 space-y-2">
							<div class="h-4 w-42 rounded bg-zinc-800/70"></div>
							<div class="h-3 w-64 rounded bg-zinc-900"></div>
						</div>
					</div>

					<div class="ml-4 flex shrink-0 items-center gap-6">
						<div class="h-3 w-20 rounded bg-zinc-800/70"></div>

						<div class="h-6 w-6 rounded-full border border-zinc-800 bg-zinc-800/70"></div>

						<div class="h-5 w-5 rounded bg-zinc-800/70"></div>
					</div>
				</div>
			{/each}
		{:else if getNotesQuery.isError}
			<div class="flex flex-col items-center justify-center px-8 py-12 text-center">
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10"
				>
					<Note class="h-5 w-5 text-red-400" />
				</div>

				<h3 class="text-sm font-semibold text-zinc-200">Couldn't load recent notes</h3>

				<p class="mt-2 text-xs text-zinc-500">
					{getNotesQuery.error.message}
				</p>

				<button
					onclick={() => getNotesQuery.refetch()}
					class="mt-5 cursor-pointer rounded-xl border border-zinc-700 bg-[#181B22] px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
				>
					Try Again
				</button>
			</div>
		{:else if recents.length === 0}
			<div class="flex flex-col items-center justify-center px-8 py-12 text-center">
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900"
				>
					<Note class="h-5 w-5 text-zinc-500" />
				</div>

				<h3 class="text-sm font-semibold text-zinc-300">No recent notes</h3>

				<p class="mt-2 text-xs text-zinc-500">Your recently edited notes will appear here.</p>
			</div>
		{:else}
			{#each recents as note}
				<a
					class="group flex items-center justify-between p-3.5 transition-colors hover:bg-white/2 class:active-glow={note.pinned}"
					href={`/notes/${note.id}?folder=${note.folder}`}
				>
					<div class="flex min-w-0 flex-1 items-center gap-3.5">
						<div
							class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800/40 {getNoteColor(
								note.title
							)}"
						>
							<Note class="h-4 w-4" />
						</div>

						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<span
									class="truncate text-sm font-medium text-zinc-200 transition-colors group-hover:text-zinc-100"
								>
									{note.title}
								</span>

								{#if note.pinned}
									<Pin class="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
								{/if}
							</div>

							<p class="mt-0.5 truncate text-xs text-zinc-500">
								{note.desc}
							</p>
						</div>
					</div>

					<div class="ml-4 flex shrink-0 items-center gap-6">
						<span class="whitespace-nowrap text-xs font-medium text-zinc-500">
							{formatLastEditedDate(note.updatedAt)}
						</span>

						<img
							src={note.updatedByAvatarUrl}
							alt="Editor context profile"
							class="h-6 w-6 rounded-full border border-zinc-800/60 shadow-sm"
						/>

						<button
							class="cursor-pointer rounded-lg p-1 text-zinc-600 transition-colors hover:text-zinc-400"
							onclick={() => {}}
						>
							<DotsVerticalRounded class="h-4 w-4" />
						</button>
					</div>
				</a>
			{/each}
		{/if}
	</div>
</div>
