export function markdownFromProjects(projects) {
	if (!projects || !Array.isArray(projects) || projects.length === 0) {
		return '# New Project\n\n## Getting Started\n- [ ] Add your first task\n';
	}

	let md = '';
	for (const p of projects) {
		if (!p || typeof p !== 'object') continue;

		md += `# ${p.title || 'Untitled Project'}\n\n`;
		if (Array.isArray(p.milestones)) {
			for (const m of p.milestones) {
				if (!m || typeof m !== 'object') continue;

				md += `## ${m.title || 'Untitled Milestone'}\n`;
				if (Array.isArray(m.tasks)) {
					for (const t of m.tasks) {
						if (!t || typeof t !== 'object') continue;
						md += `- [${t.done ? 'x' : ' '}] ${t.name || 'Untitled Task'}\n`;
					}
				}
				md += '\n';
			}
		}
	}
	return md.trim() + '\n';
}
