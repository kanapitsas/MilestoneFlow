<script>
	/**
	 * Expects a `data` prop with { raw } containing your project markdown.
	 * Uses parseMarkdown(), markdownFromProjects(), saveProjects() to handle state.
	 */
	import '../app.css';
	import { parseMarkdown } from '$lib/utils/parseMarkdown.js';
	import { markdownFromProjects } from '$lib/utils/markdownFromProjects.js';
	import { saveProjects } from '$lib/utils/saveProjects.js';

	import Navbar from '$lib/components/Navbar.svelte';
	import MilestoneList from '$lib/components/MilestoneList.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import Chat from '$lib/components/Chat.svelte';

	let { data } = $props();
	let markdown = $state(data.raw);

	let selectedProjectIndex = $state(0);
	let selectedMilestoneIndex = $state(0);

	let projects = $derived(parseMarkdown(markdown));
	let currentProjectIndex = $derived(
		Math.min(selectedProjectIndex, projects.length - 1, Math.max(0, selectedProjectIndex))
	);
	let currentProject = $derived(projects[currentProjectIndex] || null);

	let currentMilestoneIndex = $derived(
		Math.min(
			selectedMilestoneIndex,
			(currentProject?.milestones?.length ?? 1) - 1,
			Math.max(0, selectedMilestoneIndex)
		)
	);

	async function updateProjects(newProjects) {
		const newMarkdown = markdownFromProjects(newProjects);
		markdown = newMarkdown;
		await saveProjects(newMarkdown);
	}

	async function replaceCurrentProject(newProjectMarkdown) {
		const [newProject] = parseMarkdown(newProjectMarkdown);
		if (!newProject) return;
		const newProjects = projects.map((p, i) => (i === currentProjectIndex ? newProject : p));
		await updateProjects(newProjects);
	}

	async function updateMilestoneByName(milestoneMarkdown, milestoneName) {
		const lines = milestoneMarkdown.trim().split('\n');
		if (!lines[0]?.startsWith('## ')) return;

		console.log('Raw milestone markdown:', milestoneMarkdown); // Debug

		const tasks = lines
			.slice(1)
			.filter((line) => line.trim().startsWith('-'))
			.map((line) => {
				const trimmedLine = line.trim();
				console.log('Processing line:', trimmedLine);

				const checkboxMatch = trimmedLine.match(/^-\s*\[([ x])\]\s*(.+)$/);
				const plainListMatch = trimmedLine.match(/^-\s*(.+)$/);

				if (checkboxMatch) {
					return {
						done: checkboxMatch[1] === 'x',
						name: checkboxMatch[2].trim() // Changed from 'text' to 'name'
					};
				} else if (plainListMatch) {
					return {
						done: false,
						name: plainListMatch[1].trim() // Changed from 'text' to 'name'
					};
				}

				console.log('Failed to parse line:', trimmedLine);
				return null;
			})
			.filter(Boolean);

		console.log('Parsed tasks:', tasks); // Debug

		const newMilestone = { title: milestoneName, tasks };

		let found = false;
		const newProjects = projects.map((p) => {
			const idx = p.milestones?.findIndex((m) => m.title === milestoneName);
			if (idx !== undefined && idx >= 0) {
				found = true;
				return {
					...p,
					milestones: p.milestones.map((m, j) => (j === idx ? newMilestone : m))
				};
			}
			return p;
		});

		if (found) {
			await updateProjects(newProjects);
		} else {
			console.log(`Milestone "${milestoneName}" not found`);
		}
	}

	// Helper function for toggling and reordering
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
							j === currentMilestoneIndex ? { ...m, tasks: newTasks } : m
						)
					}
		);
		updateProjects(newProjects);
	}

	function toggleTask(taskIndex) {
		updateCurrentMilestoneTasks((tasks) =>
			tasks.map((t, i) => (i === taskIndex ? { ...t, done: !t.done } : t))
		);
	}

	function reorderTasks(fromIndex, toIndex) {
		updateCurrentMilestoneTasks((tasks) =>
			[...tasks].toSpliced(fromIndex, 1).toSpliced(toIndex, 0, tasks[fromIndex])
		);
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
				onupdateMilestoneByName={updateMilestoneByName}
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
