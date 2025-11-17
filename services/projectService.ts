// services/projectService.ts
import { ProjectData, ProjectMetadata, Suggestion, UploadedImage, SeoAnalysis, HtmlHistory } from '../types';
import { CONFIG } from '../config/constants';

/**
 * Downloads the current project state as a JSON file.
 */
export const downloadProject = (project: ProjectData): void => {
  try {
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '-')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download project:", error);
    alert("Error creating project file for download.");
  }
};

/**
 * Loads a project from a user-selected file.
 */
export const loadProjectFromFile = (file: File): Promise<ProjectData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          throw new Error('File is empty');
        }
        const data = JSON.parse(text);
        
        // Restore Date objects
        data.createdAt = new Date(data.createdAt);
        data.updatedAt = new Date(data.updatedAt);
        data.history = data.history.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        }));
        
        // Basic validation
        if (!data.id || typeof data.html !== 'string' || !Array.isArray(data.history)) {
            throw new Error('File does not appear to be a valid project file.');
        }

        resolve(data as ProjectData);
      } catch (err) {
        reject(new Error('Invalid project file format. ' + (err instanceof Error ? err.message : '')));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Creates a ProjectData object from the current application state.
 */
export const createProjectData = (
  name: string,
  html: string,
  suggestions: Suggestion[],
  images: UploadedImage[],
  seoAnalysis: SeoAnalysis | null,
  history: HtmlHistory[],
  historyIndex: number,
  tags: string[] = [],
  notes: string = ''
): ProjectData => {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
    html,
    suggestions,
    images: images.map(({ file, ...rest }) => rest), // Exclude the File object
    seoAnalysis,
    history,
    historyIndex,
    tags,
    notes,
  };
};

/**
 * Saves a list of recent project metadata to localStorage.
 */
export const saveRecentProjects = (projects: ProjectMetadata[]): void => {
  try {
    const json = JSON.stringify(projects.slice(0, CONFIG.UI.RECENT_PROJECTS_LIMIT));
    localStorage.setItem(CONFIG.STORAGE.PROJECTS_KEY, json);
  } catch (err) {
    console.error('Failed to save recent projects:', err);
  }
};

/**
 * Loads the list of recent project metadata from localStorage.
 */
export const loadRecentProjects = (): ProjectMetadata[] => {
  try {
    const json = localStorage.getItem(CONFIG.STORAGE.PROJECTS_KEY);
    if (!json) return [];
    
    const data = JSON.parse(json);
    // Restore Date objects
    return data.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  } catch (err) {
    console.error('Failed to load recent projects:', err);
    return [];
  }
};
