<script>
	import Task from './Task.svelte';
	let {
		parsedProjects,
		selectedProjectIndex,
		selectedMilestoneIndex,
		ontoggleTask,
		onreorderTasks
	} = $props();

	let tasks = $derived(
		parsedProjects[selectedProjectIndex]?.milestones[selectedMilestoneIndex]?.tasks ?? []
	);

	function handleDrop(e, dropIndex) {
		e.preventDefault();
		const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
		if (dragIndex !== dropIndex) {
			onreorderTasks(dragIndex, dropIndex);
		}
	}
</script>

<ul class="task-list">
	{#each tasks as task, i}
		<div
			class="task-wrapper"
			role="listitem"
			aria-label="Drop zone for task reordering"
			ondragover={(e) => e.preventDefault()}
			ondrop={(e) => handleDrop(e, i)}
		>
			<Task {task} index={i} {ontoggleTask} />
		</div>
	{/each}
</ul>

<style>
	.task-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.task-wrapper {
		position: relative;
		padding: 4px 0;
	}

	.task-wrapper::before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--primary);
		opacity: 0;
		transition: opacity var(--transition);
	}

	.task-wrapper:hover::before {
		opacity: 0.5;
	}
</style>
