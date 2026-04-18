import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = "https://localhost:44306/api";

export default function PostEditor({ onPostCreated, quoteContent, clearQuote, currentUserEmail }) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const quillRef = useRef(null);

    useEffect(() => {
        if (quoteContent) {
            setContent(`<blockquote>${quoteContent}</blockquote><p><br></p>`);
            setTimeout(() => {
                if (quillRef.current) quillRef.current.focus();
            }, 100);
        }
    }, [quoteContent]);

    const editorModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            ['blockquote', 'link'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Защита от празни постове
        const plainText = content.replace(/<[^>]+>/g, '').trim();
        if (!plainText && !content.includes('<img')) return;

        setIsSubmitting(true);
        const token = localStorage.getItem('jwtToken');

        const res = await fetch(`${API_URL}/Feed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        if (res.ok) {
            setContent('');
            clearQuote();
            onPostCreated();
        }
        setIsSubmitting(false);
    };

    const displayInitial = currentUserEmail ? currentUserEmail.charAt(0).toUpperCase() : '?';

    return (
        <div className="card border-0 rounded-4 mb-5 shadow-lg editor-card position-relative">
            <div className="card-body p-0 d-flex flex-column">
                
                <form onSubmit={handleSubmit}>
                    <div className="d-flex p-3 pb-0">
                        {/* Аватар на потребителя */}
                        <div className="me-3 d-none d-sm-block">
                            <div className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold shadow-sm" style={{ width: '45px', height: '45px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', fontSize: '1.2rem' }}>
                                {displayInitial}
                            </div>
                        </div>
                        
                        {/* Самото поле за писане */}
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={editorModules}
                                placeholder="What's happening in the football world?"
                            />
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center p-3 mt-2 border-top border-secondary bg-dark" style={{ borderRadius: '0 0 1rem 1rem' }}>
                        <div>
                            {quoteContent && (
                                <button type="button" className="btn btn-sm btn-outline-danger rounded-pill fw-bold px-3 shadow-none" onClick={() => { clearQuote(); setContent(''); }}>
                                    <i className="bi bi-x-circle-fill me-1"></i> Cancel Quote
                                </button>
                            )}
                        </div>
                        
                        <button type="submit" className="btn btn-info text-dark fw-bold rounded-pill px-4 shadow hover-scale" disabled={!content || content === '<p><br></p>' || isSubmitting}>
                            {isSubmitting ? 'Posting...' : 'Post Update'} <i className="bi bi-send-fill ms-1"></i>
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}