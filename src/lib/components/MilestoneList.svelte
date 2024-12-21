<script>
	import ColumnHeader from './ColumnHeader.svelte';
	let {
		parsedProjects = [],
		selectedProjectIndex = 0,
		selectedMilestoneIndex = 0,
		onselectMilestone
	} = $props();
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
						class:selected={i === selectedMilestoneIndex}
						onclick={() => onselectMilestone(i)}
						style="--progress: {m.tasks.length
							? m.tasks.filter((t) => t.done).length / m.tasks.length
							: 0}"
					>
						<div class="milestone-info">
							<span class="milestone-title-wrapper">
								<span class="milestone-title">{m.title}</span>
							</span>
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
		background: linear-gradient(
			to right,
			var(--completion-bg) calc(var(--progress) * 100%),
			var(--surface) calc(var(--progress) * 100%)
		);
	}

	button.selected {
		border-left: 3px solid var(--accent);
		padding-left: calc(var(--space-md) - 3px); /* Compensate for border */
	}

	button.selected:hover {
		background: linear-gradient(
			to right,
			var(--completion-bg) calc(var(--progress) * 100%),
			var(--surface) calc(var(--progress) * 100%)
		);
	}

	button.selected .milestone-title {
		color: var(--accent);
	}

	.milestone-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.milestone-title {
		font-weight: 500;
		color: var(--text);
		transition: var(--transition);
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
	.milestone-title-wrapper {
		position: relative;
		display: inline-block;
	}

	.selected .milestone-title {
		color: var(--accent);
		background: var(--accent-bg);
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		transition: var(--transition);
	}

	button:not(.selected):hover .milestone-title {
		color: var(--accent);
	}
</style>
