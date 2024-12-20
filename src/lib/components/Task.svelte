<script>
	let { task, index, ontoggleTask } = $props();

	// Add hover state for better UX
	let isHovered = $state(false);

	// Compute completion time
	let completedAt = $derived(task.done ? new Date().toLocaleString() : null);
</script>

<li
	class="task"
	class:completed={task.done}
	class:hover={isHovered}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
>
	<div class="task-content">
		<input
			type="checkbox"
			aria-label={`Complete task: ${task.name}`}
			checked={task.done}
			onchange={() => ontoggleTask(index)}
		/>
		<span class="task-name" class:strike={task.done}>
			{task.name}
		</span>
	</div>

	{#if task.done}
		<span class="completion-time">
			Completed: {completedAt}
		</span>
	{/if}
</li>

<style>
	.task {
		padding: 0.5rem;
		border-radius: 4px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: background-color 0.2s;
	}

	.task:hover {
		background-color: #f5f5f5;
	}

	.task-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.strike {
		text-decoration: line-through;
		color: #666;
	}

	.completion-time {
		font-size: 0.8rem;
		color: #666;
	}

	.completed {
		background-color: #f8f8f8;
	}
</style>
