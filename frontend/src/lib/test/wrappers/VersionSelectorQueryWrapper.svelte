<script lang="ts">
	import {
		QueryClient,
		QueryClientProvider
	} from '@tanstack/svelte-query';
	import type { NoteVersion } from '../../../types/pages/versions.types';
	import VersionSelector from '$lib/components/versions/VersionSelector/VersionSelector.svelte';

	let {
		noteId,
		folderId,
		selectedSha = null,
		label = 'Select version',
		disabled = false,
		onVersionChange = () => {},
		onContentChange = undefined
	}: {
		noteId: string;
		folderId: string;
		selectedSha?: string | null;
		label?: string;
		disabled?: boolean;
		onVersionChange?: (version: NoteVersion) => void;
		onContentChange?: (content: string, isLatest: boolean) => void;
	} = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false
			},
			mutations: {
				retry: false
			}
		}
	});
</script>

<QueryClientProvider client={queryClient}>
	<VersionSelector
		{noteId}
		{folderId}
		{selectedSha}
		{label}
		{disabled}
		{onVersionChange}
		{onContentChange}
	/>
</QueryClientProvider>