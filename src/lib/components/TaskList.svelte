<script>
	import { fade } from 'svelte/transition';
	import Task from './Task.svelte';
	import ColumnHeader from './ColumnHeader.svelte';
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

	let draggingIndex = $state(null);

	function handleDragStart(index) {
		draggingIndex = index;
	}

	function handleDragEnd() {
		draggingIndex = null;
	}

	function handleDrop(e, dropIndex) {
		e.preventDefault();
		if (draggingIndex === null) return;
		const dragIndex = draggingIndex;
		if (dragIndex !== dropIndex) {
			onreorderTasks(dragIndex, dropIndex);
		}
		draggingIndex = null;
	}
</script>

<div class="task-list-container">
	<ColumnHeader title="Tasks" />

	<ul class="task-list">
		{#each tasks as task, i}
			<div
				class="task-wrapper {draggingIndex === i ? 'dragging' : ''}"
				draggable="true"
				ondragstart={() => handleDragStart(i)}
				ondragend={handleDragEnd}
				ondragover={(e) => e.preventDefault()}
				ondrop={(e) => handleDrop(e, i)}
				transition:fade={{ duration: 200 }}
				role="listitem"
				aria-label="Draggable task {i + 1}"
			>
				<Task {task} index={i} {ontoggleTask} />
			</div>
		{/each}
	</ul>
</div>

<style>
	.task-list-container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.task-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.task-wrapper {
		position: relative;
		transition: transform 0.3s ease;
	}

	.task-wrapper.dragging {
		opacity: 0.5;
		transform: scale(0.98);
	}
</style>
