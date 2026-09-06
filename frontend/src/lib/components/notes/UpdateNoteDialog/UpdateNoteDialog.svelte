<script lang="ts">
	import { X, Pen, GitCommit, Save } from '@boxicons/svelte';
	import type { Notes } from '../../../../types/pages/notes.types';

	let {
		open = $bindable(false),
		noteDetails = $bindable(),
		loading = $bindable(false),
		onSave
	} = $props<{
		open: boolean;
		loading: boolean;
		noteDetails: Notes;
		onSave: (desc: string, commitMsg: string) => Promise<void>;
	}>();

	let desc = $state(noteDetails.desc);
	let versionNote = $state('');

	let canSave = $derived(
		desc.trim().length > 0 &&
			desc.trim().length <= 180 &&
			versionNote.trim().length > 0 &&
			versionNote.trim().length <= 80 &&
			!loading
	);

	function close() {
		if (loading) return;
		open = false;
	}

	async function handleSave() {
		if (!canSave || loading) return;

		loading = true;

		try {
			await onSave(desc.trim(), versionNote.trim());

			close();
		} catch (err) {
			console.error('Could not save note:', err);
		} finally {
			loading = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}

		if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
			handleSave();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
		role="presentation"
		onclick={(event) => {
			if (event.target === event.currentTarget) close();
		}}
	>
		<div
			class="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/40"
			role="dialog"
			aria-modal="true"
			aria-labelledby="update-note-title"
		>
			<div class="flex items-start justify-between border-b border-white/8 px-6 py-5">
				<div>
					<h2 id="update-note-title" class="text-lg font-semibold text-zinc-100">Save changes</h2>

					<p class="mt-1 text-sm text-zinc-500">Update the note and create a new version.</p>
				</div>

				<button
					type="button"
					onclick={close}
					disabled={loading}
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
					aria-label="Close"
				>
					<X size="sm" />
				</button>
			</div>

			<div class="space-y-6 px-6 py-6">
				<div>
					<div class="mb-2 flex items-center justify-between">
						<label
							for="note-description"
							class="flex items-center gap-2 text-sm font-medium text-zinc-200"
						>
							<Pen size="sm" class="text-purple-400" />
							Description
						</label>

						<span class={`text-xs ${desc.length > 180 ? 'text-red-400' : 'text-zinc-600'}`}>
							{desc.length}/180
						</span>
					</div>

					<textarea
						id="note-description"
						bind:value={desc}
						maxlength="180"
						rows="3"
						placeholder="What is this note about?"
						disabled={loading}
						class="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-purple-500/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
					></textarea>

					<p class="mt-2 text-xs text-zinc-600">
						This describes the note itself, not just this version.
					</p>
				</div>

				<div>
					<div class="mb-2 flex items-center justify-between">
						<label
							for="version-note"
							class="flex items-center gap-2 text-sm font-medium text-zinc-200"
						>
							<GitCommit size="sm" class="text-purple-400" />
							Version note
						</label>

						<span class={`text-xs ${versionNote.length > 80 ? 'text-red-400' : 'text-zinc-600'}`}>
							{versionNote.length}/80
						</span>
					</div>

					<input
						id="version-note"
						type="text"
						bind:value={versionNote}
						maxlength="80"
						placeholder="What changed in this version?"
						disabled={loading}
						class="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-purple-500/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
					/>

					<p class="mt-2 text-xs text-zinc-600">Shown in the note's version history.</p>
				</div>
			</div>

			<div
				class="flex items-center justify-between border-t border-white/8 bg-white/[0.015] px-6 py-4"
			>
				<p class="hidden text-xs text-zinc-600 sm:block">
					<span class="text-zinc-500">⌘ Enter</span>
					&nbsp;to save
				</p>

				<div class="flex w-full justify-end gap-2 sm:w-auto">
					<button
						type="button"
						onclick={close}
						disabled={loading}
						class="cursor-pointer rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Cancel
					</button>

					<button
						type="button"
						onclick={handleSave}
						disabled={!canSave}
						class="flex cursor-pointer items-center gap-2 rounded-xl bg-purple-400 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/10 transition hover:bg-purple-400 disabled:cursor-not-allowed disabled:opacity-40"
					>
						{#if loading}
							<span
								class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
							></span>

							Saving...
						{:else}
							<Save size="sm" />
							Save & Sync
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
