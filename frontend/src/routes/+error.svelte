<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowBigLeftLine, HomeAlt2, SearchAlt } from '@boxicons/svelte';

	function goHome() {
		goto('/home');
	}

	function goBack() {
		history.back();
	}
</script>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090A0F] px-6 text-zinc-100"
>
	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_60%)]"
	></div>

	<div
		class="absolute -top-32 left-1/2 h-128 w-128 -translate-x-1/2 rounded-full bg-white/[0.02] blur-3xl"
	></div>

	<div
		class="relative flex w-full max-w-lg flex-col items-center rounded-3xl border border-zinc-800/70 bg-[#111318]/80 px-10 py-12 text-center shadow-2xl backdrop-blur-xl"
	>
		<div
			class="mb-8 flex h-24 w-24 p-2 items-center justify-center rounded-3xl border border-zinc-700 bg-[#181B22]"
		>
			<span class="text-4xl font-bold tracking-tight text-zinc-300">
				404
			</span>
		</div>

		<h1 class="text-3xl font-semibold tracking-tight">
			This path doesn't exist.
		</h1>

		<p class="mt-5 max-w-md text-sm leading-7 text-zinc-500">
			The page you're looking for isn't part of your current workspace.
			It may have been moved, renamed, or never existed in this version
			of your knowledge graph.
		</p>

		<div
			class="mt-10 w-full rounded-2xl border border-zinc-800 bg-[#0E1015] p-5 text-left"
		>
			<div class="mb-3 flex items-center gap-2">
				<div class="h-2 w-2 rounded-full bg-zinc-500"></div>
				<span class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
					Kairno
				</span>
			</div>

			<p class="text-sm leading-7 text-zinc-400">
				Knowledge should never disappear.
				If this page represented a note, you can recover it through its
				version history or navigate back to your workspace.
			</p>
		</div>

		<div class="mt-10 flex flex-wrap justify-center gap-3">
			<button
				onclick={goBack}
				class="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 bg-[#181B22] px-5 py-3 text-sm font-medium text-zinc-200 transition-all hover:border-zinc-600 hover:bg-[#1C2028]"
			>
				<ArrowBigLeftLine class="h-4 w-4" />
				Go Back
			</button>

			<button
				onclick={goHome}
				class="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 bg-white px-5 py-3 text-sm font-semibold text-[#090A0F] transition-all hover:bg-zinc-200"
			>
				<HomeAlt2 class="h-4 w-4" />
				<span>Workspace</span>
			</button>
		</div>
	</div>
</div>