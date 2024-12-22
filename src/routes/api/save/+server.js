import { json } from '@sveltejs/kit';
import { getServerSupabaseClient } from '$lib/server/supabase.js';

export async function POST({ request, locals }) {
	try {
		const { markdown } = await request.json();
		if (typeof markdown !== 'string') {
			return json({ error: 'Invalid markdown format' }, { status: 400 });
		}

		const user_id = locals.user_id;
		if (!user_id) {
			return json({ error: 'User ID not found' }, { status: 401 });
		}

		const supabase = getServerSupabaseClient();
		const { error } = await supabase.from('user_data').upsert(
			{
				user_id,
				markdown
			},
			{
				onConflict: 'user_id'
			}
		);

		if (error) {
			console.error('Supabase error:', error);
			return json({ error: 'Database error' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error saving to Supabase:', error);
		return json({ error: 'Server error' }, { status: 500 });
	}
}
