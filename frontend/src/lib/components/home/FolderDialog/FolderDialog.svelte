<script lang="ts">
	import type { FolderTheme } from '../../../../types/pages/folder.types';
	import { icons, themes } from '$lib/constants/folders';
	import { createMutation } from '@tanstack/svelte-query';
	import { api } from '$lib/util/api';
	import queryClient from '$lib/util/queryClient';
	import { replaceSpacesWithDashes } from '$lib/util/folderUtils';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';

	const { cancel } = $props<{
		cancel: () => void;
	}>();

	let title = $state('');
	let selectedTheme = $state<FolderTheme>('paper');
	let selectedIcon = $state('folder');
	let isLocked = $state(false);

	let errorMessage = $state();

	const folderMutation = createMutation(() => ({
		mutationFn: () =>
			api<void>(`${PUBLIC_BACKEND_URI}/api/folders/create`, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify({
					id: replaceSpacesWithDashes(title),
					title,
					icon: selectedIcon,
					theme: selectedTheme,
					isLocked
				}),
				headers: {
					'Content-Type': 'application/json'
				}
			}),
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: ['get-folders'] });
		},
		onError: (err) => {
			console.error('Could not create folder:', err);
		}
	}));

	async function saveFolder() {
		if (!title.trim()) return;

		console.log({
			id: title.trim().toLowerCase().replace(/\s+/g, '-'),
			title,
			icon: selectedIcon,
			theme: selectedTheme,
			isLocked
		});

		errorMessage = '';

		try {
			await folderMutation.mutateAsync();

			cancel();
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : 'Failed to create folder.';
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') cancel();
	}}
/>

<dialog
	class="fixed inset-0 z-200 h-full w-full flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
	onclick={(e) => {
		if (e.target === e.currentTarget) cancel();
	}}
>
	<div
		class="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#111318] shadow-2xl shadow-black/50"
	>
		<div class="border-b border-zinc-800 px-7 py-6">
			<h2 class="text-xl font-semibold text-white">Create New Folder</h2>
			<p class="mt-1 text-sm text-zinc-500">Organize your notes into a new folder.</p>
		</div>

		<div class="space-y-8 px-7 py-6">
			<div class="space-y-2 flex flex-col gap-0.5">
				<span class="text-sm font-medium text-zinc-300"> Folder Name </span>

				<input
					bind:value={title}
					placeholder="Personal"
					class="w-full rounded-xl border border-zinc-800 bg-[#181b22] px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-violet-500/70"
				/>
			</div>

			<div
				class="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#181b22] px-4 py-3"
			>
				<div class="flex flex-col">
					<span class="text-sm font-medium text-zinc-200"> Encrypted Folder </span>

					<span class="text-xs text-zinc-500">
						Notes will be encrypted before being stored in GitHub.
					</span>
				</div>

				<button
					type="button"
					role="switch"
					aria-label="Toggle folder encryption"
					aria-checked={isLocked}
					onclick={() => (isLocked = !isLocked)}
					class="relative h-6 w-11 rounded-full transition-colors cursor-pointer
		{isLocked ? 'bg-violet-600' : 'bg-zinc-700'}"
				>
					<div
						class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform
			{isLocked ? 'translate-x-5' : 'translate-x-0'}"
					></div>
				</button>
			</div>

			<div class="space-y-3 flex flex-col gap-0.5">
				<span class="text-sm font-medium text-zinc-300"> Theme </span>

				<div class="grid grid-cols-3 gap-3">
					{#each themes as theme}
						<button
							type="button"
							onclick={() => (selectedTheme = theme.id)}
							class="flex items-center gap-3 rounded-xl border px-3 py-3 transition cursor-pointer
								{selectedTheme === theme.id
								? 'border-violet-500 bg-violet-500/10'
								: 'border-zinc-800 hover:border-zinc-700'}"
						>
							<div class="h-5 w-5 rounded-full border {theme.class}"></div>

							<span class="text-sm text-zinc-300">
								{theme.label}
							</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="space-y-3 flex flex-col gap-0.5">
				<span class="text-sm font-medium text-zinc-300"> Icon </span>

				<div class="grid grid-cols-4 gap-3">
					{#each icons as icon}
						<button
							type="button"
							onclick={() => (selectedIcon = icon.id)}
							class="flex p-3 items-center justify-center rounded-xl border transition cursor-pointer
								{selectedIcon === icon.id
								? 'border-violet-500 bg-violet-500/10 text-violet-400'
								: 'border-zinc-800 bg-[#181b22] text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}"
						>
							<icon.component class="h-5 w-5" />
						</button>
					{/each}
				</div>
			</div>
		</div>

		{#if errorMessage}
			<div class="px-7 pb-4">
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
				class="rounded-xl border border-zinc-800 px-5 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800/50 hover:text-white cursor-pointer"
			>
				Cancel
			</button>

			<button
				type="button"
				onclick={saveFolder}
				disabled={!title.trim()}
				class="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
			>
				Create Folder
			</button>
		</div>
	</div>
</dialog>
