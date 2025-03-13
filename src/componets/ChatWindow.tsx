import React, {useState, useRef, useEffect, FormEvent, JSX} from 'react';
import { marked } from 'marked';

interface ChatMessage {
	sender: 'user' | 'bot';
	text: string;
}

interface ChatWindowProps {
	uuid: string;
	initialMessage?: string;
	onClose: () => void;
}

const formatText = (text: string): string => {
	if (text.startsWith('"') && text.endsWith('"')) {
		text = text.slice(1, -1);
	}
	text = text.replace(/\\n/g, "\n");
	text = text.replace(/\s*\([^)]*\)/g, '');
	return text;
};

const renderMarkdown = (text: string): JSX.Element => {
	const html = marked.parse(text);
	// @ts-ignore
	return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ uuid, onClose, initialMessage }) => {
	const initialMessages: ChatMessage[] = !!initialMessage ? [{ sender: 'bot', text: initialMessage}] : [];
	const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
	const [input, setInput] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const trimmedInput = input.trim();
		if (!trimmedInput) return;

		const userMessage: ChatMessage = { sender: 'user', text: trimmedInput };
		setMessages(prev => [...prev, userMessage]);
		setLoading(true);

		try {
			const response = await fetch(
				`${process.env.REACT_APP_SUPPORT_CHANNEL_API_URL}/chat/${uuid}`,
				{
					method: 'POST',
					headers: {
						accept: 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ query: trimmedInput }),
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.text();
			const botMessage: ChatMessage = { sender: 'bot', text: data };
			setMessages(prev => [...prev, botMessage]);
		} catch (error) {
			console.error('Error fetching the API:', error);
			setMessages(prev => [
				...prev,
				{ sender: 'bot', text: 'Error: Failed to fetch response.' },
			]);
		} finally {
			setLoading(false);
			setInput('');
		}
	};

	return (
		<div
			style={{
				width: '400px',
				height: '500px',
				margin: '0 auto',
				display: 'flex',
				flexDirection: 'column',
				border: '1px solid #ccc',
				borderRadius: '5px',
				backgroundColor: '#fff',
			}}
		>
			<button
				onClick={onClose}
				style={{
					position: 'absolute',
					top: '10px',
					right: '10px',
					background: 'transparent',
					border: 'none',
					fontSize: '1.2rem',
					cursor: 'pointer',
				}}
				aria-label="Close Chat Window"
			>
				&times;
			</button>
			<div
				style={{
					flex: 1,
					padding: '10px',
					overflowY: 'auto',
					backgroundColor: '#f7f7f7',
				}}
			>
				{messages.map((msg, index) => (
					<div
						key={index}
						style={{
							marginBottom: '10px',
							textAlign: msg.sender === 'user' ? 'right' : 'left',
						}}
					>
						<div
							style={{
								display: 'inline-block',
								padding: '10px',
								borderRadius: '10px',
								backgroundColor: msg.sender === 'user' ? '#0084ff' : '#e5e5ea',
								color: msg.sender === 'user' ? '#fff' : '#000',
								maxWidth: '80%',
								wordWrap: 'break-word',
							}}
						>
							{msg.sender === 'bot'
								? renderMarkdown(formatText(msg.text))
								: msg.text}
						</div>
					</div>
				))}
				{loading && (
					<div style={{ textAlign: 'left', marginBottom: '10px' }}>
						Thinking...
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
			<form
				onSubmit={handleSubmit}
				style={{
					display: 'flex',
					borderTop: '1px solid #ccc',
				}}
			>
				<input
					type="text"
					value={input}
					onChange={e => setInput(e.target.value)}
					placeholder="Type your message..."
					style={{
						flex: 1,
						border: 'none',
						padding: '10px',
						fontSize: '1rem',
					}}
					disabled={loading}
				/>
				<button
					type="submit"
					style={{
						border: 'none',
						padding: '10px 20px',
						backgroundColor: '#0084ff',
						color: '#fff',
						cursor: 'pointer',
						fontSize: '1rem',
					}}
					disabled={loading}
				>
					Send
				</button>
			</form>
		</div>
	);
};

export default ChatWindow;
