
import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Project, ctaLabels } from '../data/projects';

const ProjectCard: React.FC<{ project: Project; className?: string }> = ({ project, className = '' }) => {
   const cta = ctaLabels[project.ctaKind];
   return (
      <a
         href={project.primaryUrl}
         target="_blank"
         rel="noreferrer"
         aria-label={`${project.title} — ${cta} (새 탭에서 열기)`}
         className={`group flex flex-col bg-white dark:bg-nightcard rounded-3xl border border-slate-100 dark:border-white/10 shadow-[0_2px_16px_rgba(16,24,40,0.06)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(16,24,40,0.12)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] ${className}`}
      >
         <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
               src={project.image}
               alt={project.imageAlt}
               loading="lazy"
               className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
         </div>
         <div className="flex flex-col flex-grow p-5">
            <div className="flex items-center justify-between gap-2 mb-2">
               <h3 className="text-lg font-extrabold text-ink dark:text-white tracking-tight">{project.title}</h3>
               <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-muted dark:text-slate-300">
                  {project.category}
               </span>
            </div>
            <p className="text-sm text-muted dark:text-slate-400 leading-relaxed flex-grow">{project.oneLiner}</p>
            <div className="flex items-center gap-1.5 mt-4 text-[13px] font-bold text-brand">
               <span>{cta}</span>
               <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
         </div>
      </a>
   );
};

export default ProjectCard;
