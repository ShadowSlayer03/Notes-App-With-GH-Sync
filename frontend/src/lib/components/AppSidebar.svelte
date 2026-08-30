<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		Home,
		Note,
		Trash,
		DotsHorizontalRounded,
		ArrowOutRightSquareHalf,
		Lock
	} from '@boxicons/svelte';

	import AppLogo from './AppLogo.svelte';
	import { sidebarIconMap } from '$lib/constants/sidebar';
	import { createMutation } from '@tanstack/svelte-query';
	import queryClient from '$lib/util/queryClient';
	import { api } from '$lib/util/api';
	import type { Folder } from '../../types/pages/folder.types';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';

	let showDropdown = $state(false);

	let { user, folders } = $props();

	const sidebarItems = $derived(
		folders.map((folder: Folder) => ({
			...folder,
			href: `/folders/${folder.id}`
		}))
	);

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	function isRouteActive(href: string): boolean {
		if (href === '/') {
			return page.url.pathname === '/';
		}

		return page.url.pathname.startsWith(href);
	}

	const logoutMutation = createMutation(() => ({
		mutationFn: () =>
			api<void>(`${PUBLIC_BACKEND_URI}/api/user/logout`, {
				method: 'POST',
				credentials: 'include'
			}),
		onSuccess: async () => {
			showDropdown = false;

			await queryClient.invalidateQueries();

			await goto('/auth');
		},
		onError: (err) => {
			console.error('Logout failed:', err);
		}
	}));
</script>

<aside
	class="flex h-screen w-62 shrink-0 flex-col justify-between border-r border-zinc-800/40 bg-[#161920] p-4 font-sans text-zinc-400 select-none antialiased"
>
	<div class="space-y-7">
		<AppLogo textSize={8} />

		<nav class="space-y-7">
			<div>
				<p class="mb-2 px-3 text-[10px] font-semibold tracking-wider text-zinc-600 uppercase">
					Workspace
				</p>

				<ul class="space-y-1">
					<li>
						<a
							href="/home"
							class="group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200
								{isRouteActive('/home')
								? 'border-zinc-700/30 bg-linear-to-b from-zinc-800/40 to-zinc-800/10 font-semibold text-zinc-100 shadow-sm shadow-black/20'
								: 'border-transparent hover:bg-white/3 hover:text-zinc-200'}"
						>
							<Home
								class="h-4 w-4 transition-colors
									{isRouteActive('/home') ? 'text-purple-400' : 'text-current group-hover:text-zinc-300'}"
							/>

							<span>Home</span>
						</a>
					</li>

					<li>
						<a
							href="/folders/all-notes"
							class="group flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200
								{isRouteActive('/folders/all-notes')
								? 'border-zinc-700/30 bg-linear-to-b from-zinc-800/40 to-zinc-800/10 font-semibold text-zinc-100 shadow-sm shadow-black/20'
								: 'border-transparent hover:bg-white/3 hover:text-zinc-200'}"
						>
							<Note
								class="h-4 w-4 transition-colors
									{isRouteActive('/folders/all-notes')
									? 'text-purple-400'
									: 'text-current group-hover:text-zinc-300'}"
							/>

							<span>All Notes</span>
						</a>
					</li>
				</ul>
			</div>

			<div>
				<div class="mb-2 flex items-center justify-between px-3">
					<p class="text-[10px] font-semibold tracking-wider text-zinc-600 uppercase">
						Your Folders
					</p>
				</div>

				{#if sidebarItems.length > 0}
					<ul class="space-y-1">
						{#each sidebarItems as item}
							{@const IconComponent = sidebarIconMap[item.icon || 'folder']}

							<li>
								<a
									href={item.href}
									class="group flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200
										{isRouteActive(item.href)
										? 'border-zinc-700/30 bg-linear-to-b from-zinc-800/40 to-zinc-800/10 font-semibold text-zinc-100 shadow-sm shadow-black/20'
										: 'border-transparent hover:bg-white/3 hover:text-zinc-200'}"
								>
									<div class="flex min-w-0 items-center gap-3">
										{#if IconComponent}
											<IconComponent
												class="h-4 w-4 shrink-0 transition-colors
													{isRouteActive(item.href) ? 'text-purple-400' : 'text-current group-hover:text-zinc-300'}"
											/>
										{/if}

										<span class="truncate">{item.title}</span>
									</div>

									{#if item.isLocked}
										<Lock
											class="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-500"
										/>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="px-3 py-2">
						<div class="flex items-center gap-2 text-zinc-600">
							<div class="h-1.5 w-1.5 rounded-full bg-purple-700"></div>
							<span class="text-sm">No folders yet</span>
						</div>
					</div>
				{/if}
			</div>

			<div class="border-t border-zinc-800/50 pt-3">
				<ul>
					<li>
						<a
							href="/folders/trash"
							class="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-white/3 hover:text-zinc-200
								{isRouteActive('/folders/trash')
								? 'border-zinc-700/30 bg-linear-to-b from-zinc-800/40 to-zinc-800/10 font-semibold text-zinc-100'
								: ''}"
						>
							<Trash
								class="h-4 w-4 transition-colors
									{isRouteActive('/folders/trash') ? 'text-purple-400' : 'text-current group-hover:text-zinc-300'}"
							/>

							<span>Trash</span>
						</a>
					</li>
				</ul>
			</div>
		</nav>
	</div>

	<div class="relative space-y-4">
		{#if showDropdown}
			<div
				class="absolute right-0 bottom-14 left-0 z-50 animate-in rounded-xl border border-zinc-800/90 bg-zinc-900/95 p-2 shadow-2xl slide-in-from-bottom-2 duration-150"
			>
				<button
					onclick={() => logoutMutation.mutate()}
					disabled={logoutMutation.isPending}
					class="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<ArrowOutRightSquareHalf class="h-4 w-4" />

					<span>
						{logoutMutation.isPending ? 'Logging out...' : 'Log out'}
					</span>
				</button>
			</div>
		{/if}

		<div
			class="flex items-center justify-between rounded-2xl border border-zinc-800/90 bg-zinc-900/40 p-3 shadow-lg backdrop-blur-md"
		>
			<div class="flex min-w-0 items-center gap-3">
				<img
					src={user.avatarUrl}
					alt={user.name}
					class="h-9 w-9 shrink-0 rounded-xl object-cover shadow-inner ring-1 ring-white/10"
				/>

				<div class="flex min-w-0 flex-col">
					<span class="truncate text-xs font-semibold text-zinc-100">
						{user.name}
					</span>

					<span
						class="mt-0.5 w-max rounded-md border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-purple-400 uppercase"
					>
						{user.ghUserName}
					</span>
				</div>
			</div>

			<button
				onclick={toggleDropdown}
				class="flex cursor-pointer items-center justify-center rounded-lg p-1.5 transition-colors
					{showDropdown
					? 'bg-zinc-800 text-zinc-100'
					: 'text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200'}"
				aria-label="Account options"
				aria-expanded={showDropdown}
			>
				<DotsHorizontalRounded class="h-4 w-4" />
			</button>
		</div>
	</div>
</aside>
