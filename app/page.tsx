"use client";
import { aiAction } from "./action/aiAction";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Message = {
    role: "user" | "ai";
    content: string;
    isError?: boolean;
};

const SUGGESTIONS = [
    "Explain Next.js in simple words",
    "Write a short email to my lead",
    "What is the difference between SSR and CSR?",
];

export default function Home() {
    const [prompt, setPrompt] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the newest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const send = async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;

        setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
        setPrompt("");
        setLoading(true);

        try {
            const res = await aiAction(trimmed);
            setMessages((prev) => [...prev, { role: "ai", content: res }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    content: "Something went wrong. Please try again.",
                    isError: true,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send(prompt);
        }
    };

    return (
        <main className="flex h-screen flex-col bg-slate-50 text-slate-800">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
                <div className="mx-auto flex max-w-3xl items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        AI
                    </div>
                    <div>
                        <h1 className="text-base font-semibold">AI Chat</h1>
                        <p className="text-xs text-slate-500">
                            Ask anything, get an instant answer
                        </p>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <section className="flex-1 overflow-y-auto px-4 py-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-4">
                    {messages.length === 0 && !loading && (
                        <div className="mt-16 flex flex-col items-center text-center">
                            <h2 className="text-2xl font-semibold">
                                How can I help you today?
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Type a question below or try one of these:
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                {SUGGESTIONS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => send(s)}
                                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-blue-500 hover:text-blue-600"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex ${
                                m.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
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
                                            pre: ({ children }) => (
                                                <pre className="mb-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                                                    {children}
                                                </pre>
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
            <footer className="border-t border-slate-200 bg-white px-4 py-4">
                <div className="mx-auto flex max-w-3xl items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-5 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                    />
                    <button
                        onClick={() => send(prompt)}
                        disabled={loading || !prompt.trim()}
                        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        {loading ? "..." : "Send"}
                    </button>
                </div>
            </footer>
        </main>
    );
}