<script>
	import '../app.css';
	import { parseMarkdown } from '$lib/utils/parseMarkdown.js';
	import { markdownFromProjects } from '$lib/utils/markdownFromProjects.js';
	import ProjectSelector from '$lib/components/ProjectSelector.svelte';
	import MilestoneList from '$lib/components/MilestoneList.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import Chat from '$lib/components/Chat.svelte';

	// Get data from server-side load function
	let { data } = $props();

	// Initialize state with data from server
	let markdown = $state(data.raw);
	let parsedProjects = $derived(parseMarkdown(markdown));
	let selectedProjectIndex = $state(0);
	let selectedMilestoneIndex = $state(0);

	// Derive valid indices directly, removing the intermediate variables
	let currentProjectIndex = $derived(
		selectedProjectIndex >= parsedProjects.length ? 0 : selectedProjectIndex
	);

	let currentMilestoneIndex = $derived(
		parsedProjects[currentProjectIndex]?.milestones.length <= selectedMilestoneIndex
			? 0
			: selectedMilestoneIndex
	);

	function selectProject(i) {
		selectedProjectIndex = i;
		selectedMilestoneIndex = 0;
	}

	function selectMilestone(i) {
		selectedMilestoneIndex = i;
	}

	function toggleTask(i) {
		// Create a new array of projects
		const newProjects = parsedProjects.map((project, pIndex) => {
			if (pIndex !== selectedProjectIndex) return project;

			return {
				...project,
				milestones: project.milestones.map((milestone, mIndex) => {
					if (mIndex !== selectedMilestoneIndex) return milestone;

					return {
						...milestone,
						tasks: milestone.tasks.map((task, tIndex) => {
							if (tIndex !== i) return task;
							return { ...task, done: !task.done };
						})
					};
				})
			};
		});

		// Update both the markdown and parsed projects
		markdown = markdownFromProjects(newProjects);
	}

	function reorderTasks(fromIndex, toIndex) {
		const newProjects = parsedProjects.map((project, pIndex) => {
			if (pIndex !== selectedProjectIndex) return project;

			return {
				...project,
				milestones: project.milestones.map((milestone, mIndex) => {
					if (mIndex !== selectedMilestoneIndex) return milestone;

					const newTasks = [...milestone.tasks];
					const [movedTask] = newTasks.splice(fromIndex, 1);
					newTasks.splice(toIndex, 0, movedTask);

					return {
						...milestone,
						tasks: newTasks
					};
				})
			};
		});

		// Update both the markdown and parsed projects
		markdown = markdownFromProjects(newProjects);
	}

	function getCurrentProjectMarkdown() {
		const project = parsedProjects[selectedProjectIndex];
		if (!project) return '';

		return markdownFromProjects([project]);
	}

	// Helper to replace current project in the full markdown
	function replaceCurrentProject(newProjectMarkdown) {
		const newProject = parseMarkdown(newProjectMarkdown)[0];
		if (!newProject) return;

		const updatedProjects = parsedProjects.map((p, i) =>
			i === selectedProjectIndex ? newProject : p
		);

		markdown = markdownFromProjects(updatedProjects);
	}
</script>

<div class="app-container">
	<aside class="sidebar">
		<ProjectSelector
			{parsedProjects}
			selectedProjectIndex={currentProjectIndex}
			onselectProject={selectProject}
		/>
		<MilestoneList
			{parsedProjects}
			selectedProjectIndex={currentProjectIndex}
			onselectMilestone={selectMilestone}
		/>
	</aside>

	<main class="main-content">
		<TaskList
			{parsedProjects}
			selectedProjectIndex={currentProjectIndex}
			selectedMilestoneIndex={currentMilestoneIndex}
			ontoggleTask={toggleTask}
			onreorderTasks={reorderTasks}
		/>
	</main>

	<aside class="chat-sidebar">
		<Chat
			markdown={getCurrentProjectMarkdown()}
			onreplaceMarkdown={replaceCurrentProject}
			projectName={parsedProjects[currentProjectIndex]?.title ?? ''}
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
