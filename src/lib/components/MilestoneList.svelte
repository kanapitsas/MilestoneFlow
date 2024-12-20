<script>
	let { parsedProjects, selectedProjectIndex, onselectMilestone } = $props();
	let milestones = parsedProjects[selectedProjectIndex]?.milestones ?? [];
</script>

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
