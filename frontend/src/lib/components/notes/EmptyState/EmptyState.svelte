<script>
	import { Note } from '@boxicons/svelte';
</script>

<div class="flex h-full flex-col items-center justify-center px-8 text-center">
	<div
		class="mb-6 flex h-18 w-18 items-center justify-center rounded-3xl border border-zinc-800 bg-[#181B22]"
	>
		<Note class="h-8 w-8 text-zinc-500" data-testid="note-icon" />
	</div>

	<h2 class="text-2xl font-semibold text-zinc-100">No notes yet</h2>

	<p class="mt-3 max-w-md text-sm leading-7 text-zinc-500">
		Create your first note and it will be stored directly inside this GitHub folder.
	</p>
</div>
