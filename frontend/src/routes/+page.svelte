<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { goto } from '$app/navigation';
	import { XCircle } from '@boxicons/svelte';

	import type { AuthenticatedUser } from '../types/pages/main.types';
	import { api, UnauthorizedError } from '$lib/util/api';
	import { PUBLIC_BACKEND_URI } from '$env/static/public';

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

	let status = $state('Verifying GitHub account...');
	let redirected = $state(false);

	$effect(() => {
		if (redirected) return;

		if (userQuery.error instanceof UnauthorizedError) {
			redirected = true;

			setTimeout(() => {
				goto('/auth');
			}, 1000);

			return;
		}

		if (!userQuery.isSuccess) return;

		redirected = true;

		status = 'Creating secure session...';

		setTimeout(() => {
			status = 'Preparing your workspace...';
		}, 700);

		setTimeout(() => {
			goto('/home');
		}, 2500);
	});
</script>

<div
	class="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090A0F] text-zinc-100"
>
	<div
		class="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_55%)]"
	></div>

	<div
		class="relative flex w-full max-w-md flex-col items-center rounded-3xl border border-zinc-800/70 bg-[#111318]/80 px-10 py-12 shadow-2xl backdrop-blur-xl"
	>
		{#if userQuery.isPending}
			<div
				class="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700 bg-[#181B22]"
			>
				<div
					class="h-7 w-7 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-400"
				></div>
			</div>
		{:else if userQuery.isError}
			<div
				class="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/8"
			>
				<XCircle class="h-9 w-9 text-red-400" />
			</div>
		{/if}

		{#if userQuery.isPending}
			<h1 class="text-2xl font-semibold tracking-tight">Authenticating</h1>

			<p class="mt-3 text-center text-sm leading-relaxed text-zinc-500">
				{status}
			</p>
		{:else if userQuery.isError}
			<h1 class="text-2xl font-semibold text-red-400">Authentication Failed</h1>

			<p class="mt-3 text-center text-sm text-zinc-500">
				{userQuery.error.message}
			</p>
		{:else if userQuery.data}
			<img
				src={userQuery.data.avatarUrl ?? ''}
				alt="Avatar"
				class="mb-5 h-20 w-20 rounded-full border border-zinc-700"
			/>

			<h1 class="text-2xl font-semibold tracking-tight">Welcome back,</h1>

			<h2 class="mt-1 text-xl text-zinc-200">
				{userQuery.data.name ?? 'Github User'}
			</h2>

			<p class="mt-4 text-center text-sm text-zinc-500">Your GitHub identity has been verified.</p>

			<div class="mt-8 flex items-center gap-3 text-sm text-zinc-400">
				<div class="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>

				<span>Redirecting to your workspace…</span>
			</div>
		{/if}
	</div>
</div>
