import React from 'react';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

export default function ChatPanel({
    showModal,
    messages,
    username,
    AI_SENDER,
    fileInputRef,
    handleFileSelect,
    selectedFile,
    clearSelectedFile,
    message,
    setMessage,
    sendMessage,
    messagesEndRef,
    handleChatToggle
}) {
    if (!showModal) return null;

    const getFileIcon = (type) => {
        if (type.startsWith('image/')) return '🖼️';
        if (type.startsWith('video/')) return '🎥';
        if (type.startsWith('audio/')) return '🎵';
        if (type.includes('pdf')) return '📄';
        if (type.includes('word') || type.includes('document')) return '📝';
        if (type.includes('sheet') || type.includes('excel')) return '📊';
        if (type.includes('zip') || type.includes('rar')) return '📦';
        return '📎';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const downloadFile = (fileData) => {
        const link = document.createElement('a');
        link.href = fileData.data;
        link.download = fileData.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadChat = () => {
        const stripHtml = (html) => html.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
        const text = messages.map(m => `[${m.sender}]: ${stripHtml(m.data)}`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: 'chat.txt' });
        a.click();
        URL.revokeObjectURL(url);
    };

    const parseMarkdown = (text) => text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g,     '<em>$1</em>')
        .replace(/`(.*?)`/g,       '<code>$1</code>')
        .replace(/\n/g,            '<br/>');

    return (
        <div className="chatRoom">
            <div className="chatHeader">
                <h1>Chat</h1>
                <div>
                    <IconButton
                        onClick={downloadChat}
                        title="Download chat"
                        size="small"
                        sx={{ color: 'var(--text-secondary)', '&:hover': { color: 'var(--text-primary)' }, mr: 1 }}
                    >
                        <DownloadIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleChatToggle}
                        title="Close chat"
                        size="small"
                        sx={{ color: 'var(--text-secondary)', '&:hover': { color: '#ff4757' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                </div>
            </div>

            <div className="chatContainer">
                <div className="chattingDisplay">
                    {messages.length === 0 && (
                        <div className="chat-empty-state">
                            <span>💬</span>
                            <p>No messages yet.<br />Type <strong>@ai</strong> to ask the AI, or <strong>@ai from chat</strong> to ask with full chat context!</p>
                        </div>
                    )}
                    {messages.map((item, index) => {
                        const isAI  = item.sender === AI_SENDER;
                        const isOwn = item.sender === username;
                        
                        if (item.type === 'file') {
                            return (
                                <div
                                    className={`msg-box file-msg ${isOwn ? 'own' : 'other'}`}
                                    key={index}
                                >
                                    <span>{item.sender}</span>
                                    <div className="file-content">
                                        <div className="file-info">
                                            <span className="file-icon">{getFileIcon(item.data.type)}</span>
                                            <div className="file-details">
                                                <p className="file-name">{item.data.name}</p>
                                                <p className="file-size">{formatFileSize(item.data.size)}</p>
                                            </div>
                                        </div>
                                        <button 
                                            className="file-download-btn"
                                            onClick={() => downloadFile(item.data)}
                                            title="Download file"
                                        >
                                            <DownloadIcon sx={{ fontSize: '1.2rem' }} />
                                        </button>
                                    </div>
                                    {item.data.type.startsWith('image/') && (
                                        <img 
                                            src={item.data.data} 
                                            alt={item.data.name}
                                            className="file-preview-img"
                                        />
                                    )}
                                </div>
                            );
                        }
                        
                        return (
                            <div
                                className={`msg-box ${isOwn ? 'own' : isAI ? 'ai' : 'other'}`}
                                key={index}
                            >
                                <span>{item.sender}</span>
                                <p dangerouslySetInnerHTML={{ __html: parseMarkdown(item.data) }} />
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="chattingArea">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                {!selectedFile && (
                    <button onClick={() => fileInputRef.current?.click()}>
                        <AttachFileIcon/>
                    </button>
                )}
                <div className="chat-input-wrapper">
                    {selectedFile ? (
                        <div className="file-preview-chip">
                            <span className="file-chip-icon">{getFileIcon(selectedFile.type)}</span>
                            <span className="file-chip-name">{selectedFile.name}</span>
                            <span className="file-chip-size">({formatFileSize(selectedFile.size)})</span>
                            <button 
                                className="file-chip-clear"
                                onClick={clearSelectedFile}
                                title="Remove file"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                            placeholder="Message · @ai <question> · @ai from chat <question>"
                        />
                    )}
                </div>
                <button onClick={sendMessage}><SendIcon sx={{ fontSize: '1.2rem' }} /></button>
            </div>
        </div>
    );
}
