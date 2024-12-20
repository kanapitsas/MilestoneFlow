<script>
	let { parsedProjects, selectedProjectIndex, onselectProject } = $props();

	function handleSelect(event) {
		onselectProject(+event.target.value);
	}
</script>

<select onchange={handleSelect}>
	{#each parsedProjects as project, i}
		<option value={i} selected={i === selectedProjectIndex}>{project.title}</option>
	{/each}
</select>
