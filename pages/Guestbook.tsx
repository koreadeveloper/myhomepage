
import React, { useState, useEffect } from 'react';
import { Post } from '../types';

const Guestbook: React.FC = () => {
  const [comments, setComments] = useState<Post[]>([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('guestbook_comments');
    if (saved) setComments(JSON.parse(saved));
  }, []);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) return;
    const newComment: Post = {
      id: Date.now().toString(),
      author: name,
      content: comment,
      timestamp: Date.now(),
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    localStorage.setItem('guestbook_comments', JSON.stringify(updated));
    setName('');
    setComment('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 h-full overflow-y-auto pb-24">
      <h1 className="text-3xl font-black mb-2 text-slate-900">sia.kr 방명록</h1>
      <p className="text-slate-500 mb-12 font-medium">방문 흔적을 남겨주세요. 모든 응원이 큰 힘이 됩니다.</p>
      
      <div className="bg-white p-8 mb-12 rounded-3xl shadow-sm border border-slate-100">
        <form onSubmit={handleAddComment} className="space-y-4">
          <input 
            type="text" 
            placeholder="이름" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm"
          />
          <textarea 
            placeholder="따뜻한 한마디를 남겨주세요..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-indigo-500 outline-none h-32 resize-none transition-all text-sm"
          />
          <button className="w-full bg-slate-900 text-white p-4 rounded-xl font-black tracking-widest hover:bg-black transition-colors uppercase text-sm">
            방명록 남기기
          </button>
        </form>
      </div>

      <div className="space-y-8">
        {comments.map((c) => (
          <div key={c.id} className="relative pl-6">
            <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500 rounded-full"></div>
            <div className="mb-2 flex items-baseline gap-3">
              <span className="font-black text-slate-900">{c.author}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                {new Date(c.timestamp).toLocaleString('ko-KR')}
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
            <p className="text-center text-slate-300 py-10 font-bold">아직 작성된 방명록이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default Guestbook;
