<script>
	let { task, index, ontoggleTask } = $props();
</script>

<li
	class="task {task.done ? 'completed' : ''}"
	draggable="true"
	ondragstart={(e) => e.dataTransfer.setData('text/plain', index)}
	role="listitem"
>
	<button onclick={() => ontoggleTask(index)}>
		<div class="task-content">
			<div class="checkbox-wrapper">
				<input
					type="checkbox"
					id={`task-${index}`}
					checked={task.done}
					onchange={() => ontoggleTask(index)}
				/>
				<label for={`task-${index}`} class="custom-checkbox"></label>
			</div>
			<span class="task-name">
				{task.name}
			</span>
		</div>
	</button>
</li>

<style>
	.task {
		border-bottom: 1px solid var(--border);
	}

	button {
		width: 100%;
		padding: var(--space-md);
		background: var(--background);
		border: none;
		cursor: pointer;
		transition: var(--transition);
		text-align: left;
		display: block;
	}

	button:hover {
		background: var(--surface);
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

	.completed .task-name {
		text-decoration: line-through;
		color: var(--text-disabled);
		transition:
			color 0.3s ease,
			text-decoration 0.3s ease;
	}

	.custom-checkbox {
		display: inline-block;
		width: 18px;
		height: 18px;
		border: 2px solid var(--border);
		border-radius: 50%;
		position: relative;
		cursor: pointer;
		transition:
			background-color 0.3s ease,
			border-color 0.3s ease;
	}

	.custom-checkbox::after {
		/* Existing styles */
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	input[type='checkbox']:checked + .custom-checkbox {
		background: var(--success);
		border-color: var(--success);
	}

	input[type='checkbox']:checked + .custom-checkbox::after {
		content: '✓';
		position: absolute;
		color: var(--background);
		opacity: 1;
		font-size: 12px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
