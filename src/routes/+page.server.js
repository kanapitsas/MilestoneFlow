// src/routes/+page.server.js
import { getServerSupabaseClient } from '$lib/server/supabase.js';

/**
 * The root +page.server.js, which loads the user’s
 * markdown from Supabase or returns an empty default.
 */
export async function load({ locals }) {
	const supabase = getServerSupabaseClient();
	const user_id = locals.user_id;

	// 1) Try to fetch user_data row
	const { data, error } = await supabase
		.from('user_data')
		.select('markdown')
		.eq('user_id', user_id)
		.single();

	if (error) {
		console.error('Supabase fetch error:', error);
	}

	let markdown = data?.markdown || '';

	// Optional: If no row, we could create it
	if (!data) {
		const { error: insertError } = await supabase
			.from('user_data')
			.insert({ user_id, markdown: '' });
		if (insertError) {
			console.error('Error creating user_data row:', insertError);
		}
	}

	return {
		markdown,
		user_id
	};
}
