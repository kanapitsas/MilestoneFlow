<script>
	let { markdown, onreplaceMarkdown } = $props();

	let userInput = $state('');
	let messages = $state([]);

	async function sendMessage() {
		if (!userInput.trim()) return;
		messages = [...messages, { role: 'user', content: userInput }];
		const res = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages, markdown })
		});
		const data = await res.json();
		messages = [...messages, { role: 'assistant', content: data.reply }];
		userInput = '';

		// Check if the model returned a full markdown update (just a heuristic)
		// For now, let's say if it returned something starting with '#' might be a full markdown
		if (data.reply.startsWith('# ')) {
			onreplaceMarkdown(data.reply);
		}
	}
</script>

<div style="display:flex; flex-direction:column; height:100%;">
	<div style="flex:1; overflow:auto; border:1px solid #ccc;">
		{#each messages as m}
			<p><strong>{m.role}:</strong> {m.content}</p>
		{/each}
	</div>
	<div style="border-top:1px solid #ccc; padding:0.5rem;">
		<input
			type="text"
			bind:value={userInput}
			placeholder="Ask the AI..."
			onkeyup={(e) => e.key === 'Enter' && sendMessage()}
		/>
		<button onclick={sendMessage}>Send</button>
	</div>
</div>
