
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { checkIsBanned, getVisitorIpInfo } from '../services/api';
import { MessageSquare, Heart, Eye, Edit2, Trash2, Search, X } from 'lucide-react';

interface Post {
    id: string;
    title: string;
    content: string;
    author_name: string;
    views: number;
    likes: number;
    created_at: string;
    comment_count?: number;
}

interface Comment {
    id: string;
    post_id: string;
    content: string;
    author_name: string;
    created_at: string;
}

interface FreeBoardProps {
    isDarkMode: boolean;
}

const FreeBoard: React.FC<FreeBoardProps> = ({ isDarkMode }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [view, setView] = useState<'list' | 'write' | 'detail'>('list');
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);

    // Form States
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [password, setPassword] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [commentContent, setCommentContent] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select('*, comments(count)')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching posts:', error);
        else {
            const formattedData = data.map(post => ({
                ...post,
                comment_count: post.comments?.[0]?.count || 0
            }));
            setPosts(formattedData);
        }
    };

    const handleWrite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content || !authorName || !password) return;

        // Ban Check
        const visitor = await getVisitorIpInfo();
        const banStatus = await checkIsBanned(visitor.ip, authorName);
        if (banStatus.banned) {
            alert(`차단된 사용자입니다.\n사유: ${banStatus.reason}`);
            return;
        }

        const { error } = await supabase
            .from('posts')
            .insert([{ title, content, author_name: authorName, password }]);

        if (error) {
            alert('작성 실패: ' + error.message);
        } else {
            fetchPosts();
            setView('list');
            resetForm();
        }
    };

    const handlePostClick = async (post: Post) => {
        // Increment view count
        await supabase.from('posts').update({ views: post.views + 1 }).eq('id', post.id);

        // Fetch comments
        const { data: commentData } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });

        setSelectedPost({ ...post, views: post.views + 1 });
        setComments(commentData || []);
        setView('detail');
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent || !selectedPost || !authorName || !password) return;

        // Ban Check
        const visitor = await getVisitorIpInfo();
        const banStatus = await checkIsBanned(visitor.ip, authorName);
        if (banStatus.banned) {
            alert(`차단된 사용자입니다.\n사유: ${banStatus.reason}`);
            return;
        }

        const { error } = await supabase.from('comments').insert([{
            post_id: selectedPost.id,
            content: commentContent,
            author_name: authorName,
            password
        }]);

        if (!error) {
            const { data: newComments } = await supabase
                .from('comments')
                .select('*')
                .eq('post_id', selectedPost.id)
                .order('created_at', { ascending: true });

            setComments(newComments || []);
            setCommentContent('');
        }
    };

    const handleDelete = async () => {
        const inputPwd = prompt('비밀번호를 입력하세요:');
        if (!inputPwd || !selectedPost) return;

        // Check password (simple client-side check for this demo, ideally server-side RPC)
        const { data } = await supabase
            .from('posts')
            .select('password')
            .eq('id', selectedPost.id)
            .single();

        if (data && data.password === inputPwd) {
            await supabase.from('posts').delete().eq('id', selectedPost.id);
            alert('삭제되었습니다.');
            setView('list');
            fetchPosts();
        } else {
            alert('비밀번호가 일치하지 않습니다.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setAuthorName('');
        setPassword('');
    };

    const theme = isDarkMode ? {
        text: 'text-white',
        subText: 'text-gray-400',
        bg: 'bg-[#1e1e1e]',
        border: 'border-gray-700',
        hover: 'hover:bg-[#2a2a2a]',
        input: 'bg-[#2a2a2a] text-white border-gray-600',
        button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        card: 'bg-[#1a1a1a]',
    } : {
        text: 'text-slate-900',
        subText: 'text-slate-500',
        bg: 'bg-white',
        border: 'border-slate-200',
        hover: 'hover:bg-slate-50',
        input: 'bg-white text-slate-900 border-slate-200',
        button: 'bg-slate-900 hover:bg-slate-800 text-white',
        card: 'bg-white',
    };

    // --- List View ---
    if (view === 'list') {
        return (
            <div className={`w-full max-w-5xl mx-auto rounded-3xl ${theme.bg} border ${theme.border} overflow-hidden shadow-sm`}>
                <div className={`p-6 border-b ${theme.border} flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30`}>
                    <h2 className={`text-2xl font-bold ${theme.text}`}>📋 자유게시판</h2>
                    <button
                        onClick={() => setView('write')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2 ${theme.button}`}
                    >
                        <Edit2 size={16} /> 글쓰기
                    </button>
                </div>

                {/* Search Bar (Visual Only for now) */}
                <div className={`p-4 border-b ${theme.border} ${isDarkMode ? 'bg-[#121212]' : 'bg-slate-50'} flex gap-2`}>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요..."
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${theme.input} ${theme.subText}`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {posts.filter(p => p.title.includes(searchQuery)).map(post => (
                        <div
                            key={post.id}
                            onClick={() => handlePostClick(post)}
                            className={`p-5 cursor-pointer transition-colors flex items-center justify-between group ${theme.hover}`}
                        >
                            <div className="flex-1 min-w-0 pr-4">
                                <h3 className={`font-bold text-lg mb-1 truncate group-hover:text-indigo-500 transition-colors ${theme.text}`}>
                                    {post.title}
                                    {post.comment_count! > 0 && <span className="ml-2 text-sm text-indigo-500 font-medium">[{post.comment_count}]</span>}
                                </h3>
                                <div className={`flex items-center gap-3 text-xs ${theme.subText}`}>
                                    <span>{post.author_name}</span>
                                    <span>•</span>
                                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 text-xs font-medium ${theme.subText}`}>
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                    <Eye size={14} /> {post.views}
                                </div>
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                                    <Heart size={14} /> {post.likes}
                                </div>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            게시글이 없습니다. 첫 글을 작성해보세요!
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Write View ---
    if (view === 'write') {
        return (
            <div className={`w-full max-w-3xl mx-auto rounded-3xl ${theme.bg} border ${theme.border} p-6 shadow-xl`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold ${theme.text}`}>✍️ 새 글 작성</h2>
                    <button onClick={() => setView('list')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X size={24} className={theme.subText} />
                    </button>
                </div>
                <form onSubmit={handleWrite} className="space-y-4">
                    <input
                        type="text"
                        placeholder="제목"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className={`w-full p-4 text-lg font-bold rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme.input}`}
                        required
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="작성자명"
                            value={authorName}
                            onChange={e => setAuthorName(e.target.value)}
                            className={`flex-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme.input}`}
                            required
                        />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={`w-1/3 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme.input}`}
                            required
                        />
                    </div>
                    <textarea
                        placeholder="내용을 자유롭게 작성해주세요."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className={`w-full p-4 h-64 rounded-xl border resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 ${theme.input}`}
                        required
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setView('list')}
                            className={`px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 ${theme.button}`}
                        >
                            등록하기
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // --- Detail View ---
    if (view === 'detail' && selectedPost) {
        return (
            <div className={`w-full max-w-4xl mx-auto rounded-3xl ${theme.bg} border ${theme.border} overflow-hidden shadow-xl`}>
                {/* Header */}
                <div className={`p-8 border-b ${theme.border}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h1 className={`text-3xl font-black leading-tight ${theme.text}`}>{selectedPost.title}</h1>
                        <button onClick={() => setView('list')} className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            <X size={24} className={theme.subText} />
                        </button>
                    </div>
                    <div className={`flex items-center justify-between text-sm ${theme.subText}`}>
                        <div className="flex items-center gap-4">
                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedPost.author_name}</span>
                            <span>{new Date(selectedPost.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="flex items-center gap-1"><Eye size={14} /> {selectedPost.views}</span>
                            {/* <span className="flex items-center gap-1 text-red-500"><Heart size={14} /> {selectedPost.likes}</span> */}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className={`p-8 min-h-[300px] whitespace-pre-wrap leading-relaxed ${theme.text}`}>
                    {selectedPost.content}
                </div>

                {/* Actions */}
                <div className={`px-8 py-4 border-t border-b ${theme.border} flex justify-end gap-2 bg-gray-50/50 dark:bg-black/20`}>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 font-medium transition-colors text-sm"
                    >
                        <Trash2 size={16} /> 삭제
                    </button>
                </div>

                {/* Comments */}
                <div className={`p-8 ${isDarkMode ? 'bg-[#151515]' : 'bg-gray-50'}`}>
                    <h3 className={`font-bold mb-6 flex items-center gap-2 ${theme.text}`}>
                        <MessageSquare size={18} /> 댓글 {comments.length}
                    </h3>

                    {/* Comment Form */}
                    <div className={`mb-8 p-4 rounded-xl border ${theme.border} ${theme.card}`}>
                        <form onSubmit={handleCommentSubmit}>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="닉네임"
                                    value={authorName}
                                    onChange={e => setAuthorName(e.target.value)}
                                    className={`w-1/3 p-2 text-sm rounded-lg border focus:outline-none ${theme.input}`}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="비밀번호"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className={`w-1/3 p-2 text-sm rounded-lg border focus:outline-none ${theme.input}`}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="댓글을 남겨주세요..."
                                    value={commentContent}
                                    onChange={e => setCommentContent(e.target.value)}
                                    className={`flex-1 p-3 rounded-lg border focus:outline-none ${theme.input} text-sm`}
                                    required
                                />
                                <button className={`px-4 py-2 rounded-lg font-bold text-sm ${theme.button}`}>
                                    등록
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <div key={comment.id} className={`p-4 rounded-xl border ${theme.border} ${theme.card}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`font-bold text-sm ${theme.text}`}>{comment.author_name}</span>
                                    <span className={`text-xs ${theme.subText}`}>{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className={`text-sm ${theme.text}`}>{comment.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default FreeBoard;
