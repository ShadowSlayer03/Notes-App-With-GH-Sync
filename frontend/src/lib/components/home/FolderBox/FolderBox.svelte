<script lang="ts">
	import { iconMap, themeMap } from '$lib/constants/folders';

	import { Folder as FolderIcon, Lock} from '@boxicons/svelte';

	import type { Folder } from '../../../../types/pages/folder.types';
	import { formatLastEdited, replaceSpacesWithDashes } from '$lib/util/folderUtils';

	const {
		title = '',
		noteCount = 0,
		icon = 'folder',
		theme = 'paper',
		isLocked = false,
		createdAt='',
		updatedAt=''
	}: Folder = $props();

	const Icon = $derived(iconMap[icon] ?? FolderIcon);
	const folderTheme = $derived(themeMap[theme]);
</script>

<div class="flex w-[200px] shrink-0 flex-col gap-3 group cursor-pointer">
	<a
		href={`/folders/${replaceSpacesWithDashes(title)}`}
		class="relative flex h-[190px] w-full flex-col justify-between rounded-2xl p-4 transition-transform duration-300 group-hover:-translate-y-1 select-none
		{folderTheme.bg}
		{folderTheme.text}
		{folderTheme.border}
		{folderTheme.shadow}"
	>
		<div
			class="absolute left-0 top-0 bottom-0 w-2.5 rounded-l-2xl pointer-events-none {folderTheme.spine}"
		></div>

		<div
			class="absolute right-4 top-0 bottom-[-6px] z-10 w-[14px] rounded-b-sm shadow-[1px_2px_4px_rgba(0,0,0,0.2)] {folderTheme.bookmark}"
		></div>

		<div class="flex justify-between items-start">
			<div class="mt-0.5 flex gap-0.5 opacity-60">
				<div class="h-[3px] w-[3px] rounded-full {folderTheme.dots}"></div>
				<div class="h-[3px] w-[3px] rounded-full {folderTheme.dots}"></div>
				<div class="h-[3px] w-[3px] rounded-full {folderTheme.dots}"></div>
			</div>
		</div>

		<div class="flex items-center justify-center pb-2">
			<Icon class={`h-6 w-6 ${folderTheme.icon}`} />
		</div>

		<div class="z-20">
			<span class="text-[11px] font-medium tracking-tight {folderTheme.noteCount}">
				{noteCount} {noteCount === 1 ? 'Note' : 'Notes'}
			</span>
		</div>
	</a>

	<div class="space-y-0.5 px-0.5">
		<div class="flex items-center gap-1.5">
			<span class="text-sm font-medium text-zinc-200 transition-colors group-hover:text-white">
				{title}
			</span>

			{#if isLocked}
				<Lock class="h-3 w-3 text-zinc-500" />
			{/if}
		</div>

		<p class="truncate text-xs text-zinc-500">
			{formatLastEdited(updatedAt)}
		</p>
	</div>
</div>