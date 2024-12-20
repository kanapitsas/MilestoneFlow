<script>
	import { parseMarkdown } from '$lib/utils/parseMarkdown.js';
	import { markdownFromProjects } from '$lib/utils/markdownFromProjects.js';
	import ProjectSelector from '$lib/components/ProjectSelector.svelte';
	import MilestoneList from '$lib/components/MilestoneList.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import Chat from '$lib/components/Chat.svelte';

	// Get data from SvelteKit's load function
	let { data } = $props();

	// Initialize state with data from server
	let markdown = $state(data.raw);
	let parsedProjects = $state(data.projects);
	let selectedProjectIndex = $state(0);
	let selectedMilestoneIndex = $state(0);

	// Only update parsedProjects when markdown changes
	$effect(() => {
		parsedProjects = parseMarkdown(markdown);
	});

	// Separate effect for index validation
	$effect(() => {
		// Ensure indexes are in range
		if (selectedProjectIndex >= parsedProjects.length) selectedProjectIndex = 0;
		const proj = parsedProjects[selectedProjectIndex];
		if (proj && selectedMilestoneIndex >= proj.milestones.length) selectedMilestoneIndex = 0;
	});

	function selectProject(i) {
		selectedProjectIndex = i;
		selectedMilestoneIndex = 0;
	}

	function selectMilestone(i) {
		selectedMilestoneIndex = i;
	}

	function toggleTask(i) {
		// Create a deep copy of the projects to avoid direct mutation
		const newProjects = structuredClone(parsedProjects);
		newProjects[selectedProjectIndex].milestones[selectedMilestoneIndex].tasks[i].done =
			!newProjects[selectedProjectIndex].milestones[selectedMilestoneIndex].tasks[i].done;

		// Update both the markdown and parsed projects atomically
		markdown = markdownFromProjects(newProjects);
		parsedProjects = newProjects;
	}

	function replaceMarkdown(newMd) {
		markdown = newMd;
	}
</script>

<div class="main-container">
	<div class="column" style="flex:1">
		<ProjectSelector {parsedProjects} {selectedProjectIndex} onselectProject={selectProject} />
		<MilestoneList {parsedProjects} {selectedProjectIndex} onselectMilestone={selectMilestone} />
	</div>
	<div class="column" style="flex:1.5">
		<TaskList
			{parsedProjects}
			{selectedProjectIndex}
			{selectedMilestoneIndex}
			ontoggleTask={toggleTask}
		/>
	</div>
	<div class="column" style="flex:1">
		<Chat {markdown} onreplaceMarkdown={replaceMarkdown} />
	</div>
</div>

<style>
	.main-container {
		display: flex;
		flex-direction: row;
		height: 100vh;
	}
	.column {
		border-right: 1px solid #ccc;
		padding: 1rem;
		overflow: auto;
	}
	.column:last-child {
		border-right: none;
	}
</style>
