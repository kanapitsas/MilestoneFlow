<script>
	import ColumnHeader from './ColumnHeader.svelte';
	let { markdown, onreplaceMarkdown, projectName } = $props();
	let userInput = $state('');
	let projectChats = $state({});
	let isLoading = $state(false);
	let currentResponse = $state('');

	// Get or initialize messages for current project
	let messages = $derived(projectChats[projectName] || []);

	// Helper function to validate markdown structure
	function isValidMarkdownStructure(text) {
		if (!text.includes('# ')) return false;

		const lines = text.trim().split('\n');
		let hasProject = false;
		let hasMilestone = false;

		for (const line of lines) {
			if (line.startsWith('# ')) hasProject = true;
			if (line.startsWith('## ')) hasMilestone = true;
			if (line.startsWith('- [')) {
				if (!line.match(/- \[[ x]\]/)) return false;
			}
		}

		return hasProject && hasMilestone;
	}

	// Helper function to extract markdown structure
	function extractMarkdownStructure(text) {
		const lines = text.split('\n');
		let markdownStartIndex = -1;

		// Find where the markdown structure starts
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith('# ')) {
				const remainingText = lines.slice(i).join('\n');
				if (isValidMarkdownStructure(remainingText)) {
					markdownStartIndex = i;
					break;
				}
			}
		}

		if (markdownStartIndex === -1) return null;

		const conversationalPart = lines.slice(0, markdownStartIndex).join('\n').trim();
		const markdownPart = lines.slice(markdownStartIndex).join('\n').trim();

		return {
			markdown: markdownPart,
			message: conversationalPart || "I've updated the project structure as requested."
		};
	}

	// Update project chat history
	function updateProjectChat(newMessages) {
		projectChats = {
			...projectChats,
			[projectName]: newMessages
		};
	}

	async function sendMessage() {
		if (!userInput.trim() || isLoading) return;

		const userMessage = userInput;
		userInput = '';
		const newMessages = [...messages, { role: 'user', content: userMessage }];
		updateProjectChat(newMessages);
		currentResponse = '';
		isLoading = true;

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: newMessages,
					markdown,
					projectName
				})
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

			// When streaming is complete
			const extracted = extractMarkdownStructure(currentResponse);
			if (extracted) {
				const updatedMessages = [...newMessages, { role: 'assistant', content: extracted.message }];
				updateProjectChat(updatedMessages);
				onreplaceMarkdown(extracted.markdown);
			} else {
				const updatedMessages = [...newMessages, { role: 'assistant', content: currentResponse }];
				updateProjectChat(updatedMessages);
			}
		} catch (error) {
			console.error('Error:', error);
			const updatedMessages = [
				...newMessages,
				{
					role: 'assistant',
					content: 'Sorry, there was an error processing your request.'
				}
			];
			updateProjectChat(updatedMessages);
		} finally {
			isLoading = false;
			currentResponse = '';
		}
	}

	// Optional: Add a welcome message when starting a new chat
	$effect(() => {
		if (!projectChats[projectName]) {
			updateProjectChat([
				{
					role: 'assistant',
					content: `Hi! I'm here to help you manage "${projectName}". What would you like to do?`
				}
			]);
		}
	});
</script>

<div class="chat-container">
	<ColumnHeader title={`Chat about "${projectName}"`}>
		{#if messages.length > 1}
			<button
				class="clear-chat"
				onclick={() => updateProjectChat([])}
				aria-label="Clear chat history"
			>
				Clear Chat
			</button>
		{/if}
	</ColumnHeader>

	<div class="messages">
		{#each messages as m}
			<div class="message {m.role}">
				<div class="message-role">{m.role}</div>
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
			placeholder="Ask about this project..."
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
		max-width: 100%;
		overflow: hidden; /* Prevent horizontal scroll */
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden; /* Prevent horizontal scroll */
		display: flex;
		flex-direction: column;
	}

	.message {
		width: 100%;
		padding: var(--space-md);
		border-bottom: 1px solid var(--border);
	}

	.message-content {
		word-break: break-word; /* Prevent text from causing horizontal scroll */
		overflow-wrap: break-word;
	}

	.message.user {
		background: var(--surface);
	}

	.message-role {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-xs);
	}

	.message.user .message-role {
		color: var(--primary);
	}

	.message.assistant .message-role {
		color: var(--text-secondary);
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

	.clear-chat {
		font-size: 0.8125rem;
		padding: var(--space-xs) var(--space-sm);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-secondary);
		cursor: pointer;
		transition: var(--transition);
	}

	.clear-chat:hover {
		background: var(--surface-hover);
		color: var(--text);
	}
</style>
