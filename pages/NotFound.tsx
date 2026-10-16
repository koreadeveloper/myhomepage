import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound: React.FC = () => {
  useEffect(() => {
    document.title = '페이지를 찾을 수 없음 — sia.kr';
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[80px] font-black leading-none text-brand/20 dark:text-brand/30 select-none">404</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight text-ink dark:text-white">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-3 text-sm text-muted dark:text-slate-400 max-w-xs">
        주소가 바뀌었거나 삭제된 페이지일 수 있어요.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand text-white text-sm font-bold hover:opacity-90 transition-opacity"
      >
        <Compass size={16} />
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default NotFound;
