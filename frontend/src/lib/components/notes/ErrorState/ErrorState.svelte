<script lang="ts">
	import { Note } from '@boxicons/svelte';

	interface Props {
		message: string;
		refetch: () => void;
	}

	const { message, refetch }: Props = $props();
</script>

<div class="flex h-full flex-col items-center justify-center px-8 text-center">
	<div
		class="mb-6 flex h-18 w-18 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/8"
	>
		<Note class="h-8 w-8 text-red-400 opacity-80" />
	</div>

	<h2 class="text-2xl font-semibold text-zinc-100">Couldn't load your notes</h2>

	<p class="mt-3 max-w-md text-sm leading-7 text-zinc-500">
		{message}
	</p>

	<button
		onclick={refetch}
		class="mt-8 rounded-xl border border-zinc-700 bg-[#181B22] px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer"
	>
		Try Again
	</button>
</div>
