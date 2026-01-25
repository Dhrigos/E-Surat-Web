import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: number;
    text: string;
    sender: 'bot' | 'user';
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Halo! Bagaimana saya bisa membantu Anda dengan layanan pemerintah hari ini?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: inputText,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        setIsTyping(true);

        try {
            // Mock API call - replace with actual endpoint
            // const response = await fetch('/api/chat', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ message: inputText }),
            // });
            // const data = await response.json();

            // Simulate delay for realism
            setTimeout(() => {
                let responseText = "";
                const lowerInput = userMessage.text.toLowerCase();

                if (lowerInput.includes('apa itu komcad') || lowerInput.includes('komcad adalah')) {
                    responseText = "Komcad adalah singkatan dari Komponen Cadangan. Ini adalah program sukarela (volunter) yang disiapkan oleh pemerintah Indonesia untuk memperkuat kekuatan dan kemampuan Tentara Nasional Indonesia (TNI) sebagai Komponen Utama dalam menjaga pertahanan negara.";
                } else if (lowerInput.includes('hai') || lowerInput.includes('halo') || lowerInput.includes('pagi') || lowerInput.includes('siang') || lowerInput.includes('sore') || lowerInput.includes('malam') || lowerInput.includes('assalamualaikum')) {
                    responseText = "Selamat datang, saya asisten Anda untuk menjawab semua pertanyaan tentang KomCad.";
                } else {
                    responseText = "Terima kasih atas pertanyaan Anda. Layanan KomCad ini masih dalam tahap Coming soon.";
                }

                const botMessage: Message = {
                    id: Date.now() + 1,
                    text: responseText,
                    sender: 'bot'
                };
                setMessages(prev => [...prev, botMessage]);
                setIsTyping(false);
            }, 1000);

        } catch (error) {
            console.error("Error sending message:", error);
            setIsTyping(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, fontFamily: 'var(--font-body)' }}>
            {/* Toggle Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-color)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(172, 0, 33, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                    fontSize: '1.5rem'
                }}
            >
                <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-comment-dots'}`}></i>
            </div>

            {/* Chat Window */}
            <div style={{
                position: 'absolute',
                bottom: '80px',
                right: '0',
                width: 'min(380px, 90vw)',
                height: 'min(600px, 70vh)',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                display: isOpen ? 'flex' : 'none',
                flexDirection: 'column',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                transformOrigin: 'bottom right'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    background: 'var(--primary-color)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <i className="fa-solid fa-robot"></i>
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Asisten KomCad</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', opacity: 0.9, marginTop: '2px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80' }}></span>
                            Daring
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={{
                    flex: 1,
                    padding: '1.5rem',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    backgroundColor: '#0F0F0F'
                }}>
                    {messages.map((msg) => (
                        <div key={msg.id} style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            <div style={{
                                padding: '1rem 1.2rem',
                                borderRadius: msg.sender === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                backgroundColor: msg.sender === 'user' ? 'var(--primary-color)' : '#262626',
                                color: 'white',
                                fontSize: '0.95rem',
                                lineHeight: '1.5',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}>
                                {msg.text}
                            </div>
                            <span style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-muted)',
                                marginTop: '4px',
                                marginLeft: '4px',
                                marginRight: '4px'
                            }}>
                                {msg.sender === 'user' ? 'Anda' : 'Asisten'}
                            </span>
                        </div>
                    ))}

                    {isTyping && (
                        <div style={{
                            alignSelf: 'flex-start',
                            padding: '1rem',
                            borderRadius: '16px 16px 16px 0',
                            backgroundColor: '#262626',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }}></span>
                            <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }}></span>
                            <span style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} style={{
                    padding: '1.2rem',
                    backgroundColor: 'var(--bg-card)',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '0.8rem',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Ketik pertanyaan Anda..."
                        style={{
                            flex: 1,
                            padding: '1rem',
                            backgroundColor: '#0F0F0F',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50px',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.95rem',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    />
                    <button type="submit" disabled={!inputText.trim()} style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: inputText.trim() ? 'var(--primary-color)' : '#262626',
                        color: inputText.trim() ? 'white' : '#666',
                        border: 'none',
                        cursor: inputText.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        fontSize: '1.1rem'
                    }}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>

            {/* Inline Styles for Animation */}
            <style>
                {`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
                `}
            </style>
        </div>
    );
};

export default ChatWidget;
