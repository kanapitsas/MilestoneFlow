import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import { json } from '@sveltejs/kit';
import { getServerSupabaseClient } from '$lib/server/supabase.js';

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

export async function POST({ request, locals }) {
	try {
		const { messages, markdown, projectName } = await request.json();
		const user_id = locals.user_id;

		// Save the user's message first
		const supabase = getServerSupabaseClient();
		const lastMessage = messages[messages.length - 1];
		await supabase.from('chat_messages').insert({
			user_id,
			project_title: projectName,
			role: lastMessage.role,
			content: lastMessage.content
		});

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
				let accumulatedResponse = '';
				try {
					for await (const chunk of completion) {
						const content = chunk.choices[0]?.delta?.content || '';
						accumulatedResponse += content;
						controller.enqueue(content);
					}

					// Save the assistant's complete response
					await supabase.from('chat_messages').insert({
						user_id,
						project_title: projectName,
						role: 'assistant',
						content: accumulatedResponse
					});

					controller.close();
				} catch (error) {
					controller.error(error);
				}
			}
		});

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

// Add endpoint to load chat history
export async function GET({ url, locals }) {
	try {
		const projectName = url.searchParams.get('project');
		const user_id = locals.user_id;

		if (!projectName || !user_id) {
			return json({ error: 'Missing parameters' }, { status: 400 });
		}

		const supabase = getServerSupabaseClient();
		const { data, error } = await supabase
			.from('chat_messages')
			.select('role, content, created_at')
			.eq('user_id', user_id)
			.eq('project_title', projectName)
			.order('created_at', { ascending: true });

		if (error) throw error;

		return json({ messages: data });
	} catch (error) {
		console.error('Error loading chat history:', error);
		return json({ error: 'Failed to load chat history' }, { status: 500 });
	}
}

export async function DELETE({ url, locals }) {
	try {
		const projectName = url.searchParams.get('project');
		const user_id = locals.user_id;

		if (!projectName || !user_id) {
			return json({ error: 'Missing parameters' }, { status: 400 });
		}

		const supabase = getServerSupabaseClient();
		const { error } = await supabase
			.from('chat_messages')
			.delete()
			.eq('user_id', user_id)
			.eq('project_title', projectName);

		if (error) throw error;

		return json({ success: true });
	} catch (error) {
		console.error('Error clearing chat history:', error);
		return json({ error: 'Failed to clear chat history' }, { status: 500 });
	}
}
