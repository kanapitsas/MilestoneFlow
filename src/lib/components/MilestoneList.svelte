<script>
	import ColumnHeader from './ColumnHeader.svelte';
	let { parsedProjects = [], selectedProjectIndex = 0, onselectMilestone } = $props();
	let milestones = $derived(parsedProjects[selectedProjectIndex]?.milestones ?? []);
</script>

<div class="milestone-list">
	<ColumnHeader title="Milestones" />

	{#if milestones.length === 0}
		<p class="empty-state">No milestones available</p>
	{:else}
		<ul>
			{#each milestones as m, i}
				<li>
					<button
						onclick={() => onselectMilestone(i)}
						style="--progress: {m.tasks.length
							? m.tasks.filter((t) => t.done).length / m.tasks.length
							: 0}"
					>
						<div class="milestone-info">
							<span class="milestone-title">{m.title}</span>
							<span class="milestone-progress">
								{m.tasks.filter((t) => t.done).length}/{m.tasks.length}
							</span>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		border-bottom: 1px solid var(--border);
	}

	button {
		width: 100%;
		padding: var(--space-md);
		background: linear-gradient(
			to right,
			var(--completion-bg) calc(var(--progress) * 100%),
			transparent calc(var(--progress) * 100%)
		);
		border: none;
		cursor: pointer;
		transition: var(--transition);
		text-align: left;
	}

	button:hover {
		background-color: var(--surface);
	}

	.milestone-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.milestone-title {
		font-weight: 500;
		color: var(--text);
	}

	.milestone-progress {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.empty-state {
		color: var(--text-disabled);
		font-size: 0.875rem;
		padding: var(--space-md);
		text-align: center;
		margin: 0;
	}
</style>
