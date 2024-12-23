<script>
	import ProjectSelector from './ProjectSelector.svelte';

	let { parsedProjects, selectedProjectIndex, onselectProject, userId } = $props();

	async function updateUserId(newId) {
		const res = await fetch('/api/user-id', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ newId })
		});
		if (res.ok) {
			location.reload();
			// or you could do something fancier: navigation.goto('/')
		} else {
			alert('Failed to update user ID');
		}
	}
</script>

<nav class="navbar">
	<div class="nav-section">
		<ProjectSelector {parsedProjects} {selectedProjectIndex} {onselectProject} />
	</div>
	<div class="nav-section brand">
		<h1>
			<span class="app-title">
				<span class="title-part">Milestone</span>
				<img src="/favicon.png" alt="MilestoneFlow Logo" class="logo" />
				<span class="title-part">Flow</span>
			</span>
		</h1>
	</div>
	<div class="nav-section right-section">
		<div class="user-id-container">
			<input
				type="text"
				class="user-id-input"
				placeholder="User ID"
				bind:value={userId}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						updateUserId(userId);
					}
				}}
				onblur={() => updateUserId(userId)}
			/>
		</div>
		<div class="links">
			<a
				href="https://github.com/kanapitsas"
				target="_blank"
				rel="noopener"
				aria-label="GitHub Profile"
			>
				<svg class="icon" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
					/>
				</svg>
			</a>
			<a href="https://rkan.org" target="_blank" rel="noopener" aria-label="Personal Website">
				<svg class="icon" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
					/>
				</svg>
			</a>
		</div>
	</div>
</nav>

<style>
	h1 {
		margin: 0;
	}

	.navbar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding: 0 var(--space-md);
		background: var(--navbar-bg);
		border-bottom: 1px solid var(--border);
		height: 64px;
		box-sizing: border-box;
		box-shadow: var(--shadow-sm);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.app-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--primary);
		background: color-mix(in srgb, var(--primary) 8%, transparent);
		padding: 0.375rem 0.875rem;
		border-radius: 999px;
		letter-spacing: -0.01em;
		transition: var(--transition);
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.app-title:hover {
		background: color-mix(in srgb, var(--primary) 12%, transparent);
	}

	.title-part {
		display: inline-block;
	}

	.logo {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		object-fit: cover;
		margin: 0 -1px; /* Slightly reduce the gap between text and logo */
	}

	.right-section {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-md);
	}

	.user-id-container {
		position: relative;
	}

	.user-id-input {
		width: 180px;
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		color: var(--text);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		transition: var(--transition);
	}

	.user-id-input:hover {
		border-color: var(--primary);
	}

	.user-id-input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 25%, transparent);
	}

	.links {
		display: flex;
		gap: var(--space-md);
	}

	.links a {
		color: var(--text-secondary);
		transition: var(--transition);
		display: flex;
		align-items: center;
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
	}

	.links a:hover {
		color: var(--text);
		background: var(--surface-hover);
	}

	.icon {
		width: 20px;
		height: 20px;
	}
</style>
