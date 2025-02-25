export async function saveProjects(markdown) {
	try {
		const response = await fetch('/api/save', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ markdown })
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to save projects');
		}

		return true;
	} catch (error) {
		console.error('Error saving projects:', error);
		return false;
	}
}
