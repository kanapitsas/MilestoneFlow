<script>
	let { parsedProjects = [], selectedProjectIndex = 0, onselectProject } = $props();

	function handleSelect(event) {
		onselectProject(+event.target.value);
	}
</script>

<div>
	{#if parsedProjects.length === 0}
		<p>No projects available</p>
	{:else}
		<select onchange={handleSelect}>
			{#each parsedProjects as project, i}
				<option value={i} selected={i === selectedProjectIndex}>
					{project.title}
				</option>
			{/each}
		</select>
	{/if}
</div>
