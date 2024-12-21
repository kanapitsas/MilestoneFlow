<script>
	import '../app.css';
	import { parseMarkdown } from '$lib/utils/parseMarkdown.js';
	import { markdownFromProjects } from '$lib/utils/markdownFromProjects.js';
	import { saveProjects } from '$lib/utils/saveProjects.js';
	import MilestoneList from '$lib/components/MilestoneList.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import Chat from '$lib/components/Chat.svelte';
	import Navbar from '$lib/components/Navbar.svelte';

	let { data } = $props();
	let markdown = $state(data.raw);
	let selectedProjectIndex = $state(0);
	let selectedMilestoneIndex = $state(0);

	// Core derived values
	let projects = $derived(parseMarkdown(markdown));
	let currentProjectIndex = $derived(
		Math.min(selectedProjectIndex, projects.length - 1, Math.max(0, selectedProjectIndex))
	);
	let currentProject = $derived(projects[currentProjectIndex]);
	let currentMilestoneIndex = $derived(
		Math.min(
			selectedMilestoneIndex,
			(currentProject?.milestones.length ?? 1) - 1,
			Math.max(0, selectedMilestoneIndex)
		)
	);

	// Actions
	async function updateProjects(newProjects) {
		const newMarkdown = markdownFromProjects(newProjects);
		markdown = newMarkdown;
		await saveProjects(newMarkdown);
	}

	// Helper function to update tasks in current milestone
	function updateCurrentMilestoneTasks(taskUpdater) {
		const project = projects[currentProjectIndex];
		if (!project) return;

		const milestone = project.milestones[currentMilestoneIndex];
		if (!milestone) return;

		const newTasks = taskUpdater(milestone.tasks);

		const newProjects = projects.map((p, i) =>
			i !== currentProjectIndex
				? p
				: {
						...p,
						milestones: p.milestones.map((m, j) =>
							j !== currentMilestoneIndex ? m : { ...m, tasks: newTasks }
						)
					}
		);

		updateProjects(newProjects);
	}

	// Simplified task functions using the helper
	function toggleTask(taskIndex) {
		updateCurrentMilestoneTasks((tasks) =>
			tasks.map((task, index) => (index !== taskIndex ? task : { ...task, done: !task.done }))
		);
	}

	function reorderTasks(fromIndex, toIndex) {
		updateCurrentMilestoneTasks((tasks) =>
			[...tasks].toSpliced(fromIndex, 1).toSpliced(toIndex, 0, tasks[fromIndex])
		);
	}

	async function replaceCurrentProject(newProjectMarkdown) {
		const [newProject] = parseMarkdown(newProjectMarkdown);
		if (!newProject) return;

		const newProjects = projects.map((p, i) => (i === currentProjectIndex ? newProject : p));
		const newMarkdown = markdownFromProjects(newProjects);
		markdown = newMarkdown;
		await saveProjects(newMarkdown);
	}
</script>

<div class="app">
	<Navbar
		parsedProjects={projects}
		selectedProjectIndex={currentProjectIndex}
		onselectProject={(i) => {
			selectedProjectIndex = i;
			selectedMilestoneIndex = 0;
		}}
	/>
	<div class="app-container">
		<aside class="sidebar">
			<MilestoneList
				parsedProjects={projects}
				selectedProjectIndex={currentProjectIndex}
				selectedMilestoneIndex={currentMilestoneIndex}
				onselectMilestone={(i) => (selectedMilestoneIndex = i)}
			/>
		</aside>

		<main class="main-content">
			<TaskList
				parsedProjects={projects}
				selectedProjectIndex={currentProjectIndex}
				selectedMilestoneIndex={currentMilestoneIndex}
				ontoggleTask={toggleTask}
				onreorderTasks={reorderTasks}
			/>
		</main>

		<aside class="chat-sidebar">
			<Chat
				markdown={markdownFromProjects([currentProject])}
				onreplaceMarkdown={replaceCurrentProject}
				projectName={currentProject?.title ?? ''}
			/>
		</aside>
	</div>
</div>

<style>
	.app {
		height: 100vh;
		display: flex;
		flex-direction: column;
		max-width: 100vw;
		overflow: hidden;
	}

	.app-container {
		flex: 1;
		display: grid;
		grid-template-columns: 350px 1fr 400px;
		overflow: hidden;
	}

	.sidebar,
	.main-content,
	.chat-sidebar {
		background: var(--background);
		border-right: 1px solid var(--border);
		overflow-y: auto;
	}

	.main-content {
		padding: 0; /* Remove padding */
	}

	/* Responsive adjustments */
	@media (max-width: 1024px) {
		.app-container {
			grid-template-columns: 250px 1fr 300px;
		}
	}

	@media (max-width: 768px) {
		.app-container {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr auto;
		}

		.sidebar,
		.chat-sidebar {
			border-right: none;
			border-bottom: 1px solid var(--border);
		}
	}
</style>
