<script>
	let { parsedProjects = [], selectedProjectIndex = 0, onselectMilestone } = $props();
	let milestones = $derived(parsedProjects[selectedProjectIndex]?.milestones ?? []);
</script>

<div class="milestone-list">
	<h2>Milestones</h2>
	{#if milestones.length === 0}
		<p class="empty-state">No milestones available</p>
	{:else}
		<ul>
			{#each milestones as m, i}
				<li>
					<button onclick={() => onselectMilestone(i)}>
						<div class="milestone-info">
							<span class="milestone-title">{m.title}</span>
							<span class="milestone-progress">
								{m.tasks.filter((t) => t.done).length}/{m.tasks.length}
							</span>
						</div>
						<div class="progress-bar">
							<div
								class="progress-fill"
								style="width: {(m.tasks.filter((t) => t.done).length / m.tasks.length) * 100}%"
							></div>
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.milestone-list {
		margin-bottom: var(--space-lg);
	}

	h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: var(--space-md);
		color: var(--text);
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	button {
		width: 100%;
		padding: var(--space-md);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: var(--transition);
	}

	button:hover {
		background: var(--surface-hover);
		transform: translateY(-1px);
	}

	.milestone-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-sm);
	}

	.milestone-title {
		font-weight: 500;
		color: var(--text);
	}

	.milestone-progress {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.progress-bar {
		width: 100%;
		height: 4px;
		background: var(--border);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--primary);
		transition: width var(--transition);
	}

	.empty-state {
		color: var(--text-disabled);
		font-size: 0.875rem;
		padding: var(--space-md);
		text-align: center;
		background: var(--surface);
		border-radius: var(--radius-md);
	}
</style>
