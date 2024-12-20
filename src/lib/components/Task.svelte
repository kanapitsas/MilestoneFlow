<script>
	let { task, index, ontoggleTask } = $props();
	let isHovered = $state(false);
</script>

<li
	class="task"
	class:completed={task.done}
	class:hover={isHovered}
	onmouseenter={() => (isHovered = true)}
	onmouseleave={() => (isHovered = false)}
	draggable="true"
	ondragstart={(e) => e.dataTransfer.setData('text/plain', index)}
	role="listitem"
	aria-label={`Task: ${task.name}${task.done ? ' (completed)' : ''}`}
>
	<div class="task-content">
		<div class="checkbox-wrapper">
			<input
				type="checkbox"
				id={`task-${index}`}
				checked={task.done}
				onchange={() => ontoggleTask(index)}
				aria-label={`Mark task "${task.name}" as ${task.done ? 'incomplete' : 'complete'}`}
			/>
			<label for={`task-${index}`} class="custom-checkbox"></label>
		</div>
		<span class="task-name" class:strike={task.done}>
			{task.name}
		</span>
	</div>
</li>

<style>
	.task {
		padding: var(--space-md);
		border-radius: var(--radius-md);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--background);
		border: 1px solid var(--border);
		margin-bottom: var(--space-sm);
		transition: var(--transition);
		cursor: grab;
	}

	.task:hover {
		background: var(--surface);
		transform: translateY(-1px);
	}

	.task:active {
		cursor: grabbing;
	}

	.task-content {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.checkbox-wrapper {
		position: relative;
	}

	input[type='checkbox'] {
		position: absolute;
		opacity: 0;
		cursor: pointer;
	}

	.custom-checkbox {
		display: inline-block;
		width: 20px;
		height: 20px;
		border: 2px solid var(--border);
		border-radius: var(--radius-sm);
		position: relative;
		cursor: pointer;
		transition: var(--transition);
	}

	input[type='checkbox']:checked + .custom-checkbox {
		background: var(--success);
		border-color: var(--success);
	}

	input[type='checkbox']:checked + .custom-checkbox::after {
		content: '✓';
		position: absolute;
		color: white;
		font-size: 14px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.task-name {
		font-size: 0.9375rem;
	}

	.strike {
		text-decoration: line-through;
		color: var(--text-disabled);
	}

	.completed {
		background: var(--surface);
	}
</style>
