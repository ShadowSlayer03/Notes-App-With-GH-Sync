<script>
	import { PUBLIC_BACKEND_URI } from '$env/static/public';
	import AppLogo from '$lib/components/AppLogo.svelte';
	import GithubIcon from '$lib/components/auth/GithubIcon/GithubIcon.svelte';

	let isConnecting = $state(false);

	function handleGitHubLogin() {
		isConnecting = true;
		window.location.assign(`${PUBLIC_BACKEND_URI}/auth/github`);
	}
</script>

<div
	class="flex min-h-screen w-full bg-[#0d0f12] text-[#e2e8f0] font-sans antialiased selection:bg-zinc-700"
>
	<div
		class="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#161920] p-16 lg:flex border-r border-zinc-800/40"
	>
		<AppLogo />

		<div class="relative my-auto flex flex-col justify-center pt-12">
			<h1 class="max-w-md text-4xl font-bold tracking-tight text-zinc-100 leading-tight">
				Your notes.<br />Always with you.
			</h1>
			<p class="kanit-regular mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
				A GitHub-native second brain for developers. Write notes, save snippets, and keep everything
				permanently owned by you.
			</p>

			<div class="relative mt-24 h-80 w-full select-none">
				<span class="absolute top-0 left-12 text-zinc-700 font-light text-xs">+</span>
				<span class="absolute bottom-16 left-28 text-zinc-700 font-light text-xs">+</span>
				<span class="absolute top-12 right-36 text-zinc-700 font-light text-xs">+</span>

				<div
					class="absolute bottom-6 left-1/3 h-64 w-44 rotate-14 rounded-r-2xl rounded-l-md bg-zinc-200 shadow-2xl transition-transform duration-500 hover:rotate-10 border-l-8 border-zinc-300"
				>
					<div
						class="absolute top-0 right-1 h-full w-2 bg-linear-to-r from-zinc-300 to-zinc-400/40 border-r border-zinc-400/20"
					></div>
					<div class="absolute -bottom-6 right-10 h-8 w-3 bg-zinc-400/80 rounded-b"></div>
				</div>

				<div
					class="absolute bottom-10 left-1/4 h-64 w-44 -rotate-6 rounded-r-2xl rounded-l-md bg-[#22252a] p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] ring-1 ring-inset ring-white/10 transition-transform duration-500 hover:-rotate-2 border-l-8 border-zinc-900"
				>
					<div class="absolute top-0 right-8 h-full w-3.5 bg-zinc-100/95 shadow-md"></div>

					<div class="absolute top-0 right-0 h-full w-1 bg-zinc-800 rounded-r-2xl"></div>

					<div class="absolute bottom-6 left-5 flex flex-col gap-1.5 opacity-25">
						<div class="h-1 w-8 bg-white rounded-full"></div>
						<div class="h-1 w-12 bg-white rounded-full"></div>
						<div class="h-1 w-6 bg-white rounded-full"></div>
					</div>
				</div>

				<div
					class="absolute top-20 left-4 flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-[#1c1f26]/90 px-3 py-2 text-xs font-medium text-zinc-300 shadow-xl backdrop-blur-sm"
				>
					<GithubIcon class="h-3.5 w-3.5" />
					<span>Synced to Git</span>
				</div>

				<div
					class="absolute bottom-4 right-20 flex items-center gap-2 rounded-xl border border-zinc-700/50 bg-[#1c1f26]/90 px-3 py-2 text-xs font-medium text-zinc-300 shadow-xl backdrop-blur-sm"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="h-3.5 w-3.5 text-zinc-400"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
						/>
					</svg>
					<span>100% Owned</span>
				</div>
			</div>
		</div>

		<div class="text-xs text-zinc-600">v1.0 GitHub OAuth Vault Engine</div>
	</div>

	<div
		class="flex w-full flex-col justify-center px-6 py-12 sm:px-16 lg:w-1/2 xl:px-24 bg-[#0d0f12]"
	>
		<div class="mx-auto w-full max-w-sm space-y-8 text-center">
			<div class="space-y-2">
				<h2 class="text-2xl font-bold tracking-normal text-zinc-100">Welcome to Kairno</h2>
				<p class="text-xs text-zinc-500 max-w-xs mx-auto">
					Sign in with your GitHub account to access your remote repositories and sync your
					knowledge base.
				</p>
			</div>

			<div class="pt-2">
				<button
					type="button"
					onclick={handleGitHubLogin}
					disabled={isConnecting}
					class="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-[#161920] px-5 py-3.5 text-sm font-semibold text-zinc-100 transition-all duration-200 hover:bg-[#1c2029] hover:border-zinc-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none group cursor-pointer"
				>
					{#if isConnecting}
						<svg
							class="animate-spin h-5 w-5 text-zinc-400"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<span>Connecting to GitHub...</span>
					{:else}
						<GithubIcon class="h-5 w-5 text-zinc-300 group-hover:text-white transition-colors" />
						<span>Continue with GitHub</span>
					{/if}
				</button>
			</div>

			<p class="text-[11px] leading-relaxed text-zinc-600 max-w-70 mx-auto">
				By continuing, Kairno will automatically initialize an isolated workspace directory inside
				your repositories to safely store markdown assets.
			</p>
		</div>
	</div>
</div>
