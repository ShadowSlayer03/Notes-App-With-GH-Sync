<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import RecentNotes from '$lib/components/home/RecentNotes/RecentNotes.svelte';

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
	<RecentNotes />
</QueryClientProvider>