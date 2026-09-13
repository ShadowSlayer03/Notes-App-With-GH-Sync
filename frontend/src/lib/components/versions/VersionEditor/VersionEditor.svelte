<script lang="ts">
	import '@milkdown/crepe/theme/common/style.css';
	import '../../../components/notes/Editor/Editor.css';

	import { onDestroy } from 'svelte';
	import { Crepe } from '@milkdown/crepe';
	import type { NoteTheme } from '../../../../types/pages/notes.types';

	let root: HTMLElement | null = $state(null);
	let crepe: Crepe | null = $state(null);

	let {
		content,
		theme = 'default'
	}: {
		content: string;
		theme?: NoteTheme;
	} = $props();

	$effect(() => {
		if (!root || crepe) return;

		crepe = new Crepe({
			root,
			defaultValue: content || '\n'
		});

		crepe.setReadonly(true);

		crepe
			.create()
			.then(() => {
				console.log('Version editor created');
			})
			.catch((error) => {
				console.error('Failed to create version editor:', error);
			});
	});

	onDestroy(() => {
		crepe?.destroy();
		crepe = null;
	});
</script>

<div class="version-editor-root" data-theme={theme} bind:this={root}></div>

<style>
	.version-editor-root {
		min-height: 600px;
		width: 100%;
		overflow: auto;
	}

	.version-editor-root :global(.milkdown) {
		min-height: 600px;
	}
</style>