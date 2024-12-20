<script>
	import Task from './Task.svelte';
	let { parsedProjects, selectedProjectIndex, selectedMilestoneIndex, ontoggleTask } = $props();

	let tasks = parsedProjects[selectedProjectIndex]?.milestones[selectedMilestoneIndex]?.tasks ?? [];
</script>

<ul class="task-list">
	{#each tasks as task, i}
		<Task {task} index={i} {ontoggleTask} />
	{/each}
</ul>

<style>
	.task-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
</style>
