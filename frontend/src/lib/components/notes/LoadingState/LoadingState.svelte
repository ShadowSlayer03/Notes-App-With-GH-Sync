<script>
	import PageHeader from "$lib/components/PageHeader.svelte";

</script>
<div class="p-6 bg-[#0D0F12] h-full flex flex-col">
	<PageHeader />

	<div class="mt-6 mb-4">
		<div class="h-8 w-40 rounded-xl bg-zinc-800/60 animate-pulse"></div>
	</div>

	<div class="overflow-hidden rounded-2xl border border-zinc-800/50">
		<table class="w-full">
			<thead>
				<tr class="border-b border-zinc-800/40 text-xs text-zinc-600 uppercase">
					<th class="px-4 py-4 text-left">Title</th>
					<th class="px-4 py-4 text-left">Last edited</th>
					<th class="px-4 py-4 text-left">Updated by</th>
					<th></th>
				</tr>
			</thead>

			<tbody>
				{#each Array(8) as _}
					<tr class="border-b border-zinc-800/30">
						<td class="px-4 py-4">
							<div class="flex items-center gap-3">
								<div class="h-10 w-10 rounded-xl bg-zinc-800 animate-pulse"></div>

								<div class="flex flex-col gap-2">
									<div class="h-4 w-48 rounded bg-zinc-800 animate-pulse"></div>

									<div class="h-3 w-80 rounded bg-zinc-900 animate-pulse"></div>
								</div>
							</div>
						</td>

						<td>
							<div class="h-3 w-28 rounded bg-zinc-800 animate-pulse"></div>
						</td>

						<td>
							<div class="flex items-center gap-2">
								<div class="h-5 w-5 rounded-full bg-zinc-800 animate-pulse"></div>

								<div class="h-3 w-24 rounded bg-zinc-800 animate-pulse"></div>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
