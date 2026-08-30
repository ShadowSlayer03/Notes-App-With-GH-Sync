<script lang="ts">
	import { RefreshCcw, CloudRainWindAlt, HomeAlt2 } from '@boxicons/svelte';
	import { goto } from '$app/navigation';

	let retrying = $state(false);

	function retry() {
		retrying = true;

		setTimeout(() => {
			location.reload();
		}, 300);
	}

	function home() {
		goto('/home');
	}
</script>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090A0F] px-6 text-zinc-100"
>
	<!-- Background -->
	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_60%)]"
	></div>

	<div
		class="absolute left-1/2 top-[-14rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-white/[0.025] blur-3xl"
	></div>

	<div
		class="relative w-full max-w-xl rounded-[30px] border border-zinc-800/70 bg-[#111318]/80 p-10 shadow-2xl backdrop-blur-xl"
	>
		<div class="flex flex-col items-center text-center">
			<div
				class="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-zinc-700 bg-[#181B22]"
			>
				<CloudRainWindAlt class="h-12 w-12 text-zinc-300" />
			</div>

			<h1 class="text-3xl font-semibold tracking-tight">Workspace unavailable</h1>

			<p class="mt-5 max-w-md text-sm leading-7 text-zinc-500">
				Kairno couldn't establish a secure connection to your workspace.<br /> Don't worry your notes are safe.
			</p>
		</div>

		<div class="mt-10 rounded-2xl border border-zinc-800 bg-[#0E1015] p-5">
			<div class="mb-4 flex items-center gap-2">
				<div class="h-2 w-2 rounded-full bg-amber-400"></div>

				<span class="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
					Connection Status
				</span>
			</div>

			<ul class="space-y-3 text-sm text-zinc-400">
				<li>• Unable to reach the Kairno backend.</li>
				<li>• Your GitHub data remains safe.</li>
				<li>• Retry once the server is available.</li>
			</ul>
		</div>

		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<button
				onclick={retry}
				disabled={retrying}
				class="flex min-w-[150px] items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-[#090A0F] transition hover:bg-zinc-200 disabled:opacity-60 cursor-pointer"
			>
				<RefreshCcw class={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />

				{retrying ? 'Retrying…' : 'Retry'}
			</button>

			<button
				onclick={home}
				class="flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#181B22] px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-[#1C2028] cursor-pointer"
			>
				<HomeAlt2 class="h-4 w-4" />
				Workspace
			</button>
		</div>

		<div
			class="mt-10 border-t border-zinc-800 pt-6 text-center text-xs tracking-wide text-zinc-600"
		>
			If refresh doesn't work, please let us know at dev@kairno.com
		</div>
	</div>
</div>
