import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../api/client';
import { PreparationTask } from '../types';

export const RoadmapPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: roadmap, isLoading } = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => api.getRoadmap(),
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      api.updateRoadmapTask(taskId, { is_completed: completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const categoryLabels: Record<string, string> = {
    all: 'All Tasks',
    resume_improvements: 'Resume Improvements',
    technical_skills: 'Technical Skills',
    dsa_coding: 'DSA & Coding Practice',
    project_explanations: 'Project Explanations',
    hr_behavioral: 'Behavioral & STAR',
    communication_practice: 'Communication Practice',
  };

  // Flatten all tasks
  const allTasks: PreparationTask[] = [];
  if (roadmap?.categories) {
    Object.values(roadmap.categories).forEach((taskList: any) => {
      allTasks.push(...taskList);
    });
  }

  const filteredTasks =
    selectedCategory === 'all'
      ? allTasks
      : allTasks.filter((t) => t.category === selectedCategory);

  const completionPercentage = roadmap?.completion_percentage || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header & Overall Progress */}
      <div className="bg-surface border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Personalized Placement Plan</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Preparation Roadmap</h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized milestones generated from your resume gaps, target role, and mock interview performance.
          </p>
        </div>

        <div className="flex items-center space-x-4 min-w-[200px]">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Completion</span>
              <span className="text-primary">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {roadmap?.completed_tasks || 0} of {roadmap?.total_tasks || 0} tasks finished
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === key
                ? 'bg-primary text-white shadow-xs'
                : 'bg-surface border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 bg-surface border rounded-xl transition-all shadow-subtle flex items-start justify-between gap-4 ${
                task.is_completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() =>
                    toggleTaskMutation.mutate({ taskId: task.id, completed: !task.is_completed })
                  }
                  className="mt-0.5 text-slate-400 hover:text-primary transition-colors flex-shrink-0"
                >
                  {task.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3
                      className={`text-xs font-bold ${
                        task.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'
                      }`}
                    >
                      {task.title}
                    </h3>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                        task.priority === 'high'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-indigo-50 text-primary border border-indigo-200'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
                  {task.supporting_resources && task.supporting_resources.length > 0 && (
                    <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-400">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      <span>{task.supporting_resources.join(' • ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-slate-400 flex-shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{task.estimated_duration_minutes}m</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs bg-surface border border-slate-200 rounded-2xl">
            No tasks found in this category.
          </div>
        )}
      </div>
    </div>
  );
};
