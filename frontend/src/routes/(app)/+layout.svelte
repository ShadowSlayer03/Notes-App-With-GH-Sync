<script lang="ts">
	import AppLogo from '$lib/components/AppLogo.svelte';
	import AppSidebar from '$lib/components/AppSidebar.svelte';
	import { Menu, X } from '@boxicons/svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import type { AuthenticatedUser } from '../../types/pages/main.types';
	import { api, NetworkError, UnauthorizedError } from '$lib/util/api';
	import { goto } from '$app/navigation';
	import type { Folder } from '../../types/pages/folder.types';
	import BackendOffline from '$lib/components/BackendOffline.svelte';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';

	let { children } = $props();

	let isMobileOpen = $state(false);
	let isBackendDown = $state(false);

	function toggleMobileSidebar() {
		isMobileOpen = !isMobileOpen;
	}

	function closeMobileSidebar() {
		isMobileOpen = false;
	}

	function extractGHUsername(profileUrl: string | null) {
		if (!profileUrl) return `User${userQuery.data?.githubId ?? ''}`;

		return profileUrl.split('/').pop() ?? 'User';
	}

	const userQuery = createQuery(() => ({
		queryKey: ['get-user'],
		queryFn: () =>
			api<AuthenticatedUser>(`${PUBLIC_BACKEND_URI}/api/user/me`, {
				method: 'GET',
				credentials: 'include'
			}),
		staleTime: 1000 * 60 * 10,
		retry: false
	}));

	$effect(() => {
		if (userQuery.isError && userQuery.error instanceof UnauthorizedError) {
			goto('/auth', { replaceState: true });
		}
		if (userQuery.error instanceof NetworkError) {
			isBackendDown = true;
		}
	});

	const userDetails = $derived({
		name: userQuery.data?.name,
		ghUserName: extractGHUsername(userQuery.data?.profileUrl ?? null),
		avatarUrl: userQuery.data?.avatarUrl
	});

	const getAllFoldersQuery = createQuery(() => ({
		queryKey: ['get-folders'],
		queryFn: () =>
			api<Folder[]>(`${PUBLIC_BACKEND_URI}/api/folders`, {
				method: 'GET',
				credentials: 'include'
			}),
		staleTime: 1000 * 60 * 20,
		retry: false
	}));

	const isLoading = $derived(userQuery.isPending || getAllFoldersQuery.isPending);

	const folders = $derived(getAllFoldersQuery.data ?? []);
</script>

{#if isBackendDown}
	<BackendOffline />
{:else if isLoading}
	<div class="flex h-screen w-screen items-center justify-center bg-[#090a0f] text-zinc-300">
		<div class="flex flex-col items-center gap-5">
			<div
				class="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-400"
			></div>

			<p class="text-sm text-zinc-500">Fetching details...</p>
		</div>
	</div>
{:else if userQuery.isSuccess && getAllFoldersQuery.isSuccess}
	<div
		class="flex h-screen w-screen overflow-hidden bg-[#090a0f] text-zinc-100 font-sans antialiased selection:bg-purple-500/30 selection:text-purple-200"
	>
		<div class="hidden md:block h-full shrink-0">
			<AppSidebar user={userDetails} {folders} />
		</div>

		{#if isMobileOpen}
			<div
				class="fixed inset-0 z-40 bg-[#090a0f] backdrop-blur-sm transition-opacity duration-300 md:hidden"
				onclick={closeMobileSidebar}
			></div>
		{/if}

		<div
			class="fixed inset-y-0 left-0 z-50 transform w-64 bg-[#0d0f12] transition-transform duration-300 ease-in-out md:hidden
			{isMobileOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'}"
		>
			<button
				onclick={closeMobileSidebar}
				class="absolute right-4 top-4 rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-800/60 hover:text-zinc-200 cursor-pointer"
				aria-label="Close menu"
			>
				<X class="h-5 w-5" />
			</button>

			<AppSidebar user={userDetails} {folders} />
		</div>

		<div class="flex flex-1 flex-col min-w-0 h-full relative">
			<header
				class="flex h-16 w-full items-center justify-between border-b border-zinc-800/40 bg-[#0d0f12] px-4 md:hidden shrink-0"
			>
				<AppLogo textSize={4} iconHeight={40} iconWidth={42} />

				<button
					onclick={toggleMobileSidebar}
					class="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-100 cursor-pointer"
					aria-label="Open menu"
				>
					<Menu class="h-5 w-5" />
				</button>
			</header>

			<main class="flex-1 overflow-x-hidden overflow-y-auto workspace-scrollbar bg-[#090a0f]">
				{@render children()}
			</main>
		</div>
	</div>
{/if}

<style>
	:global(.workspace-scrollbar::-webkit-scrollbar) {
		width: 6px;
		height: 6px;
	}
	:global(.workspace-scrollbar::-webkit-scrollbar-track) {
		background: #090a0f;
	}
	:global(.workspace-scrollbar::-webkit-scrollbar-thumb) {
		background: #1f222e;
		border-radius: 9999px;
	}
	:global(.workspace-scrollbar::-webkit-scrollbar-thumb:hover) {
		background: #2e3245;
	}
</style>
