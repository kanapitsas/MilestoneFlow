<script>
	let { parsedProjects = [], selectedProjectIndex = 0, onselectProject } = $props();

	function handleSelect(event) {
		onselectProject(+event.target.value);
	}
</script>

<div class="project-selector">
	<label for="project-select">Select Project</label>
	{#if parsedProjects.length === 0}
		<p class="empty-state">No projects available</p>
	{:else}
		<select id="project-select" onchange={handleSelect}>
			{#each parsedProjects as project, i}
				<option value={i} selected={i === selectedProjectIndex}>
					{project.title}
				</option>
			{/each}
		</select>
	{/if}
</div>

<style>
	.project-selector {
		margin-bottom: var(--space-lg);
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
		margin-bottom: var(--space-xs);
	}

	select {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background-color: var(--background);
		color: var(--text);
		font-size: 1rem;
		transition: var(--transition);
	}

	select:hover {
		border-color: var(--primary);
	}

	select:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px var(--primary-dark);
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
