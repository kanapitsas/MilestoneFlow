import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import { json } from '@sveltejs/kit';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You help users manage their project milestones and tasks. You are currently focused on a single project and should only modify that project's structure.

When the user requests changes to the project structure, you can respond in two ways:

1. Full Project Update - Use this when the project name or overall structure needs to change:
# Project Name
## Milestone Name
- [ ] Task 1
- [x] Task 2 (x means completed)

2. Milestone Updates - Use this when only updating specific milestones (can be one or multiple):
## Milestone Name
- [ ] Task 1
- [x] Task 2

## Another Milestone
- [ ] New task 1
- [ ] New task 2

Important:
- Only return a full project update (starting with #) when the project or milestone names, or overall structure needs to change
- For milestone-only changes, you can return one or more milestone sections
- Keep milestone names consistent unless explicitly asked to rename them
- For general questions or assistance, respond with normal conversational text`;

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
