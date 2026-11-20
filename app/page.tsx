"use client";
import { aiAction } from "./action/aiAction";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
    id: number;
    role: "user" | "ai";
    content: string;
    isError?: boolean;
};

const SUGGESTIONS = [
    "Explain Next.js in simple words",
    "Write a short email to my lead",
    "What is the difference between SSR and CSR?",
];

// Max height (px) the text box can grow to before it starts scrolling
const MAX_TEXTAREA_HEIGHT = 128;

export default function Home() {
    const [prompt, setPrompt] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const idRef = useRef<number>(0);

    // Simple unique id generator (works on http too, unlike crypto.randomUUID)
    const nextId = () => {
        idRef.current += 1;
        return idRef.current;
    };

    // Auto-scroll to the newest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    // Auto-grow the text box as the user types
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    }, [prompt]);

    const send = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        setMessages((prev) => [
            ...prev,
            { id: nextId(), role: "user", content: trimmed },
        ]);
        setPrompt("");
        setLoading(true);

        try {
            const res = await aiAction(trimmed);
            setMessages((prev) => [
                ...prev,
                { id: nextId(), role: "ai", content: res },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: nextId(),
                    role: "ai",
                    content: "Something went wrong. Please try again.",
                    isError: true,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Enter = send, Shift+Enter = new line
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send(prompt);
        }
    };

    return (
        <main className="flex h-[100dvh] flex-col overflow-hidden bg-slate-50 text-slate-800">
            {/* Header */}
            <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4">
                <div className="mx-auto flex max-w-3xl items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        AI
                    </div>
                    <div className="min-w-0">
                        <h1 className="truncate text-base font-semibold">
                            AI Chat
                        </h1>
                        <p className="truncate text-xs text-slate-500">
                            Ask anything, get an instant answer
                        </p>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <section className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:gap-4">
                    {messages.length === 0 && !loading && (
                        <div className="mt-8 flex flex-col items-center px-2 text-center sm:mt-16">
                            <h2 className="text-xl font-semibold sm:text-2xl">
                                How can I help you today?
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Type a question below or try one of these:
                            </p>
                            <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => send(s)}
                                        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-left text-sm text-slate-700 transition hover:border-blue-500 hover:text-blue-600 sm:rounded-full sm:text-center"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={`flex ${
                                m.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`min-w-0 max-w-[90%] break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%] ${
                                    m.role === "user"
                                        ? "rounded-br-sm bg-blue-600 text-white"
                                        : m.isError
                                          ? "rounded-bl-sm border border-red-200 bg-red-50 text-red-700"
                                          : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                                }`}
                            >
                                {m.role === "user" ? (
                                    <p className="whitespace-pre-wrap">
                                        {m.content}
                                    </p>
                                ) : (
                                    <ReactMarkdown
                                        components={{
                                            p: ({ children }) => (
                                                <p className="mb-2 last:mb-0">
                                                    {children}
                                                </p>
                                            ),
                                            ul: ({ children }) => (
                                                <ul className="mb-2 list-disc pl-5">
                                                    {children}
                                                </ul>
                                            ),
                                            ol: ({ children }) => (
                                                <ol className="mb-2 list-decimal pl-5">
                                                    {children}
                                                </ol>
                                            ),
                                            h1: ({ children }) => (
                                                <h1 className="mb-2 text-lg font-semibold">
                                                    {children}
                                                </h1>
                                            ),
                                            h2: ({ children }) => (
                                                <h2 className="mb-2 text-base font-semibold">
                                                    {children}
                                                </h2>
                                            ),
                                            h3: ({ children }) => (
                                                <h3 className="mb-1 font-semibold">
                                                    {children}
                                                </h3>
                                            ),
                                            code: ({ children }) => (
                                                <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs">
                                                    {children}
                                                </code>
                                            ),
                                            // Code inside a dark <pre> block must not get the light inline-code style
                                            pre: ({ children }) => (
                                                <pre className="mb-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100 [&>code]:bg-transparent [&>code]:p-0">
                                                    {children}
                                                </pre>
                                            ),
                                            table: ({ children }) => (
                                                <div className="mb-2 overflow-x-auto">
                                                    <table className="min-w-full border-collapse text-left text-xs">
                                                        {children}
                                                    </table>
                                                </div>
                                            ),
                                            th: ({ children }) => (
                                                <th className="border border-slate-200 bg-slate-50 px-2 py-1 font-semibold">
                                                    {children}
                                                </th>
                                            ),
                                            td: ({ children }) => (
                                                <td className="border border-slate-200 px-2 py-1">
                                                    {children}
                                                </td>
                                            ),
                                            a: ({ children, href }) => (
                                                <a
                                                    href={href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 underline"
                                                >
                                                    {children}
                                                </a>
                                            ),
                                        }}
                                    >
                                        {m.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>
            </section>

            {/* Input bar */}
            <footer className="shrink-0 border-t border-slate-200 bg-white px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:pt-4">
                <div className="mx-auto flex max-w-3xl items-end gap-2">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        aria-label="Type your message"
                        placeholder="Type your message..."
                        className="min-w-0 flex-1 resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 sm:text-sm"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        onClick={() => send(prompt)}
                        disabled={loading || !prompt.trim()}
                        aria-label="Send message"
                        className="shrink-0 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-slate-300 sm:px-6"
                    >
                        {loading ? "..." : "Send"}
                    </button>
                </div>
            </footer>
        </main>
    );
}