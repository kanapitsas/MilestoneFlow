export function markdownFromProjects(projects) {
	let md = '';
	for (const p of projects) {
		md += `# ${p.title}\n\n`;
		for (const m of p.milestones) {
			md += `## ${m.title}\n`;
			for (const t of m.tasks) {
				md += `- [${t.done ? 'x' : ' '}] ${t.name}\n`;
			}
			md += '\n';
		}
	}
	return md.trim() + '\n';
}
