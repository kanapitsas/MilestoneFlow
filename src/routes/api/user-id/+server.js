import { json } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';

export async function PATCH({ request, cookies }) {
	try {
		const { newId } = await request.json();
		const validated = newId && newId.length > 0 ? newId : uuidv4();

		// Overwrite 'user_id' cookie
		cookies.set('user_id', validated, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365
		});

		return json({ success: true });
	} catch (error) {
		return json({ error: 'failed' }, { status: 400 });
	}
}
