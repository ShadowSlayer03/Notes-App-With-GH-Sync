<script lang="ts">
	import {
		X,
		Copy,
		Check,
		Share,
		FacebookCircle,
		TwitterX,
		Linkedin,
		Gmail
	} from '@boxicons/svelte';

	let {
		open = $bindable(false),
		shareUrl = ''
	} = $props<{
		open: boolean;
		shareUrl: string;
	}>();

	let copied = $state(false);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(shareUrl);

			copied = true;

			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Could not copy share link:', err);
		}
	}

	function close() {
		open = false;
		copied = false;
	}

	function shareTo(platform: string) {
		const encodedUrl = encodeURIComponent(shareUrl);
		const encodedTitle = encodeURIComponent('Check out this note on Kairno');

		let url = '';

		switch (platform) {
			case 'x':
				url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
				break;

			case 'facebook':
				url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
				break;

			case 'linkedin':
				url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
				break;

			case 'email':
				url = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
				break;
		}

		if (!url) return;

		window.open(
			url,
			'_blank',
			'width=600,height=600,noopener,noreferrer'
		);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
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
		data-testid="share-note-dialog-backdrop"
	>
		<div
			class="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#111318] shadow-2xl shadow-black/50"
			role="dialog"
			aria-modal="true"
			aria-labelledby="share-note-title"
			data-testid="share-note-dialog"
		>
			<div class="flex items-start justify-between border-b border-zinc-800/80 px-6 py-5">
				<div>
					<div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
						<Share class="h-4 w-4 text-purple-400" />
					</div>

					<h2
						id="share-note-title"
						class="text-lg font-semibold tracking-tight text-zinc-100"
					>
						Share note
					</h2>

					<p class="mt-1 text-sm text-zinc-500">
						Anyone with this link can view this note.
					</p>
				</div>

				<button
					type="button"
					onclick={close}
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
					aria-label="Close"
				>
					<X class="h-4 w-4" />
				</button>
			</div>

			<div class="space-y-6 px-6 py-6">
				<div>
					<label
						for="share-link"
						class="mb-2 block text-xs font-medium text-zinc-400"
					>
						Share link
					</label>

					<div class="flex items-center gap-2">
						<div
							class="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3"
						>
							<p
								id="share-link"
								class="truncate text-sm text-zinc-300"
								title={shareUrl}
							>
								{shareUrl}
							</p>
						</div>

						<button
							type="button"
							onclick={copyLink}
							class="flex shrink-0 items-center gap-2 rounded-xl bg-purple-500 px-3.5 py-3 text-sm font-medium text-white transition hover:bg-purple-400"
						>
							{#if copied}
								<Check class="h-4 w-4" />
								Copied
							{:else}
								<Copy class="h-4 w-4" />
								Copy
							{/if}
						</button>
					</div>
				</div>

				<div>
					<p class="mb-3 text-xs font-medium text-zinc-400">
						Share via
					</p>

					<div class="grid grid-cols-4 gap-2">
						<button
							type="button"
							onclick={() => shareTo('x')}
							class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-2 py-3 text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-100"
						>
							<TwitterX class="h-5 w-5" />
							<span class="text-[11px]">X</span>
						</button>

						<button
							type="button"
							onclick={() => shareTo('facebook')}
							class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-2 py-3 text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-100"
						>
							<FacebookCircle class="h-5 w-5" />
							<span class="text-[11px]">Facebook</span>
						</button>

						<button
							type="button"
							onclick={() => shareTo('linkedin')}
							class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-2 py-3 text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-100"
						>
							<Linkedin class="h-5 w-5" />
							<span class="text-[11px]">LinkedIn</span>
						</button>

						<button
							type="button"
							onclick={() => shareTo('email')}
							class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-2 py-3 text-zinc-400 transition hover:bg-white/[0.05] hover:text-zinc-100"
						>
							<Gmail class="h-5 w-5" />
							<span class="text-[11px]">Email</span>
						</button>
					</div>
				</div>
			</div>

			<div
				class="border-t border-zinc-800/80 bg-[#0d0f13] px-6 py-4"
			>
				<p class="text-xs leading-5 text-zinc-600">
					Shared notes are read-only. Changes you make later won't affect
					this shared version.
				</p>
			</div>
		</div>
	</div>
{/if}