<script>
	import '../app.css';
	import { parseMarkdown } from '$lib/utils/parseMarkdown.js';
	import { markdownFromProjects } from '$lib/utils/markdownFromProjects.js';
	import ProjectSelector from '$lib/components/ProjectSelector.svelte';
	import MilestoneList from '$lib/components/MilestoneList.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import Chat from '$lib/components/Chat.svelte';

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
	function updateProjects(newProjects) {
		markdown = markdownFromProjects(newProjects);
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

	function replaceCurrentProject(newProjectMarkdown) {
		const [newProject] = parseMarkdown(newProjectMarkdown);
		if (!newProject) return;

		const newProjects = projects.map((p, i) => (i === currentProjectIndex ? newProject : p));
		updateProjects(newProjects);
	}
</script>

<div class="app-container">
	<aside class="sidebar">
		<ProjectSelector
			parsedProjects={projects}
			selectedProjectIndex={currentProjectIndex}
			onselectProject={(i) => {
				selectedProjectIndex = i;
				selectedMilestoneIndex = 0;
			}}
		/>
		<MilestoneList
			parsedProjects={projects}
			selectedProjectIndex={currentProjectIndex}
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

<style>
	.app-container {
		display: grid;
		grid-template-columns: 300px 1fr 350px;
		height: 100vh;
		background: var(--surface);
	}

	.sidebar,
	.chat-sidebar {
		background: var(--background);
		padding: var(--space-lg);
		border-right: 1px solid var(--border);
		overflow-y: auto;
	}

	.main-content {
		padding: var(--space-lg);
		overflow-y: auto;
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
