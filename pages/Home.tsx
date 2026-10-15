
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Github, Gamepad2, BarChart3 } from 'lucide-react';
import { site } from '../data/site';
import { featuredProjects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';

const Home: React.FC = () => {
   const location = useLocation();

   // /#projects 진입 시 카드 영역으로 스크롤
   useEffect(() => {
      if (location.hash === '#projects') {
         document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
      }
   }, [location.hash]);

   return (
      <div className="min-h-screen bg-paper dark:bg-night">
         {/* ── 히어로 ── */}
         <section className="relative">
            <div className="aurora" aria-hidden="true" />
            <div className="relative max-w-6xl mx-auto px-6 pt-36 pb-16 md:pt-44 md:pb-20">
               <div className="lg:flex lg:items-end lg:justify-between lg:gap-10">
                  <div className="max-w-2xl">
                     <p className="reveal reveal-1 text-xs font-black tracking-[0.25em] text-brand mb-5">{site.eyebrow}</p>
                     <h1 className="reveal reveal-2 text-4xl md:text-6xl font-black text-ink dark:text-white tracking-tight leading-[1.15] mb-6">
                        {site.headline}
                     </h1>
                     <p className="reveal reveal-3 text-base md:text-lg text-muted dark:text-slate-400 leading-relaxed mb-8">
                        {site.heroDescription}
                     </p>
                     <div className="reveal reveal-4 flex flex-wrap items-center gap-3">
                        <a
                           href="#projects"
                           className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-ink dark:bg-white text-white dark:text-ink text-sm font-bold hover:bg-brand dark:hover:bg-brand dark:hover:text-white transition-colors"
                        >
                           프로젝트 보기 <ArrowRight size={16} />
                        </a>
                        <Link
                           to="/about"
                           className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-muted dark:text-slate-300 hover:text-ink dark:hover:text-white transition-colors"
                        >
                           만든 사람 소개
                        </Link>
                     </div>
                  </div>

                  {/* 진행 중 프로젝트 수 — 글래스 스탯 카드 */}
                  <Link
                     to="/projects"
                     className="reveal reveal-5 glass rounded-3xl p-6 mt-8 lg:mt-0 lg:w-60 shrink-0 block group"
                     aria-label={`${site.statsLabel} ${featuredProjects.length}개 — 전체 목록 보기`}
                  >
                     <span className="block text-5xl font-black text-ink dark:text-white tracking-tight mb-2">{featuredProjects.length}</span>
                     <span className="flex items-center justify-between text-[13px] font-bold text-muted dark:text-slate-300">
                        {site.statsLabel}
                        <ArrowRight size={15} className="text-brand transition-transform duration-300 group-hover:translate-x-0.5" />
                     </span>
                  </Link>
               </div>
            </div>
         </section>

         {/* ── 프로젝트 6개 ── */}
         <section id="projects" className="scroll-mt-28 max-w-6xl mx-auto px-6 pb-16">
            <div className="flex items-end justify-between mb-8">
               <h2 className="text-2xl font-extrabold text-ink dark:text-white tracking-tight">프로젝트</h2>
               <Link to="/projects" className="text-[13px] font-bold text-muted dark:text-slate-400 hover:text-brand transition-colors">
                  {featuredProjects.length}개 모두 보기
               </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {featuredProjects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} className={`reveal reveal-${Math.min(i + 1, 6)}`} />
               ))}
            </div>

            {/* 전체 목록 CTA */}
            <div className="reveal flex justify-center mt-12">
               <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand text-white text-sm font-bold shadow-[0_8px_24px_rgba(104,70,255,0.35)] hover:shadow-[0_12px_32px_rgba(104,70,255,0.45)] hover:-translate-y-0.5 transition-all"
               >
                  모든 프로젝트 보기 <ArrowRight size={16} />
               </Link>
            </div>
         </section>

         {/* ── 푸터 ── */}
         <footer className="border-t border-slate-100 dark:border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
               <span className="text-xs text-muted dark:text-slate-500">© 2026 {site.name}</span>
               <div className="flex items-center gap-5">
                  <a
                     href={site.github}
                     target="_blank"
                     rel="noreferrer"
                     aria-label="GitHub 프로필 (새 탭에서 열기)"
                     className="inline-flex items-center gap-1.5 text-xs font-bold text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white transition-colors"
                  >
                     <Github size={14} /> GitHub
                  </a>
                  <Link
                     to="/gamezone"
                     className="inline-flex items-center gap-1.5 text-xs font-bold text-muted dark:text-slate-400 hover:text-brand transition-colors"
                  >
                     <Gamepad2 size={14} /> 게임존
                  </Link>
                  <Link
                     to="/stats"
                     className="inline-flex items-center gap-1.5 text-xs font-bold text-muted dark:text-slate-400 hover:text-brand transition-colors"
                  >
                     <BarChart3 size={14} /> 통계
                  </Link>
               </div>
            </div>
         </footer>
      </div>
   );
};

export default Home;
