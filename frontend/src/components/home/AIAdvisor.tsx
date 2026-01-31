
'use client';

import { useState } from 'react';

export function AIAdvisor() {
    const [input, setInput] = useState('');

    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-primary/20 bg-background shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-3 w-3 gap-1.5">
                                <span className="rounded-full bg-red-500 w-3 h-3 block"></span>
                                <span className="rounded-full bg-yellow-500 w-3 h-3 block"></span>
                                <span className="rounded-full bg-green-500 w-3 h-3 block"></span>
                            </div>
                            <span className="ml-4 text-sm font-semibold text-foreground">🤖 Trợ Lý AI Thông Minh</span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">[Powered by Gemini]</span>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8">
                        <div className="mb-6 space-y-4">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl flex">🤖</div>
                                <div className="rounded-lg rounded-tl-none bg-muted p-4 text-sm md:text-base">
                                    <p>Chào bạn! Tôi là trợ lý AI của Academy.</p>
                                    <p className="mt-2">Hãy cho tôi biết độ tuổi và sở thích của con bạn, tôi sẽ gợi ý lộ trình học phù hợp nhất.</p>
                                </div>
                            </div>
                        </div>

                        {/* Simulated Input */}
                        <div className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="VD: Con tôi 8 tuổi, thích chơi Minecraft và lắp ráp lego..."
                                className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                            />
                            <div className="absolute bottom-3 right-3">
                                <button className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                    Tư Vấn AI ✨
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
