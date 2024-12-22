import { v4 as uuidv4 } from 'uuid'; // if not installed, npm i uuid

export const handle = async ({ event, resolve }) => {
	// Check if we have a cookie named 'user_id'
	let user_id = event.cookies.get('user_id');

	if (!user_id) {
		// Create a new one
		user_id = uuidv4();
		// Write the cookie for future requests
		// important: set path='/'
		event.cookies.set('user_id', user_id, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365 // e.g. 1 year
		});
	}

	// Expose user_id to all server load functions in event.locals
	event.locals.user_id = user_id;

	// Proceed with the request
	return resolve(event);
};
