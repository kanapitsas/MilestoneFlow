import { readFile } from 'fs/promises';
import { parseMarkdown } from '$lib/utils/parseMarkdown.js';

export async function load() {
	try {
		// Read the markdown file
		const raw = await readFile('src/lib/data/projects.md', 'utf-8');

		// Parse the markdown into projects data
		const projects = parseMarkdown(raw);
		return {
			raw,
			projects
		};
	} catch (error) {
		console.error('Error loading projects:', error);

		// Return empty defaults if file reading fails
		return {
			raw: '',
			projects: []
		};
	}
}
