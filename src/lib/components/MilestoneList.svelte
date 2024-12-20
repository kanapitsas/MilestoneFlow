<script>
	let { parsedProjects = [], selectedProjectIndex = 0, onselectMilestone } = $props();

	// Safely access milestones with nullish coalescing
	let milestones = $derived(parsedProjects[selectedProjectIndex]?.milestones ?? []);
</script>

<div>
	{#if milestones.length === 0}
		<p>No milestones available</p>
	{:else}
		<ul>
			{#each milestones as m, i}
				<li>
					<button onclick={() => onselectMilestone(i)}>
						<strong>{m.title}</strong> (
						{m.tasks.filter((t) => t.done).length}/{m.tasks.length}
						)
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
