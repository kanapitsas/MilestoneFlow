<script>
	import { parseMarkdown } from '$lib/utils/parseMarkdown.js';
	import { markdownFromProjects } from '$lib/utils/markdownFromProjects.js';
	import ProjectSelector from '$lib/components/ProjectSelector.svelte';
	import MilestoneList from '$lib/components/MilestoneList.svelte';
	import TaskList from '$lib/components/TaskList.svelte';
	import Chat from '$lib/components/Chat.svelte';

	// Props from load
	let { raw, projects } = $props();

	// Runes mode reactivity
	let markdown = $state(raw);
	let parsedProjects = $state(projects);

	let selectedProjectIndex = $state(0);
	let selectedMilestoneIndex = $state(0);

	$effect(() => {
		// Whenever markdown changes, re-parse
		parsedProjects = parseMarkdown(markdown);
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
		// Toggle a task and update markdown
		parsedProjects[selectedProjectIndex].milestones[selectedMilestoneIndex].tasks[i].done =
			!parsedProjects[selectedProjectIndex].milestones[selectedMilestoneIndex].tasks[i].done;
		markdown = markdownFromProjects(parsedProjects);
	}

	function replaceMarkdown(newMd) {
		// Called by chat if model returns a new markdown
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
