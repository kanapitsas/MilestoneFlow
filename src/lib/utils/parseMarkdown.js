export function parseMarkdown(md) {
	const projects = [];
	const lines = md.split('\n');
	let currentProject = null;
	let currentMilestone = null;

	for (const line of lines) {
		if (line.startsWith('# ')) {
			// New project
			if (currentProject) {
				// Push the last milestone if exists
				if (currentMilestone) {
					currentProject.milestones.push(currentMilestone);
					currentMilestone = null;
				}
				projects.push(currentProject);
			}
			currentProject = { title: line.replace('# ', '').trim(), milestones: [] };
		} else if (line.startsWith('## ')) {
			// New milestone
			if (currentMilestone && currentProject) {
				currentProject.milestones.push(currentMilestone);
			}
			currentMilestone = { title: line.replace('## ', '').trim(), tasks: [] };
		} else if (line.match(/^- \[.\]/)) {
			// Task line
			const done = line.includes('[x]');
			const name = line.replace(/^-\s*\[.\]\s*/, '').trim();
			if (currentMilestone) {
				currentMilestone.tasks.push({ name, done });
			}
		}
	}

	// push last milestone and project
	if (currentMilestone && currentProject) currentProject.milestones.push(currentMilestone);
	if (currentProject) projects.push(currentProject);

	return projects;
}
