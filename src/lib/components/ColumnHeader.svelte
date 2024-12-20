<script>
	let { title } = $props();
</script>

<div class="column-header">
	<h2>{title}</h2>
</div>

<style>
	.column-header {
		padding: var(--space-md);
		border-bottom: 1px solid var(--border);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h2 {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary);
		margin: 0;
	}
</style>
