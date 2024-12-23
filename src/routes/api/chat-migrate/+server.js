import { json } from '@sveltejs/kit';
import { getServerSupabaseClient } from '$lib/server/supabase.js';

export async function POST({ request, locals }) {
	try {
		const { oldTitle, newTitle } = await request.json();
		const user_id = locals.user_id;

		if (!oldTitle || !newTitle || !user_id) {
			return json({ error: 'Missing parameters' }, { status: 400 });
		}

		const supabase = getServerSupabaseClient();

		// Update all chat messages for this project to use the new title
		const { error } = await supabase
			.from('chat_messages')
			.update({ project_title: newTitle })
			.eq('user_id', user_id)
			.eq('project_title', oldTitle);

		if (error) throw error;

		return json({ success: true });
	} catch (error) {
		console.error('Error migrating chat history:', error);
		return json({ error: 'Failed to migrate chat history' }, { status: 500 });
	}
}
