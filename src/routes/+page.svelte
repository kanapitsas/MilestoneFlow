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
	let markdown = $state(data.markdown || '');
	let userId = data.user_id;

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
		try {
			const newMarkdown = markdownFromProjects(newProjects);
			const saved = await saveProjects(newMarkdown);
			if (saved) {
				markdown = newMarkdown;
			} else {
				throw new Error('Failed to save projects');
			}
		} catch (error) {
			console.error('Error updating projects:', error);
			// Optionally show error to user
			alert('Failed to save changes. Please try again.');
		}
	}

	async function replaceCurrentProject(newProjectMarkdown) {
		const [newProject] = parseMarkdown(newProjectMarkdown);
		if (!newProject) return;
		const newProjects = projects.map((p, i) => (i === currentProjectIndex ? newProject : p));
		await updateProjects(newProjects);
	}

	async function updateMilestoneByName(milestoneMarkdown) {
		// If it's a full project update (starts with # Project)
		if (milestoneMarkdown.trim().startsWith('# ')) {
			return replaceCurrentProject(milestoneMarkdown);
		}

		// Split the markdown into milestone sections
		const milestones = milestoneMarkdown
			.split(/(?=^## )/m)
			.map((section) => section.trim())
			.filter(Boolean);

		// Parse each milestone section
		const parsedMilestones = milestones
			.map((section) => {
				const lines = section.split('\n');
				const titleLine = lines[0];
				if (!titleLine?.startsWith('## ')) return null;

				const milestoneName = titleLine.replace('## ', '').trim();
				const tasks = lines
					.slice(1)
					.filter((line) => line.trim().startsWith('-'))
					.map((line) => {
						const trimmedLine = line.trim();
						const checkboxMatch = trimmedLine.match(/^-\s*\[([ x])\]\s*(.+)$/);
						const plainListMatch = trimmedLine.match(/^-\s*(.+)$/);

						if (checkboxMatch) {
							return {
								done: checkboxMatch[1] === 'x',
								name: checkboxMatch[2].trim()
							};
						} else if (plainListMatch) {
							return {
								done: false,
								name: plainListMatch[1].trim()
							};
						}
						return null;
					})
					.filter(Boolean);

				return { title: milestoneName, tasks };
			})
			.filter(Boolean);

		// Update the project with the new milestone data
		const newProjects = projects.map((p) => {
			if (p.title !== currentProject?.title) return p;

			const updatedMilestones = [...p.milestones];

			// Update each parsed milestone
			parsedMilestones.forEach((newMilestone) => {
				const existingIndex = updatedMilestones.findIndex((m) => m.title === newMilestone.title);

				if (existingIndex >= 0) {
					// Update existing milestone
					updatedMilestones[existingIndex] = newMilestone;
				} else {
					// Add new milestone
					updatedMilestones.push(newMilestone);
				}
			});

			return {
				...p,
				milestones: updatedMilestones
			};
		});

		await updateProjects(newProjects);
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
		{userId}
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
