import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = "https://localhost:44306/api";

export default function PostEditor({ onPostCreated, quoteContent, clearQuote }) {
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
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content || content === '<p><br></p>') return;

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

    return (
        <div className="card border-0 rounded-4 mb-4 shadow-lg editor-card">
            <div className="card-body p-0">
                <form onSubmit={handleSubmit}>
                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={editorModules}
                        placeholder="What's happening in the football world?"
                    />
                    <div className="d-flex justify-content-between align-items-center p-3 border-top border-secondary" style={{ backgroundColor: '#1e293b' }}>
                        <div>
                            {quoteContent && (
                                <button type="button" className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => { clearQuote(); setContent(''); }}>
                                    Cancel Quote ✖
                                </button>
                            )}
                        </div>
                        <button type="submit" className="btn btn-info text-dark fw-bold rounded-pill px-5 shadow" disabled={!content || content === '<p><br></p>' || isSubmitting}>
                            {isSubmitting ? 'Posting...' : 'Post Update'} <i className="bi bi-send-fill ms-1"></i>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}