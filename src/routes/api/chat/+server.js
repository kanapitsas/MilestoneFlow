import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import { json } from '@sveltejs/kit';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You help users manage their project milestones and tasks. You are currently focused on a single project and should only modify that project's structure.

When the user requests changes to the project structure (like adding, removing, or modifying milestones or tasks), respond with a complete markdown document that represents the updated structure for this project only. The document must follow this exact format:

# Project Name
## Milestone Name
- [ ] Task 1
- [x] Task 2 (x means completed)

## Another Milestone
- [ ] Another task

For all other queries (like questions about the project or general assistance), respond with normal conversational text. Keep these responses concise and friendly.

Important:
- Only respond with a markdown document when the user explicitly requests changes to the project structure
- Never modify the project name
- Only work with the current project, don't reference or try to modify other projects`;

export async function POST({ request }) {
	try {
		const { messages, markdown, projectName } = await request.json();

		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{
					role: 'system',
					content: `You are working with the project "${projectName}". Current project structure:\n${markdown}`
				},
				...messages
			],
			temperature: 0.7,
			stream: true
		});

		// Create a new ReadableStream
		const stream = new ReadableStream({
			async start(controller) {
				try {
					for await (const chunk of completion) {
						const content = chunk.choices[0]?.delta?.content || '';
						controller.enqueue(content);
					}
					controller.close();
				} catch (error) {
					controller.error(error);
				}
			}
		});

		// Return the stream with the appropriate headers
		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	} catch (error) {
		console.error('Error:', error);
		return json({ error: 'Failed to process request' }, { status: 500 });
	}
}
