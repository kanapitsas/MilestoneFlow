<script>
	/**
	 * Props:
	 * - markdown: current project's markdown
	 * - onreplaceMarkdown(markdown: string): user wants to replace a full project
	 * - onupdateMilestoneByName(milestoneMarkdown: string): update one or more milestones
	 * - projectName: the name of the current project for scoping the chat
	 */
	let { markdown, onreplaceMarkdown, onupdateMilestoneByName, projectName } = $props();

	let userInput = $state('');
	let projectChats = $state({});
	let isLoading = $state(false);
	let currentResponse = $state('');

	// Derive the messages for this projectName
	let messages = $derived(projectChats[projectName] || []);

	// Auto-scroll refs and state
	let messagesContainer;
	let isAutoScrolling = $state(false);
	let lastScrollTop = $state(0);

	// Auto-scroll when messages change or during streaming
	$effect(() => {
		if (!messagesContainer) return;

		// Only auto-scroll if we're already at the bottom or streaming
		const isAtBottom =
			Math.abs(
				messagesContainer.scrollHeight -
					messagesContainer.clientHeight -
					messagesContainer.scrollTop
			) < 50;

		if (isAutoScrolling || isAtBottom || currentResponse) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	});

	function handleScroll(e) {
		const { scrollTop } = e.target;
		// Update auto-scroll based on user scrolling up/down
		if (Math.abs(scrollTop - lastScrollTop) > 50) {
			isAutoScrolling = scrollTop > lastScrollTop;
			lastScrollTop = scrollTop;
		}
	}

	/**
	 * Detect whether the final text from the LLM is a full project or milestones.
	 */
	function parseChatResponse(fullText) {
		const text = fullText.trim();
		if (text.startsWith('# ')) {
			return { type: 'project', markdown: text };
		} else if (text.startsWith('## ')) {
			return { type: 'milestones', markdown: text };
		}
		return null;
	}

	function updateProjectChat(newMessages) {
		projectChats = {
			...projectChats,
			[projectName]: newMessages
		};
	}

	async function sendMessage() {
		if (!userInput.trim() || isLoading) return;

		const userMsg = userInput;
		userInput = '';
		const newMessages = [...messages, { role: 'user', content: userMsg }];
		updateProjectChat(newMessages);
		isLoading = true;
		currentResponse = '';
		isAutoScrolling = true; // Enable auto-scroll when sending message

		let accumulated = '';
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
			if (!res.ok) throw new Error('Chat request failed');

			const reader = res.body.getReader();
			const decoder = new TextDecoder();

			while (true) {
				const { value, done } = await reader.read();
				if (done) break;
				accumulated += decoder.decode(value);
				currentResponse = accumulated;
			}

			const parsed = parseChatResponse(accumulated);
			if (parsed?.type === 'project') {
				const updated = [...newMessages, { role: 'assistant', content: 'Updated entire project.' }];
				updateProjectChat(updated);
				onreplaceMarkdown(parsed.markdown);
			} else if (parsed?.type === 'milestones') {
				const updated = [...newMessages, { role: 'assistant', content: 'Updated milestones.' }];
				updateProjectChat(updated);
				onupdateMilestoneByName(parsed.markdown);
			} else {
				const updated = [...newMessages, { role: 'assistant', content: accumulated }];
				updateProjectChat(updated);
			}
		} catch (err) {
			console.error(err);
			updateProjectChat([
				...newMessages,
				{ role: 'assistant', content: 'Error processing your request.' }
			]);
		} finally {
			isLoading = false;
			currentResponse = '';
			// Keep auto-scroll enabled for a short while after completion
			setTimeout(() => {
				isAutoScrolling = false;
			}, 1000);
		}
	}
</script>

<div class="chat-container">
	<div class="messages" bind:this={messagesContainer} onscroll={handleScroll}>
		{#each messages as m}
			<div class="message {m.role}">
				<div class="message-role">{m.role}</div>
				<div class="message-content">{m.content}</div>
			</div>
		{/each}

		{#if currentResponse}
			<div class="message assistant">
				<div class="message-content">{currentResponse}</div>
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
		<textarea
			bind:value={userInput}
			disabled={isLoading}
			onkeydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					sendMessage();
				}
			}}
		></textarea>
		<button onclick={sendMessage} disabled={isLoading}>Send</button>
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
		box-sizing: border-box; /* Ensure padding is included in width */
	}

	.message-content {
		word-break: break-word;
		overflow-wrap: break-word;
		white-space: pre-wrap; /* Preserve line breaks */
		max-width: 100%; /* Ensure content doesn't overflow */
		padding-right: var(--space-sm); /* Add some right padding */
	}

	.message-content.loading {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		color: var(--text-secondary);
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
		box-sizing: border-box;
	}

	textarea {
		flex: 1;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		font-size: 0.9375rem;
		transition: var(--transition);
		resize: none;
		height: 50px; /* Fixed height */
		overflow-y: auto;
		line-height: 1.4;
		font-family: inherit;
	}

	textarea:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 2px var(--primary-dark);
	}

	textarea:disabled {
		background: var(--surface);
		cursor: not-allowed;
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
