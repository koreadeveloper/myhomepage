
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Github, Globe } from 'lucide-react';
import { site } from '../data/site';
import { projects } from '../data/projects';

const About: React.FC = () => {
   return (
      <div className="min-h-screen bg-paper dark:bg-night">
         <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 md:pt-40">
            <Link to="/" className="reveal inline-flex items-center gap-1.5 text-[13px] font-bold text-muted dark:text-slate-400 hover:text-brand transition-colors mb-8">
               <ArrowLeft size={15} /> 홈으로
            </Link>

            <p className="reveal reveal-1 text-xs font-black tracking-[0.25em] text-brand mb-4">ABOUT</p>
            <h1 className="reveal reveal-2 text-3xl md:text-5xl font-black text-ink dark:text-white tracking-tight mb-6">
               {site.handle}
            </h1>
            <p className="reveal reveal-3 text-base md:text-lg text-muted dark:text-slate-400 leading-relaxed mb-16">
               아이디어를 웹 서비스로 옮기는 걸 좋아하는 개발자입니다.
               캠퍼스에서 필요한 도구부터 진로 탐색, 3D 웹 경험, 브라우저 확장, 로컬 AI 도구까지
               작게 시작해 쓸 수 있는 것으로 만드는 작업을 하고 있습니다.
            </p>

            {/* 프로젝트에서의 역할 */}
            <section className="reveal reveal-4 mb-16">
               <h2 className="text-xl font-extrabold text-ink dark:text-white tracking-tight mb-6">프로젝트와 역할</h2>
               <ul className="space-y-4">
                  {projects.map((p) => (
                     <li key={p.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                        <span className="text-sm font-bold text-ink dark:text-white sm:w-40 shrink-0">{p.title}</span>
                        <span className="text-sm text-muted dark:text-slate-400">
                           {p.oneLiner}
                           {p.credit && <span className="text-brand font-bold"> · {p.credit}</span>}
                        </span>
                     </li>
                  ))}
               </ul>
            </section>

            {/* 연결 */}
            <section className="reveal reveal-5">
               <h2 className="text-xl font-extrabold text-ink dark:text-white tracking-tight mb-6">연결</h2>
               <div className="flex flex-wrap gap-3">
                  <a
                     href={site.github}
                     target="_blank"
                     rel="noreferrer"
                     aria-label="GitHub 프로필 (새 탭에서 열기)"
                     className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-ink dark:bg-white text-white dark:text-ink text-sm font-bold hover:bg-brand dark:hover:bg-brand dark:hover:text-white transition-colors"
                  >
                     <Github size={16} /> GitHub
                  </a>
                  <Link
                     to="/projects"
                     className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-muted dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-brand hover:text-brand transition-colors"
                  >
                     <Globe size={16} /> 프로젝트 보기
                  </Link>
               </div>
            </section>
         </div>
      </div>
   );
};

export default About;
