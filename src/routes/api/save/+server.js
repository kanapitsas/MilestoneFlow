// src/routes/api/save/+server.js
import { json } from '@sveltejs/kit';
import { getServerSupabaseClient } from '$lib/server/supabase.js';

export async function POST({ request, locals }) {
	try {
		const { markdown } = await request.json();
		const user_id = locals.user_id;

		const supabase = getServerSupabaseClient();

		// upsert the row in user_data
		const { error } = await supabase
			.from('user_data')
			.upsert({ user_id, markdown }, { onConflict: 'user_id' });

		if (error) {
			throw error;
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error saving to Supabase:', error);
		return json({ error: 'Failed to save projects' }, { status: 500 });
	}
}
