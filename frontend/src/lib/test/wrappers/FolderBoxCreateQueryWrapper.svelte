<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	import FolderBoxCreate from '$lib/components/home/FolderBoxCreate/FolderBoxCreate.svelte';

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
	<FolderBoxCreate />
</QueryClientProvider>