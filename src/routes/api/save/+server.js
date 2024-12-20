import { writeFile } from 'fs/promises';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const { markdown } = await request.json();
		await writeFile('src/lib/data/projects.md', markdown, 'utf-8');
		return json({ success: true });
	} catch (error) {
		console.error('Error saving projects:', error);
		return json({ error: 'Failed to save projects' }, { status: 500 });
	}
}
