
import React, { useState, useEffect } from 'react';
import { Post } from '../types';

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('community_posts');
    if (saved) setPosts(JSON.parse(saved));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !content) return;
    const newPost: Post = {
      id: Date.now().toString(),
      author,
      content,
      timestamp: Date.now(),
    };
    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem('community_posts', JSON.stringify(updated));
    setAuthor('');
    setContent('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 h-full overflow-y-auto pb-24">
      <h1 className="text-3xl font-black mb-8 text-slate-900">sia.kr 커뮤니티</h1>
      
      <form onSubmit={handleSubmit} className="mb-12 glass-card p-8 rounded-3xl shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">작성자 이름</label>
          <input 
            type="text" 
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full border-b border-slate-200 outline-none py-2 focus:border-indigo-500 transition-colors"
            placeholder="이름을 입력하세요"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-400 mb-2">메시지</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border-b border-slate-200 outline-none py-2 h-24 resize-none focus:border-indigo-500 transition-colors"
            placeholder="여기에 생각이나 정보를 공유해보세요..."
          />
        </div>
        <button 
          type="submit" 
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors"
        >
          게시물 등록하기
        </button>
      </form>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-slate-400 py-20 border-2 border-dashed border-slate-100 rounded-3xl font-medium">아직 게시물이 없습니다. 첫 번째 소식을 남겨보세요!</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <span className="font-black text-slate-900">{post.author}</span>
                <span className="text-xs text-slate-400">{new Date(post.timestamp).toLocaleDateString('ko-KR')}</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;
