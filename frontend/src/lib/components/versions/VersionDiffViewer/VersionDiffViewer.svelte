<script lang="ts">
	import { DiffMatchPatch, DiffOp, type Diff } from 'diff-match-patch-ts';

	type DiffRow = {
		oldLine: number | null;
		newLine: number | null;
		oldText: string | null;
		newText: string | null;
		type: 'equal' | 'modify' | 'delete' | 'insert';
	};

	let {
		originalText = '',
		modifiedText = '',
		originalLabel = 'Older version',
		modifiedLabel = 'Newer version'
	}: {
		originalText?: string;
		modifiedText?: string;
		originalLabel?: string;
		modifiedLabel?: string;
	} = $props();

	const dmp = new DiffMatchPatch();
	dmp.Diff_Timeout = 1;

	const oldLines = $derived(splitLines(originalText));
	const newLines = $derived(splitLines(modifiedText));

	const diffs = $derived.by<Diff[]>(() => {
		const result = dmp.diff_main(originalText, modifiedText);
		dmp.diff_cleanupSemantic(result);
		return result;
	});

	const rows = $derived(buildRows(diffs));

	const additions = $derived(
		rows.filter((row) => row.type === 'insert' || row.type === 'modify').length
	);

	const deletions = $derived(
		rows.filter((row) => row.type === 'delete' || row.type === 'modify').length
	);

	function splitLines(text: string): string[] {
		if (!text) return [];

		return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
	}

	function buildRows(result: Diff[]): DiffRow[] {
		const resultRows: DiffRow[] = [];

		let oldLineNumber = 1;
		let newLineNumber = 1;

		for (const [operation, text] of result) {
			const segments = splitLines(text);

		/*
		 * diff-match-patch operations:
		 *
		 *  DiffOp.Equal  (0)  = equal
		 *  DiffOp.Delete (-1) = delete
		 *  DiffOp.Insert (1)  = insert
		 */

		if (operation === DiffOp.Equal) {
				for (const line of segments) {
					resultRows.push({
						oldLine: oldLineNumber++,
						newLine: newLineNumber++,
						oldText: line,
						newText: line,
						type: 'equal'
					});
				}

				continue;
			}

			if (operation === DiffOp.Delete) {
				for (const line of segments) {
					resultRows.push({
						oldLine: oldLineNumber++,
						newLine: null,
						oldText: line,
						newText: null,
						type: 'delete'
					});
				}

				continue;
			}

			if (operation === DiffOp.Insert) {
				for (const line of segments) {
					resultRows.push({
						oldLine: null,
						newLine: newLineNumber++,
						oldText: null,
						newText: line,
						type: 'insert'
					});
				}
			}
		}

		/*
		 * Turn adjacent delete + insert rows into a single
		 * modification row so changed lines remain aligned.
		 */
		const aligned: DiffRow[] = [];

		for (let i = 0; i < resultRows.length; i++) {
			const current = resultRows[i];
			const next = resultRows[i + 1];

			if (current?.type === 'delete' && next?.type === 'insert') {
				aligned.push({
					oldLine: current.oldLine,
					newLine: next.newLine,
					oldText: current.oldText,
					newText: next.newText,
					type: 'modify'
				});

				i++;
				continue;
			}

			aligned.push(current);
		}

		return aligned;
	}

	function hasText(text: string | null): boolean {
		return text !== null && text.length > 0;
	}
</script>

<div class="diff-viewer">
	<header class="diff-toolbar">
		<div class="diff-summary">
			<span class="change-count additions">
				+{additions}
			</span>

			<span class="change-count deletions">
				−{deletions}
			</span>
		</div>
	</header>

	<div class="diff-header">
		<div class="diff-header-side">
			<div class="header-title">
				<span class="status-dot old-dot"></span>
				<span>{originalLabel}</span>
			</div>

			<span class="line-count">
				{oldLines.length} lines
			</span>
		</div>

		<div class="diff-header-side">
			<div class="header-title">
				<span class="status-dot new-dot"></span>
				<span>{modifiedLabel}</span>
			</div>

			<span class="line-count">
				{newLines.length} lines
			</span>
		</div>
	</div>

	<div class="diff-body">
		{#if rows.length === 0}
			<div class="empty-diff">No content to compare.</div>
		{:else}
			{#each rows as row}
				<div
					class="diff-row"
					class:row-equal={row.type === 'equal'}
					class:row-modify={row.type === 'modify'}
					class:row-delete={row.type === 'delete'}
					class:row-insert={row.type === 'insert'}
				>
					<div class="diff-side old-side">
						<div class="line-number">
							{row.oldLine ?? ''}
						</div>

						<div class="change-indicator">
							{#if row.type === 'delete' || row.type === 'modify'}
								−
							{/if}
						</div>

						<div class="code-container">
							<pre class:empty-line={!hasText(row.oldText)}>{row.oldText ?? ''}</pre>
						</div>
					</div>

					<div class="diff-side new-side">
						<div class="line-number">
							{row.newLine ?? ''}
						</div>

						<div class="change-indicator">
							{#if row.type === 'insert' || row.type === 'modify'}
								+
							{/if}
						</div>

						<div class="code-container">
							<pre class:empty-line={!hasText(row.newText)}>{row.newText ?? ''}</pre>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.diff-viewer {
		width: 100%;
		max-width: 100%;
		overflow: hidden;

		border: 1px solid #30363d;
		border-radius: 10px;

		background: #0d1117;
		color: #c9d1d9;

		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;

		box-sizing: border-box;
	}

	.diff-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;

		min-height: 42px;
		padding: 0 14px;

		border-bottom: 1px solid #21262d;

		background: #161b22;

		font-size: 12px;
	}

	.diff-summary {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.change-count {
		font-weight: 600;
		font-size: 12px;
	}

	.additions {
		color: #3fb950;
	}

	.deletions {
		color: #f85149;
	}

	.diff-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

		border-bottom: 1px solid #30363d;

		background: #161b22;
	}

	.diff-header-side {
		display: flex;
		align-items: center;
		justify-content: space-between;

		min-width: 0;

		height: 38px;
		padding: 0 12px;

		box-sizing: border-box;
	}

	.diff-header-side + .diff-header-side {
		border-left: 1px solid #30363d;
	}

	.header-title {
		display: flex;
		align-items: center;
		gap: 8px;

		min-width: 0;

		color: #e6edf3;

		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;

		font-size: 12px;
		font-weight: 600;
	}

	.status-dot {
		width: 7px;
		height: 7px;
		flex: 0 0 7px;

		border-radius: 50%;
	}

	.old-dot {
		background: #f85149;
	}

	.new-dot {
		background: #3fb950;
	}

	.line-count {
		flex: 0 0 auto;

		color: #8b949e;

		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;

		font-size: 10px;
	}

	.diff-body {
		width: 100%;
		max-width: 100%;

		overflow-x: hidden;
		overflow-y: auto;

		background: #0d1117;
	}

	.diff-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

		width: 100%;
		max-width: 100%;

		min-height: 23px;

		box-sizing: border-box;
	}

	.diff-side {
		display: grid;

		grid-template-columns: 52px 22px minmax(0, 1fr);

		min-width: 0;
		min-height: 23px;

		box-sizing: border-box;

		line-height: 23px;
	}

	.diff-side + .diff-side {
		border-left: 1px solid #30363d;
	}

	.line-number {
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;

		padding: 0 9px;

		min-width: 0;

		box-sizing: border-box;

		color: #6e7681;

		background: #0d1117;

		border-right: 1px solid #21262d;

		font-size: 11px;
		line-height: 23px;

		user-select: none;
	}

	.change-indicator {
		width: 22px;

		text-align: center;

		font-size: 12px;
		font-weight: 700;

		user-select: none;
	}

	.row-equal .change-indicator {
		color: transparent;
	}

	.row-delete .old-side .change-indicator,
	.row-modify .old-side .change-indicator {
		color: #f85149;
	}

	.row-insert .new-side .change-indicator,
	.row-modify .new-side .change-indicator {
		color: #3fb950;
	}

	.code-container {
		min-width: 0;
		width: 100%;

		overflow-x: auto;
		overflow-y: hidden;

		scrollbar-width: thin;
		scrollbar-color: #30363d transparent;
	}

	.code-container::-webkit-scrollbar {
		height: 6px;
	}

	.code-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.code-container::-webkit-scrollbar-thumb {
		background: #30363d;
		border-radius: 999px;
	}

	pre {
		display: block;

		width: max-content;
		min-width: 100%;

		margin: 0;
		padding: 0 12px;

		box-sizing: border-box;

		white-space: pre;

		color: #c9d1d9;

		font-family:
			ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
			monospace;

		font-size: 12px;
		line-height: 23px;

		tab-size: 4;
	}

	.empty-line {
		min-height: 23px;
	}

	.row-equal {
		background: #0d1117;
	}

	.row-equal:hover {
		background: #161b22;
	}

	.row-delete .old-side {
		background: rgba(248, 81, 73, 0.14);
	}

	.row-delete .old-side .line-number {
		background: rgba(248, 81, 73, 0.18);
		color: #f85149;
	}

	.row-delete .new-side {
		background: rgba(248, 81, 73, 0.025);
	}

	.row-insert .old-side {
		background: rgba(46, 160, 67, 0.025);
	}

	.row-insert .new-side {
		background: rgba(46, 160, 67, 0.14);
	}

	.row-insert .new-side .line-number {
		background: rgba(46, 160, 67, 0.18);
		color: #3fb950;
	}

	.row-modify .old-side {
		background: rgba(248, 81, 73, 0.14);
	}

	.row-modify .old-side .line-number {
		background: rgba(248, 81, 73, 0.18);
		color: #f85149;
	}

	.row-modify .new-side {
		background: rgba(46, 160, 67, 0.14);
	}

	.row-modify .new-side .line-number {
		background: rgba(46, 160, 67, 0.18);
		color: #3fb950;
	}

	.empty-diff {
		display: flex;
		align-items: center;
		justify-content: center;

		min-height: 160px;

		color: #8b949e;

		font-family:
			Inter,
			ui-sans-serif,
			system-ui,
			-apple-system,
			BlinkMacSystemFont,
			'Segoe UI',
			sans-serif;

		font-size: 13px;
	}

	@media (max-width: 800px) {
		.diff-side {
			grid-template-columns: 42px 20px minmax(0, 1fr);
		}

		.line-number {
			padding: 0 6px;
			font-size: 10px;
		}

		.change-indicator {
			width: 20px;
		}

		pre {
			padding: 0 8px;
			font-size: 11px;
		}

		.diff-header-side {
			padding: 0 8px;
		}

		.line-count {
			display: none;
		}
	}
</style>
