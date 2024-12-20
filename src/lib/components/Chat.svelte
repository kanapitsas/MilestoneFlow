<script>
	let { markdown, onreplaceMarkdown } = $props();
	let userInput = $state('');
	let messages = $state([]);
	let isLoading = $state(false);
	let currentResponse = $state('');

	// Helper function to validate markdown structure
	function isValidMarkdownStructure(text) {
		// Must start with a project header
		if (!text.trim().startsWith('# ')) return false;

		// Basic structure validation
		const lines = text.trim().split('\n');
		let hasProject = false;
		let hasMilestone = false;

		for (const line of lines) {
			if (line.startsWith('# ')) hasProject = true;
			if (line.startsWith('## ')) hasMilestone = true;
			if (line.startsWith('- [')) {
				// Must have either ' ' or 'x' between brackets
				if (!line.match(/- \[[ x]\]/)) return false;
			}
		}

		return hasProject && hasMilestone;
	}

	async function sendMessage() {
		if (!userInput.trim() || isLoading) return;

		const userMessage = userInput;
		userInput = '';
		messages = [...messages, { role: 'user', content: userMessage }];
		currentResponse = '';
		isLoading = true;

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages, markdown })
			});

			if (!res.ok) throw new Error('Failed to fetch response');

			const reader = res.body.getReader();
			const decoder = new TextDecoder();

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				const text = decoder.decode(value);
				currentResponse += text;
			}

			// When streaming is complete, check if the response is a valid markdown update
			if (isValidMarkdownStructure(currentResponse)) {
				// Add confirmation message to chat
				messages = [
					...messages,
					{
						role: 'assistant',
						content: "I've updated the project structure as requested."
					}
				];
				// Update the markdown
				onreplaceMarkdown(currentResponse);
			} else {
				// Regular chat message
				messages = [
					...messages,
					{
						role: 'assistant',
						content: currentResponse
					}
				];
			}
		} catch (error) {
			console.error('Error:', error);
			messages = [
				...messages,
				{
					role: 'assistant',
					content: 'Sorry, there was an error processing your request.'
				}
			];
		} finally {
			isLoading = false;
			currentResponse = '';
		}
	}
</script>

<div class="chat-container">
	<div class="messages">
		{#each messages as m}
			<div class="message {m.role}">
				<div class="message-content">
					{m.content}
				</div>
			</div>
		{/each}

		{#if currentResponse}
			<div class="message assistant">
				<div class="message-content">
					{currentResponse}
				</div>
			</div>
		{/if}

		{#if isLoading && !currentResponse}
			<div class="message assistant">
				<div class="message-content loading">
					<span class="dot"></span>
					<span class="dot"></span>
					<span class="dot"></span>
				</div>
			</div>
		{/if}
	</div>

	<div class="input-area">
		<input
			type="text"
			bind:value={userInput}
			placeholder="Ask the AI..."
			disabled={isLoading}
			onkeyup={(e) => e.key === 'Enter' && sendMessage()}
		/>
		<button onclick={sendMessage} disabled={isLoading} aria-label="Send message">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="22" y1="2" x2="11" y2="13"></line>
				<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
			</svg>
		</button>
	</div>
</div>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--background);
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.message {
		max-width: 85%;
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		animation: fadeIn var(--transition);
	}

	.message.user {
		align-self: flex-end;
		background: var(--primary);
		color: white;
	}

	.message.assistant {
		align-self: flex-start;
		background: var(--surface);
		color: var(--text);
	}

	.input-area {
		border-top: 1px solid var(--border);
		padding: var(--space-md);
		display: flex;
		gap: var(--space-sm);
	}

	input {
		flex: 1;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		transition: var(--transition);
	}

	input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px var(--primary-dark);
	}

	button {
		padding: var(--space-sm) var(--space-md);
		background: var(--primary);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: var(--transition);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	button:hover {
		background: var(--primary-dark);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.loading {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		align-items: center;
		padding: 1rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		background: var(--text-secondary);
		border-radius: 50%;
		animation: bounce 1.4s infinite ease-in-out both;
	}

	.dot:nth-child(1) {
		animation-delay: -0.32s;
	}
	.dot:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes bounce {
		0%,
		80%,
		100% {
			transform: scale(0);
		}
		40% {
			transform: scale(1);
		}
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	input:disabled {
		background: var(--surface);
		cursor: not-allowed;
	}
</style>
