<script>
	let { parsedProjects = [], selectedProjectIndex = 0, onselectProject } = $props();

	function handleSelect(event) {
		onselectProject(+event.target.value);
	}

	function createNewProject() {
		// Add a new project at the end and select it
		onselectProject(parsedProjects.length);
	}
</script>

<div class="project-selector">
	<select id="project-select" onchange={handleSelect} bind:value={selectedProjectIndex}>
		{#each parsedProjects as project, i}
			<option value={i}>{project.title}</option>
		{/each}
	</select>

	<button
		class="new-project-btn"
		onclick={createNewProject}
		title="Create new project"
		aria-label="Create new project"
	>
		<svg viewBox="0 0 24 24" width="20" height="20">
			<path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
		</svg>
	</button>
</div>

<style>
	.project-selector {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	select {
		appearance: none;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		color: var(--text);
		background: var(--surface)
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")
			no-repeat;
		background-position: calc(100% - 0.5rem) center;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: var(--transition);
		width: 200px;
	}

	select:hover {
		border-color: var(--primary);
	}

	select:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 25%, transparent);
	}

	.new-project-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		cursor: pointer;
		transition: var(--transition);
	}

	.new-project-btn:hover {
		background: var(--surface-hover);
		color: var(--text);
		border-color: var(--primary);
	}
</style>
