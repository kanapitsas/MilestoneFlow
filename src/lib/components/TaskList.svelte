<script>
	let { parsedProjects, selectedProjectIndex, selectedMilestoneIndex, ontoggleTask } = $props();

	let tasks = parsedProjects[selectedProjectIndex]?.milestones[selectedMilestoneIndex]?.tasks ?? [];
</script>

<ul>
	{#each tasks as t, i}
		<li>
			<input type="checkbox" checked={t.done} onchange={() => ontoggleTask(i)} />
			{t.name}
		</li>
	{/each}
</ul>
