import React, { useState, FC, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import { supabase, isSupabaseConfigured } from './supabase.config';

// --- DEXIE / INDEXEDDB SETUP ---
declare var Dexie: any;
interface AppData {
    key: string;
    value: any;
}

class NoteLoomDB extends Dexie {
    appData!: any; // Dexie.Table<AppData, string>

    constructor() {
        super('noteloomDB');
        this.version(1).stores({
            appData: 'key', // Primary key
        });
    }
}

const db = new NoteLoomDB();


// --- STYLES ---
const GlobalStyles = `
  :root {
    /* Base variables controlled by settings */
    --font-family: 'Inter', sans-serif;
    --font-size: 16px;
    --line-spacing: 1.6;
    --text-width: 70ch;
    --accent-primary: #4a90e2;

    /* Light Theme Colors */
    --bg-primary-light: #f4f5f7;
    --bg-secondary-light: #ffffff;
    --bg-tertiary-light: #e9ecef;
    --text-primary-light: #121212;
    --text-secondary-light: #5a6472;
    --border-color-light: #dee2e6;

    /* Dark Theme Colors */
    --bg-primary-dark: #1a1d21;
    --bg-secondary-dark: #24282e;
    --bg-tertiary-dark: #2e333a;
    --text-primary-dark: #e2e2e2;
    --text-secondary-dark: #a0a0a0;
    --border-color-dark: #3a4048;

    /* General variables */
    --danger: #e24a4a;
    --star-color: #f2c94c;
    --accent-secondary: #50e3c2;

    /* Default to dark theme variables */
    --bg-primary: var(--bg-primary-dark);
    --bg-secondary: var(--bg-secondary-dark);
    --bg-tertiary: var(--bg-tertiary-dark);
    --text-primary: var(--text-primary-dark);
    --text-secondary: var(--text-secondary-dark);
    --border-color: var(--border-color-dark);
  }

  body.light-theme {
    --bg-primary: var(--bg-primary-light);
    --bg-secondary: var(--bg-secondary-light);
    --bg-tertiary: var(--bg-tertiary-light);
    --text-primary: var(--text-primary-light);
    --text-secondary: var(--text-secondary-light);
    --border-color: var(--border-color-light);
  }
  
  body.dark-theme {
    --bg-primary: var(--bg-primary-dark);
    --bg-secondary: var(--bg-secondary-dark);
    --bg-tertiary: var(--bg-tertiary-dark);
    --text-primary: var(--text-primary-dark);
    --text-secondary: var(--text-secondary-dark);
    --border-color: var(--border-color-dark);
  }
  
  @media (prefers-color-scheme: dark) {
    body.auto-theme {
      --bg-primary: var(--bg-primary-dark);
      --bg-secondary: var(--bg-secondary-dark);
      --bg-tertiary: var(--bg-tertiary-dark);
      --text-primary: var(--text-primary-dark);
      --text-secondary: var(--text-secondary-dark);
      --border-color: var(--border-color-dark);
    }
  }

  @media (prefers-color-scheme: light) {
    body.auto-theme {
      --bg-primary: var(--bg-primary-light);
      --bg-secondary: var(--bg-secondary-light);
      --bg-tertiary: var(--bg-tertiary-light);
      --text-primary: var(--text-primary-light);
      --text-secondary: var(--text-secondary-light);
      --border-color: var(--border-color-light);
    }
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-family);
    font-size: var(--font-size);
    line-height: var(--line-spacing);
    overscroll-behavior: none;
    transition: background-color 0.2s, color 0.2s;
  }
  
  .main-content > div > div > p, .main-content > div > h2, .main-content > div > div > div > div > h3, .main-content > div > div > div > div > p {
     max-width: var(--text-width);
  }

  #root {
    display: flex;
    height: 100vh;
    width: 100vw;
  }

  h1, h2, h3, h4, h5, h6 {
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: 0.5em;
  }
  
  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.25rem; }
  h4 { font-size: 1rem; }


  button {
    font-family: var(--font-family);
    background-color: var(--accent-primary);
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.2s ease, opacity 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  button:disabled {
    background-color: var(--bg-tertiary);
    cursor: not-allowed;
    opacity: 0.6;
  }

  button:hover:not(:disabled) {
    filter: brightness(1.1);
  }
  
  button.secondary {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
  }
  
  button.danger {
    background-color: var(--danger);
  }
  
  input, textarea, select {
    font-family: var(--font-family);
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 10px;
    font-size: 1rem;
    width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  textarea {
      min-height: 120px;
      resize: vertical;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-primary) 30%, transparent);
  }
  
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 8px;
    background: var(--bg-tertiary);
    border-radius: 5px;
    outline: none;
    padding: 0;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: var(--accent-primary);
    cursor: pointer;
    border-radius: 50%;
  }

  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: var(--accent-primary);
    cursor: pointer;
    border-radius: 50%;
  }

  input[type="color"] {
    padding: 2px;
    height: 32px;
    cursor: pointer;
    background-color: transparent;
    border: none;
  }
  
  .app-container {
      display: flex;
      width: 100%;
      height: 100%;
      position: relative;
  }

  .main-content {
      flex-grow: 1;
      height: 100vh;
      overflow-y: auto;
      padding: 2rem;
      transition: margin-left 0.3s ease;
  }
  
  .sidebar {
      width: 280px;
      flex-shrink: 0;
      background-color: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      transition: transform 0.3s ease-in-out, width 0.3s ease;
      z-index: 1002;
  }
  
  .hamburger-menu {
      display: none;
      position: fixed;
      top: 1.5rem;
      left: 1.5rem;
      z-index: 1003;
      background: var(--bg-secondary);
      border-radius: 50%;
      width: 44px;
      height: 44px;
      padding: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  
  .sidebar-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 1001;
  }
  
  .sidebar-content-wrapper {
    padding: 1rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      left: 0; top: 0; bottom: 0;
      transform: translateX(-100%);
      height: 100vh;
    }
    .sidebar.open {
      transform: translateX(0);
    }
    .sidebar.open .sidebar-content-wrapper {
      padding-top: 5rem;
    }
    .main-content {
      padding: 1.5rem;
      padding-top: 5rem;
    }
    .hamburger-menu {
      display: flex;
    }
    .sidebar-overlay.open {
      display: block;
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1010;
  }

  .modal-content {
    background-color: var(--bg-secondary);
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    border: 1px solid var(--border-color);
  }
  
  .form-group {
      margin-bottom: 1.5rem;
  }
  
  @keyframes pulse {
    0%, 100% {
      box-shadow: 0 0 10px rgba(220, 53, 69, 0.5);
    }
    50% {
      box-shadow: 0 0 20px rgba(220, 53, 69, 0.8);
    }
  }
  
  .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-secondary);
  }
  
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 2rem;
  }
  
  .tab {
    padding: 10px 20px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    color: var(--text-secondary);
  }
  
  .tab.active {
    color: var(--accent-primary);
    border-bottom-color: var(--accent-primary);
  }

  .entry-card.comfortable {
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .entry-card.compact {
    padding: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .export-menu, .profile-menu {
    position: absolute;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10;
    overflow: hidden;
  }

  .export-menu {
    top: 2.5rem;
    right: 1rem;
    width: 150px;
  }

  .profile-menu {
    bottom: 100%;
    margin-bottom: 0.5rem;
    left: 0;
    width: 100%;
  }
  
  .export-menu button, .profile-menu button {
    background: none;
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
    border-radius: 0;
    color: var(--text-primary);
  }
  
  .export-menu button:hover, .profile-menu button:hover {
    background-color: var(--bg-tertiary);
  }

  .profile-menu .profile-menu-item {
    padding: 0.75rem 1rem;
    cursor: pointer;
  }
  .profile-menu .profile-menu-item:hover {
    background-color: var(--bg-tertiary);
  }
  .profile-menu .profile-menu-item.active {
    background-color: var(--accent-primary);
    color: white;
  }

  /* Drag and Drop styles */
  .draggable-item {
      transition: background-color 0.2s, border-top 0.2s;
  }

  .drag-handle {
      cursor: grab;
      color: var(--text-secondary);
      padding: 0 0.5rem;
      align-self: stretch;
      display: flex;
      align-items: center;
      border-radius: 4px;
      touch-action: none; /* Prevents scrolling on touch devices */
  }
  .drag-handle:hover {
      background-color: var(--bg-tertiary);
  }
  
  .draggable-item.dragging {
      opacity: 0.5;
      background-color: var(--bg-tertiary);
  }
  
  .draggable-item.drag-over-active {
      border-top: 2px dashed var(--accent-primary);
  }

  .block-editor-item {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
  }

  .block-editor-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
  }
  
  /* Rich Text Editor Styles */
  .rich-text-editor-container {
    border: 1px solid var(--border-color);
    border-radius: 6px;
    overflow: hidden;
    background-color: var(--bg-secondary);
  }

  .rich-text-editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--bg-tertiary);
  }

  .rich-text-editor-toolbar button, .rich-text-editor-toolbar select {
    background-color: transparent;
    color: var(--text-primary);
    border: none;
    border-radius: 4px;
    padding: 6px;
    height: 32px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rich-text-editor-toolbar button {
    width: 32px;
  }
  
  .rich-text-editor-toolbar select {
      width: auto;
      padding: 0 8px;
  }

  .rich-text-editor-toolbar button:hover {
    background-color: var(--bg-secondary);
    filter: none;
  }
  
  .rich-text-editor-toolbar button.active {
      background-color: var(--accent-primary);
      color: white;
  }
  
  .rich-text-editor-toolbar .separator {
      width: 1px;
      height: 20px;
      background-color: var(--border-color);
      margin: 0 4px;
  }
  
  .rich-text-editor-toolbar .color-picker-wrapper {
      position: relative;
      width: 32px;
      height: 32px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
  }

  .rich-text-editor-toolbar .color-picker-wrapper input[type="color"] {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
  }
  
  .rich-text-editor-toolbar .color-picker-wrapper .color-preview {
      width: 100%;
      height: 100%;
      border-radius: 3px;
  }

  .rich-text-editor-content {
    min-height: 200px;
    padding: 1rem;
    outline: none;
    line-height: var(--line-spacing);
    position: relative;
  }
  
  .rich-text-editor-content.with-placeholder::before {
    content: attr(data-placeholder);
    position: absolute;
    top: 1rem;
    left: 1rem;
    color: var(--text-secondary);
    opacity: 0.6;
    pointer-events: none;
    user-select: none;
  }
  
  .rich-text-editor-content:focus {
     box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-primary) 30%, transparent);
     border-radius: 6px;
  }
  
  .rich-text-editor-content a { color: var(--accent-secondary); }
  .rich-text-editor-content blockquote {
      border-left: 3px solid var(--accent-primary);
      padding-left: 1rem;
      margin-left: 0;
      color: var(--text-secondary);
      font-style: italic;
  }
  .rich-text-editor-content ul:not([data-type="checklist"]), .rich-text-editor-content ol {
      padding-left: 2em;
  }
  .rich-text-editor-content ul[data-type="checklist"] {
      list-style-type: none;
      padding-left: 0;
  }
  .rich-text-editor-content ul[data-type="checklist"] > li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
  }
  .rich-text-editor-content ul[data-type="checklist"] > li > input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      cursor: pointer;
  }
  .rich-text-editor-content img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
  }
  
  .rich-text-viewer {
      line-height: var(--line-spacing);
  }
  .rich-text-viewer a { color: var(--accent-secondary); }
  .rich-text-viewer blockquote {
      border-left: 3px solid var(--accent-primary);
      padding-left: 1rem;
      margin-left: 0;
      color: var(--text-secondary);
      font-style: italic;
  }
  .rich-text-viewer ul:not([data-type="checklist"]), .rich-text-viewer ol {
      padding-left: 2em;
  }
  .rich-text-viewer ul[data-type="checklist"] {
      list-style-type: none;
      padding-left: 0;
  }
  .rich-text-viewer ul[data-type="checklist"] > li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
  }
  .rich-text-viewer ul[data-type="checklist"] > li > input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
  }
  .rich-text-viewer img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
  }

`;

// --- TYPESCRIPT INTERFACES ---
type CustomFieldType =
  // Text & Content
  | 'plain-text' | 'text-area' | 'rich-text' | 'prompt-text' | 'rich-prompt-text'
  // Numerical & Quantitative
  | 'number' | 'counter' | 'slider'
  // Selection & Choice
  | 'dropdown' | 'checkbox' | 'checklist' | 'multi-select'
  // Rating & Scale
  | 'star-rating' | 'linear-scale'
  // Date, Time & Relational
  | 'date' | 'time' | 'datetime-local'
  // Media & Web
  | 'file-upload' | 'audio-recording' | 'url';
  
interface CustomFieldCategory {
  id: string;
  name: string;
}

interface CustomFieldDef {
  id: string;
  name: string;
  type: CustomFieldType;
  categoryId?: string;
  prompt?: string;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  options?: string[];
  fileConfig?: {
    accept: string;
    multiple: boolean;
  };
}

interface BlockDef {
  id: string;
  type: 'rich-text' | 'custom-field';
  customFieldId?: string;
  label: string;
  color?: string;
}

interface Template {
  id: string;
  name: string;
  blocks: BlockDef[];
}

interface Entry {
  id: string;
  journalId: string;
  templateId: string;
  createdAt: string;
  title?: string;
  data: Record<string, any>;
}

interface Journal {
  id: string;
  name: string;
  defaultTemplateId?: string;
}

interface Settings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  fontFamily: 'Inter' | 'Lora' | 'Roboto Slab';
  fontSize: number;
  lineSpacing: number;
  textWidth: 'comfortable' | 'wide';
  viewDensity: 'comfortable' | 'compact';
}

interface AppState {
  journals: Journal[];
  entries: Entry[];
  templates: Template[];
  customFieldDefs: CustomFieldDef[];
  customFieldCategories: CustomFieldCategory[];
}

interface Profile {
  id: string;
  name: string;
  data: AppState;
}

interface TopLevelState {
  profiles: Profile[];
  activeProfileId: string | null;
}

type View = 'dashboard' | 'journal' | 'templates' | 'custom-fields' | 'settings' | 'profile-manager';

// --- PREMADE TEMPLATES DEFINITIONS ---
interface PremadeField {
  fieldName: string;
  fieldType: CustomFieldType;
  label: string;
  config?: {
    prompt?: string;
    min?: number;
    max?: number;
    minLabel?: string;
    maxLabel?: string;
    options?: string[];
  };
}

interface PremadeTemplate {
  name: string;
  fields: PremadeField[];
}

interface PremadeTemplateCategory {
  categoryName: string;
  templates: PremadeTemplate[];
}

const premadeTemplates: PremadeTemplateCategory[] = [
  {
    categoryName: "Mental Health & Self-Reflection",
    templates: [
      {
        name: "Daily Mood Tracker",
        fields: [
          { fieldName: "Mood", fieldType: 'linear-scale', label: "Mood", config: { min: 1, max: 10, minLabel: "Awful", maxLabel: "Great" } },
          { fieldName: "Triggers", fieldType: 'prompt-text', label: "Triggers", config: { prompt: "What caused this event to happen?" } },
          { fieldName: "Coping Actions", fieldType: 'prompt-text', label: "Coping Actions", config: { prompt: "What did you do to cope? (distraction, avoidance, coping strategy, etc.)" } },
          { fieldName: "Gratitude", fieldType: 'prompt-text', label: "Gratitude", config: { prompt: "What were you grateful for today?" } },
          { fieldName: "Day Rating", fieldType: 'star-rating', label: "Rate your day", config: { max: 5 } },
        ],
      },
      {
        name: "Morning Reflection",
        fields: [
            { fieldName: "Goals for the Day", fieldType: 'text-area', label: "Goals for the Day" },
            { fieldName: "Mindset", fieldType: 'prompt-text', label: "Mindset", config: { prompt: "How do you want to feel today?" } },
            { fieldName: "Affirmations", fieldType: 'text-area', label: "Affirmations" },
        ]
      },
      {
        name: "Evening Reflection",
        fields: [
            { fieldName: "Wins", fieldType: 'text-area', label: "What went well today?" },
            { fieldName: "Lessons Learned", fieldType: 'text-area', label: "What did you learn?" },
            { fieldName: "Things to Release", fieldType: 'text-area', label: "What are you ready to let go of?" },
        ]
      },
      {
        name: "Gratitude Journal",
        fields: [
            { fieldName: "Gratitude Item 1", fieldType: 'prompt-text', label: "Item 1", config: { prompt: "What are you thankful for?" } },
            { fieldName: "Gratitude Item 2", fieldType: 'prompt-text', label: "Item 2", config: { prompt: "What are you thankful for?" } },
            { fieldName: "Gratitude Item 3", fieldType: 'prompt-text', label: "Item 3", config: { prompt: "What are you thankful for?" } },
            { fieldName: "Reasons for Gratitude", fieldType: 'text-area', label: "Why are you grateful for these things?" },
        ]
      },
      {
        name: "Thought Reframing",
        fields: [
            { fieldName: "Negative Thought", fieldType: 'text-area', label: "What negative thought did you have?" },
            { fieldName: "Evidence", fieldType: 'text-area', label: "What evidence supports or contradicts it?" },
            { fieldName: "Balanced Thought", fieldType: 'text-area', label: "What is a more balanced perspective?" },
        ]
      }
    ],
  },
  {
    categoryName: "Productivity & Goals",
    templates: [
        {
            name: "Daily Planner",
            fields: [
                { fieldName: "Tasks", fieldType: 'checklist', label: "Tasks", config: { options: [] } },
                { fieldName: "Priorities", fieldType: 'multi-select', label: "Priorities", config: { options: [] } },
                { fieldName: "Focus Time (hours)", fieldType: 'number', label: "Hours planned for deep work" },
                { fieldName: "Breaks Planned", fieldType: 'number', label: "Number of breaks planned" },
            ]
        },
        {
            name: "Weekly Review",
            fields: [
                { fieldName: "Completed Tasks", fieldType: 'checklist', label: "Completed Tasks", config: { options: [] } },
                { fieldName: "Challenges", fieldType: 'text-area', label: "What challenges did you face?" },
                { fieldName: "Next Week's Focus", fieldType: 'text-area', label: "What will you focus on next week?" },
            ]
        },
        {
            name: "Habit Tracker",
            fields: [
                { fieldName: "Habit Name", fieldType: 'text-area', label: "Habit Name" },
                { fieldName: "Success %", fieldType: 'slider', label: "Success %", config: { min: 0, max: 100 } },
                { fieldName: "Habit Notes", fieldType: 'text-area', label: "Notes about habit performance" },
            ]
        },
        {
            name: "Goal Breakdown",
            fields: [
                { fieldName: "Goal", fieldType: 'text-area', label: "Goal" },
                { fieldName: "Milestones", fieldType: 'checklist', label: "Milestones", config: { options: [] } },
                { fieldName: "Next Action", fieldType: 'text-area', label: "Next Action" },
                { fieldName: "Progress Notes", fieldType: 'text-area', label: "Progress Notes" },
            ]
        }
    ]
  },
  {
    categoryName: "Creativity & Ideation",
    templates: [
        {
            name: "Idea Capture",
            fields: [
                { fieldName: "Idea", fieldType: 'text-area', label: "Idea" },
                { fieldName: "Source", fieldType: 'prompt-text', label: "Source", config: { prompt: "Where did this idea come from?" } },
                { fieldName: "Potential", fieldType: 'text-area', label: "How could it grow?" },
                { fieldName: "Next Step", fieldType: 'text-area', label: "Next Step" },
            ]
        },
        {
            name: "Brain Dump",
            fields: [
                { fieldName: "Topic", fieldType: 'text-area', label: "Topic" },
                { fieldName: "Thoughts", fieldType: 'text-area', label: "Thoughts" },
                { fieldName: "Connections", fieldType: 'text-area', label: "Connections" },
                { fieldName: "Actionables", fieldType: 'text-area', label: "Actionables" },
            ]
        },
        {
            name: "Writing Prompts",
            fields: [
                { fieldName: "Topic", fieldType: 'prompt-text', label: "Topic", config: { prompt: "What topic do you want to write about?" } },
                { fieldName: "Emotions", fieldType: 'multi-select', label: "Emotions", config: { options: ["Joy", "Sadness", "Anger", "Fear", "Surprise", "Love"] } },
                { fieldName: "Theme", fieldType: 'text-area', label: "Theme" },
            ]
        }
    ]
  },
  {
    categoryName: "Health & Wellness",
    templates: [
        {
            name: "Fitness Log",
            fields: [
                { fieldName: "Workout", fieldType: 'text-area', label: "Type of workout" },
                { fieldName: "Duration (minutes)", fieldType: 'number', label: "Duration (minutes)" },
                { fieldName: "Intensity", fieldType: 'slider', label: "Intensity", config: { min: 1, max: 10 } },
                { fieldName: "Energy Level", fieldType: 'linear-scale', label: "Energy Level", config: { min: 1, max: 10, minLabel: "Low", maxLabel: "High" } },
            ]
        },
        {
            name: "Sleep Tracker",
            fields: [
                { fieldName: "Bedtime", fieldType: 'time', label: "Bedtime" },
                { fieldName: "Wake Time", fieldType: 'time', label: "Wake Time" },
                { fieldName: "Sleep Quality", fieldType: 'linear-scale', label: "Quality", config: { min: 1, max: 10, minLabel: "Poor", maxLabel: "Excellent" } },
                { fieldName: "Dreams", fieldType: 'text-area', label: "Describe any dreams" },
            ]
        },
        {
            name: "Nutrition Log",
            fields: [
                { fieldName: "Meals", fieldType: 'text-area', label: "Meals" },
                { fieldName: "Calories", fieldType: 'number', label: "Calories" },
                { fieldName: "Mood After Eating", fieldType: 'linear-scale', label: "Mood After Eating", config: { min: 1, max: 10, minLabel: "Sluggish", maxLabel: "Energized" } },
            ]
        }
    ]
  },
    {
    categoryName: "Relationships & Social Life",
    templates: [
        {
            name: "Interaction Reflection",
            fields: [
                { fieldName: "Person", fieldType: 'text-area', label: "Person" },
                { fieldName: "Topic", fieldType: 'text-area', label: "Topic" },
                { fieldName: "Feelings", fieldType: 'multi-select', label: "How did you feel?", config: { options: ["Happy", "Anxious", "Excited", "Drained", "Inspired"] } },
                { fieldName: "Follow-up", fieldType: 'text-area', label: "Next steps" },
            ]
        },
        {
            name: "Relationship Goals",
            fields: [
                { fieldName: "What's Going Well", fieldType: 'text-area', label: "What’s going well" },
                { fieldName: "Needs Improvement", fieldType: 'text-area', label: "Needs Improvement" },
                { fieldName: "Gratitude", fieldType: 'prompt-text', label: "What do you appreciate about this person?", config: { prompt: "What do you appreciate about this person?" } },
            ]
        }
    ]
  },
  {
    categoryName: "Learning & Growth",
    templates: [
        {
            name: "Study Log",
            fields: [
                { fieldName: "Topic", fieldType: 'text-area', label: "Topic" },
                { fieldName: "Study Method", fieldType: 'dropdown', label: "Method", config: { options: ["Pomodoro Technique", "Active Recall", "Spaced Repetition", "Feynman Technique"] } },
                { fieldName: "Time Spent (minutes)", fieldType: 'number', label: "Time Spent (minutes)" },
                { fieldName: "Insights", fieldType: 'text-area', label: "Insights" },
            ]
        },
        {
            name: "Reading Notes",
            fields: [
                { fieldName: "Book/Article", fieldType: 'text-area', label: "Book" },
                { fieldName: "Key Quote", fieldType: 'text-area', label: "Quote" },
                { fieldName: "Takeaway", fieldType: 'text-area', label: "Takeaway" },
                { fieldName: "Application", fieldType: 'text-area', label: "Application" },
            ]
        },
        {
            name: "Skill Progress Tracker",
            fields: [
                { fieldName: "Skill", fieldType: 'text-area', label: "Skill" },
                { fieldName: "Last Practice", fieldType: 'date', label: "Last Practice" },
                { fieldName: "Next Focus Area", fieldType: 'text-area', label: "Next Focus Area" },
            ]
        }
    ]
  },
  {
    categoryName: "Spirituality & Meaning",
    templates: [
        {
            name: "Meditation Log",
            fields: [
                { fieldName: "Duration (minutes)", fieldType: 'number', label: "Duration (minutes)" },
                { fieldName: "Focus", fieldType: 'prompt-text', label: "Focus", config: { prompt: "What was your focus during meditation?" } },
                { fieldName: "Insight", fieldType: 'text-area', label: "What did you notice?" },
            ]
        },
        {
            name: "Tarot or Dream Journal",
            fields: [
                { fieldName: "Card/Dream Symbols", fieldType: 'text-area', label: "Card/Dream Symbols" },
                { fieldName: "Interpretation", fieldType: 'text-area', label: "Interpretation" },
                { fieldName: "Message", fieldType: 'text-area', label: "Message" },
            ]
        }
    ]
  }
];

// --- HELPER FUNCTIONS ---
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generate a UUID v4 for user account syncing
const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Generate UUID from username and secret phrase using SHA-256
const generateUUIDFromCredentials = async (username: string, secretPhrase: string): Promise<string> => {
    const combined = `${username}:${secretPhrase}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Convert to UUID v4 format (use hash as UUID but mark as version 4)
    return `${hashHex.substring(0, 8)}-${hashHex.substring(8, 12)}-4${hashHex.substring(13, 16)}-${(parseInt(hashHex.substring(16, 17), 16) & 0x3 | 0x8).toString(16)}${hashHex.substring(17, 20)}-${hashHex.substring(20, 32)}`;
};

// Synchronous fallback for when crypto.subtle is not available
const generateUUIDFromCredentialsSync = (username: string, secretPhrase: string): string => {
    const combined = `${username}:${secretPhrase}`;
    // Simple hash function fallback
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to hex and format as UUID
    const hashHex = Math.abs(hash).toString(16).padStart(32, '0');
    return `${hashHex.substring(0, 8)}-${hashHex.substring(8, 12)}-4${hashHex.substring(13, 16)}-${(parseInt(hashHex.substring(16, 17), 16) & 0x3 | 0x8).toString(16)}${hashHex.substring(17, 20)}-${hashHex.substring(20, 32)}`;
};

// --- SUPABASE SYNC FUNCTIONS ---
const DEBUG_SUPABASE = true; // Set to false when ready to remove debug logs

const logDebug = (message: string, data?: any) => {
  if (DEBUG_SUPABASE) {
    console.log(`[Supabase Debug] ${message}`, data || '');
  }
};

// Authenticate with Supabase using username and secret phrase
const authenticateSupabase = async (username: string, secretPhrase: string, userUUID: string): Promise<boolean> => {
  // If Supabase is not configured, skip authentication (app works without it)
  if (!isSupabaseConfigured()) {
    logDebug('Supabase not configured, skipping authentication');
    return false;
  }
  
  try {
    // Validate password length before attempting authentication
    if (secretPhrase.length < 6) {
      logDebug('Secret phrase too short (minimum 6 characters)', { username, secretPhraseLength: secretPhrase.length });
      return false;
    }
    
    logDebug('Attempting Supabase authentication', { username, userUUID });
    
    // Generate email from username (Supabase requires email format)
    const email = `${username}@noteloom.local`;
    
    // Check current auth state
    const { data: currentUser, error: checkError } = await supabase.auth.getUser();
    
    // If already authenticated with correct email, verify and update metadata
    if (!checkError && currentUser?.user?.email === email) {
      // Update user metadata with userUUID if not set
      if (currentUser.user.user_metadata?.user_uuid !== userUUID) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { user_uuid: userUUID }
        });
        if (updateError) {
          logDebug('Error updating user metadata', updateError);
        } else {
          logDebug('Updated user metadata with UUID');
        }
      }
      logDebug('Already authenticated');
      return true;
    }
    
    // Try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: secretPhrase,
    });
    
    if (signInError) {
      // User doesn't exist, create one with metadata
      logDebug('User not found, attempting signup');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: secretPhrase,
        options: {
          data: {
            username: username,
            user_uuid: userUUID
          }
        }
      });
      
      if (signUpError) {
        logDebug('Signup error', signUpError);
        return false;
      }
      
      // Update metadata if not set during signup
      if (signUpData.user && signUpData.user.user_metadata?.user_uuid !== userUUID) {
        await supabase.auth.updateUser({
          data: { user_uuid: userUUID }
        });
      }
      
      logDebug('User created successfully');
      return true;
    }
    
    // Update metadata on successful sign in
    if (signInData.user && signInData.user.user_metadata?.user_uuid !== userUUID) {
      await supabase.auth.updateUser({
        data: { user_uuid: userUUID }
      });
    }
    
    logDebug('Sign in successful');
    return true;
  } catch (error) {
    logDebug('Authentication error', error);
    return false;
  }
};

// Merge data structures intelligently
const mergeData = (localData: any, remoteData: any, dataType: string): any => {
  if (!remoteData) return localData;
  if (!localData) return remoteData;
  
  if (dataType === 'profiles') {
    // Merge profiles: intelligently combine profiles from both sources
    const profileMap = new Map<string, any>();
    
    // First, add all remote profiles (they're the source of truth if they exist)
    if (remoteData.profiles && Array.isArray(remoteData.profiles)) {
      remoteData.profiles.forEach((profile: any) => {
        profileMap.set(profile.id, { ...profile });
      });
    }
    
    // Then, merge local profiles - add any that don't exist remotely, or merge data within profiles
    if (localData.profiles && Array.isArray(localData.profiles)) {
      localData.profiles.forEach((localProfile: any) => {
        const existingProfile = profileMap.get(localProfile.id);
        if (existingProfile) {
          // Profile exists in both - merge the data within the profile
          // Merge journals, entries, templates, etc.
          const mergedProfile = {
            ...existingProfile,
            data: {
              ...existingProfile.data,
              // Merge journals - combine arrays, keeping unique ones
              journals: mergeArrays(existingProfile.data?.journals || [], localProfile.data?.journals || [], 'id'),
              // Merge entries - combine arrays, keeping unique ones
              entries: mergeArrays(existingProfile.data?.entries || [], localProfile.data?.entries || [], 'id'),
              // Merge templates - combine arrays, keeping unique ones
              templates: mergeArrays(existingProfile.data?.templates || [], localProfile.data?.templates || [], 'id'),
              // Merge custom field definitions
              customFieldDefs: mergeArrays(existingProfile.data?.customFieldDefs || [], localProfile.data?.customFieldDefs || [], 'id'),
              // Merge custom field categories
              customFieldCategories: mergeArrays(existingProfile.data?.customFieldCategories || [], localProfile.data?.customFieldCategories || [], 'id'),
            }
          };
          profileMap.set(localProfile.id, mergedProfile);
        } else {
          // Local profile doesn't exist remotely - add it
          profileMap.set(localProfile.id, { ...localProfile });
        }
      });
    }
    
    const mergedProfiles = Array.from(profileMap.values());
    
    return {
      profiles: mergedProfiles,
      activeProfileId: remoteData.activeProfileId || localData.activeProfileId || null
    };
  } else if (dataType === 'settings') {
    // For settings, prefer remote (it's likely newer)
    return remoteData;
  }
  
  // Default: prefer remote if it exists
  return remoteData;
};

// Helper function to merge arrays by combining unique items based on a key
// Prefers items from array1 (remote) when duplicates exist
const mergeArrays = (array1: any[], array2: any[], key: string): any[] => {
  const map = new Map<string, any>();
  
  // First, add all items from array2 (local) - these might be new
  array2.forEach(item => {
    if (item && item[key]) {
      map.set(item[key], item);
    }
  });
  
  // Then, add items from array1 (remote) - these take precedence if duplicates exist
  // This ensures remote data (newer) overwrites local data when there's a conflict
  array1.forEach(item => {
    if (item && item[key]) {
      map.set(item[key], item);
    }
  });
  
  return Array.from(map.values());
};

// Sync data to Supabase with conflict resolution
const syncToSupabase = async (userUUID: string, dataType: string, data: any, localLastSync?: string): Promise<boolean> => {
  // If Supabase is not configured, skip sync (app works without it)
  if (!isSupabaseConfigured()) {
    logDebug(`Supabase not configured, skipping sync for ${dataType}`);
    return false;
  }
  
  try {
    logDebug(`Syncing ${dataType} to Supabase`, { userUUID: userUUID, dataType });
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logDebug(`Not authenticated, cannot sync ${dataType}`, authError);
      return false;
    }
    logDebug(`Authenticated as user: ${user.email}`);
    
    // Try to fetch existing data (use maybeSingle to avoid error if not found)
    const { data: existingData, error: fetchError } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_uuid', userUUID)
      .eq('data_type', dataType)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      logDebug(`Error fetching existing ${dataType}`, fetchError);
      return false;
    }
    
    let dataToSync = data;
    
    // If remote data exists, check timestamps and merge if needed
    if (existingData && existingData.updated_at) {
      const remoteTimestamp = new Date(existingData.updated_at).getTime();
      const localTimestamp = localLastSync ? new Date(localLastSync).getTime() : Date.now();
      
      logDebug(`Comparing timestamps for ${dataType}`, {
        remote: existingData.updated_at,
        local: localLastSync || 'no local timestamp',
        remoteTime: remoteTimestamp,
        localTime: localTimestamp
      });
      
      // If remote is newer, merge data intelligently
      if (remoteTimestamp > localTimestamp) {
        logDebug(`Remote ${dataType} is newer, merging with local data`);
        const remoteData = existingData.data;
        dataToSync = mergeData(data, remoteData, dataType);
        logDebug(`Merged ${dataType} data`, {
          mergedPreview: JSON.stringify(dataToSync).substring(0, 200)
        });
      } else {
        logDebug(`Local ${dataType} is newer or same, using local data`);
      }
    }
    
    const payload = {
      user_uuid: userUUID,
      data_type: dataType,
      data: dataToSync,
      updated_at: new Date().toISOString(),
    };
    
    if (existingData) {
      // Update existing record
      logDebug(`Updating existing ${dataType} record`, { 
        dataSize: JSON.stringify(dataToSync).length,
        dataPreview: JSON.stringify(dataToSync).substring(0, 200)
      });
      const { data: updateData, error: updateError } = await supabase
        .from('user_data')
        .update(payload)
        .eq('user_uuid', userUUID)
        .eq('data_type', dataType)
        .select();
      
      if (updateError) {
        logDebug(`Error updating ${dataType}`, updateError);
        console.error(`[Supabase Error] Update failed:`, updateError);
        return false;
      }
      logDebug(`Successfully updated ${dataType}`, { 
        updatedRecords: updateData?.length || 0 
      });
      return true;
    } else {
      // Insert new record
      logDebug(`Inserting new ${dataType} record`, { 
        dataSize: JSON.stringify(dataToSync).length,
        dataPreview: JSON.stringify(dataToSync).substring(0, 200)
      });
      const { data: insertData, error: insertError } = await supabase
        .from('user_data')
        .insert(payload)
        .select();
      
      if (insertError) {
        logDebug(`Error inserting ${dataType}`, insertError);
        console.error(`[Supabase Error] Insert failed:`, insertError);
        return false;
      }
      logDebug(`Successfully inserted ${dataType}`, { 
        insertedRecords: insertData?.length || 0 
      });
      return true;
    }
  } catch (error) {
    logDebug(`Sync error for ${dataType}`, error);
    console.error(`[Supabase Error] Sync exception:`, error);
    return false;
  }
};

// Load data from Supabase
const loadFromSupabase = async (userUUID: string, dataType: string): Promise<{ data: any; updated_at: string } | null> => {
  // If Supabase is not configured, skip loading (app works without it)
  if (!isSupabaseConfigured()) {
    logDebug(`Supabase not configured, skipping load for ${dataType}`);
    return null;
  }
  
  try {
    logDebug(`Loading ${dataType} from Supabase`, { userUUID, dataType });
    
    const { data, error } = await supabase
      .from('user_data')
      .select('data, updated_at')
      .eq('user_uuid', userUUID)
      .eq('data_type', dataType)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        logDebug(`No ${dataType} found in Supabase`);
        return null;
      }
      logDebug(`Error loading ${dataType}`, error);
      return null;
    }
    
    const loadedData = data?.data || null;
    logDebug(`Successfully loaded ${dataType}`, { 
      dataSize: loadedData ? JSON.stringify(loadedData).length : 0,
      dataPreview: loadedData ? JSON.stringify(loadedData).substring(0, 200) : 'null',
      lastUpdated: data?.updated_at 
    });
    return { data: loadedData, updated_at: data?.updated_at || new Date().toISOString() };
  } catch (error) {
    logDebug(`Load error for ${dataType}`, error);
    return null;
  }
};

// Test Supabase connection
const testSupabaseConnection = async (): Promise<boolean> => {
  // If Supabase is not configured, skip test (app works without it)
  if (!isSupabaseConfigured()) {
    logDebug('Supabase not configured, skipping connection test');
    return false;
  }
  
  try {
    logDebug('Testing Supabase connection...');
    const { data, error } = await supabase.from('user_data').select('count');
    
    if (error) {
      logDebug('Supabase connection test failed', error);
      return false;
    }
    
    logDebug('Supabase connection test successful!', data);
    return true;
  } catch (error) {
    logDebug('Supabase connection test error', error);
    return false;
  }
};

const useIndexedDB = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>, boolean] => {
  const [state, setState] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Effect for loading data from storage and handling migration from localStorage
  useEffect(() => {
    const loadAndMigrate = async () => {
      setIsLoading(true);
      try {
        // 1. Check IndexedDB first
        const dbRecord = await db.appData.get(key);
        if (dbRecord) {
          setState(dbRecord.value);
          return;
        }

        // 2. Not in DB, check localStorage for one-time migration
        const oldKeyMap: { [key: string]: string } = {
          'profiles-state': 'noteloom-profiles-state',
          'settings': 'noteloom-settings',
        };
        const oldLsKey = oldKeyMap[key];
        
        if (oldLsKey) {
            const lsValue = localStorage.getItem(oldLsKey);
            if (lsValue) {
                console.log(`Migrating ${oldLsKey} from localStorage to IndexedDB.`);
                let parsed = JSON.parse(lsValue);

                // Re-implement old migration logic from `usePersistentState` for profiles-state
                if (key === 'profiles-state' && parsed.journals) {
                    const defaultProfile: Profile = {
                        id: generateId(),
                        name: 'Personal',
                        data: parsed,
                    };
                    const migratedState: TopLevelState = {
                        profiles: [defaultProfile],
                        activeProfileId: defaultProfile.id
                    };
                    parsed = migratedState;
                    localStorage.removeItem('noteloom-app-state'); // Clean up very old key
                }
                
                // Set the state, save to DB, and remove from localStorage
                setState(parsed);
                await db.appData.put({ key, value: parsed });
                localStorage.removeItem(oldLsKey);
                return;
            }
        }
        
        // 3. Nothing found anywhere, so use the default value and save it for next time.
        await db.appData.put({ key, value: defaultValue });

      } catch (error) {
        console.error(`Error loading data for key "${key}":`, error);
        // State will remain as defaultValue
      } finally {
        setIsLoading(false);
      }
    };

    loadAndMigrate();
  }, [key]); // Only depends on key, as defaultValue should be stable

  // Effect for saving state changes back to IndexedDB
  useEffect(() => {
    // Only save if loading is complete to avoid overwriting DB with default value on initial load
    if (!isLoading) {
      db.appData.put({ key, value: state }).catch((error: any) => {
          console.error(`Failed to save state for key "${key}" to IndexedDB`, error);
      });
    }
  }, [key, state, isLoading]);

  // Custom hook with Supabase sync support
  return [state, setState, isLoading];
};

// Background sync function - checks for remote updates and merges automatically
const performBackgroundSync = async (
  key: string,
  dataType: string,
  userUUID: string,
  currentState: any,
  setState: React.Dispatch<React.SetStateAction<any>>,
  lastSyncTime: string | null
): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    logDebug(`Background sync check for ${dataType}...`);
    
    // Load remote data
    const supabaseResult = await loadFromSupabase(userUUID, dataType);
    if (!supabaseResult || !supabaseResult.data) {
      return false; // No remote data
    }

    const remoteData = supabaseResult.data;
    const remoteTimestamp = supabaseResult.updated_at;

    // Compare timestamps
    if (lastSyncTime && remoteTimestamp) {
      const localTime = new Date(lastSyncTime).getTime();
      const remoteTime = new Date(remoteTimestamp).getTime();

      // If remote is newer, merge it
      if (remoteTime > localTime) {
        logDebug(`Remote ${dataType} is newer, performing background merge`);
        const mergedData = mergeData(currentState, remoteData, dataType);
        
        // Update state and IndexedDB
        setState(mergedData);
        await db.appData.put({ key, value: mergedData });
        
        // Update last sync time
        const lastSyncKey = `${key}-last-sync`;
        await db.appData.put({ key: lastSyncKey, value: remoteTimestamp });
        
        logDebug(`Background sync completed for ${dataType}`);
        return true; // Indicates data was updated
      }
    } else if (remoteTimestamp) {
      // No local sync time, but remote exists - use remote
      logDebug(`No local sync time, using remote ${dataType} data`);
      setState(remoteData);
      await db.appData.put({ key, value: remoteData });
      const lastSyncKey = `${key}-last-sync`;
      await db.appData.put({ key: lastSyncKey, value: remoteTimestamp });
      return true;
    }

    return false; // No update needed
  } catch (error) {
    logDebug(`Background sync error for ${dataType}`, error);
    return false;
  }
};

// Enhanced hook that includes Supabase sync
const useIndexedDBWithSync = <T,>(
  key: string, 
  defaultValue: T,
  userUUID: string | null,
  username: string | null,
  secretPhrase: string | null,
  dataType: string
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] => {
  const [state, setState, isLoading] = useIndexedDB<T>(key, defaultValue);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasLoadedFromSupabase, setHasLoadedFromSupabase] = useState(false);
  const backgroundSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Authenticate and load from Supabase on mount (only once)
  useEffect(() => {
    if (!isLoading && userUUID && username && secretPhrase && !hasLoadedFromSupabase) {
      const authenticateAndLoad = async () => {
        logDebug(`Authenticating and loading ${dataType}...`, { userUUID, username });
        const authSuccess = await authenticateSupabase(username, secretPhrase, userUUID);
        
        if (authSuccess) {
          setIsAuthenticated(true);
          logDebug(`Authentication successful for ${dataType}`);
          
          // Verify auth status
          const { data: { user }, error: verifyError } = await supabase.auth.getUser();
          if (verifyError || !user) {
            logDebug(`Auth verification failed after successful auth`, verifyError);
            console.error(`[Supabase Error] Auth verification failed:`, verifyError);
          } else {
            logDebug(`Auth verified - User ID: ${user.id}, Email: ${user.email}`);
          }
          
          // Capture current local state before loading from Supabase
          const localData = state;
          
          // Get last sync timestamp from IndexedDB
          const lastSyncKey = `${key}-last-sync`;
          const lastSyncRecord = await db.appData.get(lastSyncKey);
          const lastSyncTime = lastSyncRecord?.value || null;
          
          // Try to load from Supabase
          const supabaseResult = await loadFromSupabase(userUUID, dataType);
          if (supabaseResult && supabaseResult.data) {
            const supabaseData = supabaseResult.data;
            const remoteTimestamp = supabaseResult.updated_at;
            
            logDebug(`Loaded ${dataType} from Supabase`, { 
              supabasePreview: JSON.stringify(supabaseData).substring(0, 300),
              localPreview: JSON.stringify(localData).substring(0, 300),
              remoteTimestamp,
              lastSyncTime
            });
            
            // Compare timestamps to determine which is newer
            if (lastSyncTime && remoteTimestamp) {
              const localTime = new Date(lastSyncTime).getTime();
              const remoteTime = new Date(remoteTimestamp).getTime();
              
              if (remoteTime > localTime) {
                // Remote is newer, use remote data
                logDebug(`Remote ${dataType} is newer than local last sync, using remote data`);
                setState(supabaseData);
                await db.appData.put({ key, value: supabaseData });
                await db.appData.put({ key: lastSyncKey, value: remoteTimestamp });
              } else if (localData && Object.keys(localData).length > 0) {
                // Local might have newer changes, merge intelligently
                logDebug(`Local ${dataType} may have newer changes, merging with remote`);
                const mergedData = mergeData(localData, supabaseData, dataType);
                setState(mergedData);
                await db.appData.put({ key, value: mergedData });
                // Sync the merged data back to Supabase
                await syncToSupabase(userUUID, dataType, mergedData, lastSyncTime);
                await db.appData.put({ key: lastSyncKey, value: new Date().toISOString() });
              } else {
                // Use remote data
                setState(supabaseData);
                await db.appData.put({ key, value: supabaseData });
                await db.appData.put({ key: lastSyncKey, value: remoteTimestamp });
              }
            } else {
              // No last sync time, use remote data
              logDebug(`No previous sync time, using remote ${dataType} data`);
              setState(supabaseData);
              await db.appData.put({ key, value: supabaseData });
              await db.appData.put({ key: lastSyncKey, value: remoteTimestamp });
            }
            logDebug(`Replaced local ${dataType} with Supabase data`);
          } else {
            // No data in Supabase, sync local data up
            logDebug(`No ${dataType} in Supabase, syncing local data`, { 
              dataPreview: JSON.stringify(localData).substring(0, 300) 
            });
            const syncResult = await syncToSupabase(userUUID, dataType, localData, lastSyncTime);
            if (!syncResult) {
              console.error(`[Supabase Error] Initial sync failed for ${dataType}`);
            } else {
              logDebug(`Initial sync successful for ${dataType}`);
              // Update last sync time
              await db.appData.put({ key: lastSyncKey, value: new Date().toISOString() });
            }
          }
        } else {
          logDebug(`Authentication failed for ${dataType}`);
          console.error(`[Supabase Error] Authentication failed for ${dataType}`);
        }
        setHasLoadedFromSupabase(true);
      };
      
      authenticateAndLoad();
    } else if (!isLoading && (!username || !secretPhrase)) {
      logDebug(`Skipping Supabase sync for ${dataType} - no credentials`);
      setHasLoadedFromSupabase(true); // Skip Supabase if no credentials
    }
  }, [isLoading, userUUID, username, secretPhrase, dataType, key]); // Removed state and hasLoadedFromSupabase from deps

  // Background polling for remote updates (every 10 seconds)
  // Uses a ref to access current state without causing re-renders
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && hasLoadedFromSupabase && userUUID && username && secretPhrase && isSupabaseConfigured()) {
      const checkForUpdates = async () => {
        const lastSyncKey = `${key}-last-sync`;
        const lastSyncRecord = await db.appData.get(lastSyncKey);
        const lastSyncTime = lastSyncRecord?.value || null;
        
        // Use ref to get current state without triggering re-render
        const wasUpdated = await performBackgroundSync(
          key,
          dataType,
          userUUID,
          stateRef.current,
          setState,
          lastSyncTime
        );
        
        if (wasUpdated) {
          logDebug(`Background sync detected updates for ${dataType} - data merged automatically`);
        }
      };

      // Check immediately, then every 30 seconds (30000 milliseconds)
      checkForUpdates();
      backgroundSyncIntervalRef.current = setInterval(checkForUpdates, 30000);

      return () => {
        if (backgroundSyncIntervalRef.current) {
          clearInterval(backgroundSyncIntervalRef.current);
          backgroundSyncIntervalRef.current = null;
        }
      };
    }
  }, [isLoading, isAuthenticated, hasLoadedFromSupabase, userUUID, username, secretPhrase, dataType, key]);

  // Sync to Supabase when state changes (after initial load)
  useEffect(() => {
    if (!isLoading && isAuthenticated && hasLoadedFromSupabase && userUUID && username && secretPhrase) {
      const syncData = async () => {
        // Get last sync timestamp
        const lastSyncKey = `${key}-last-sync`;
        const lastSyncRecord = await db.appData.get(lastSyncKey);
        const lastSyncTime = lastSyncRecord?.value || null;
        
        logDebug(`Auto-syncing ${dataType} to Supabase`, { 
          dataPreview: JSON.stringify(state).substring(0, 300),
          lastSyncTime
        });
        const syncResult = await syncToSupabase(userUUID, dataType, state, lastSyncTime);
        if (!syncResult) {
          console.error(`[Supabase Error] Auto-sync failed for ${dataType}`);
        } else {
          logDebug(`Auto-sync successful for ${dataType}`);
          // Update last sync time after successful sync
          await db.appData.put({ key: lastSyncKey, value: new Date().toISOString() });
        }
      };
      
      // Debounce sync calls to avoid excessive API calls
      const timeoutId = setTimeout(syncData, 1000);
      return () => clearTimeout(timeoutId);
    } else if (!isLoading && userUUID && username && secretPhrase && hasLoadedFromSupabase && !isAuthenticated) {
      logDebug(`Skipping sync for ${dataType} - not authenticated`);
    }
  }, [state, isLoading, isAuthenticated, hasLoadedFromSupabase, userUUID, username, secretPhrase, dataType, key]);

  return [state, setState, isLoading];
};

const fieldCategories: Record<string, CustomFieldType[]> = {
  "Text & Content": ['plain-text', 'text-area', 'rich-text', 'prompt-text', 'rich-prompt-text'],
  "Numerical & Quantitative": ['number', 'counter', 'slider'],
  "Selection & Choice": ['dropdown', 'checkbox', 'checklist', 'multi-select'],
  "Rating & Scale": ['star-rating', 'linear-scale'],
  "Date, Time & Relational": ['date', 'time', 'datetime-local'],
  "Media & Web": ['file-upload', 'audio-recording', 'url'],
};

const formatFieldTypeName = (type: string) => {
    return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}


// --- INITIAL BLANK STATE ---
const initialAppState: AppState = {
  customFieldCategories: [],
  customFieldDefs: [],
  templates: [],
  journals: [],
  entries: [],
};


// --- EXPORT UTILITIES ---
const escapeHtml = (unsafe: string) => unsafe.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const getFormattedValueForExport = (
  block: BlockDef,
  value: any,
  customFieldDefs: CustomFieldDef[]
): string => {
  if (value === null || typeof value === 'undefined' || value === '') {
    return '<i>N/A</i>';
  }

  if (block.type === 'rich-text') {
    // Value is already HTML, just return it.
    // It will be sanitized before being used by the export library.
    return String(value);
  }

  const fieldDef = customFieldDefs.find(cf => cf.id === block.customFieldId);
  if (!fieldDef) {
    return '<i>Field definition not found.</i>';
  }

  switch (fieldDef.type) {
    case 'checkbox':
      return value ? 'Checked' : 'Unchecked';
    case 'star-rating':
      const rating = Number(value) || 0;
      const max = fieldDef.max || 5;
      return '★'.repeat(rating) + '☆'.repeat(max - rating) + ` (${rating}/${max})`;
    case 'checklist':
      const checklistValues = value || {};
      return (fieldDef.options || [])
        .map((opt: string) => `<div>${checklistValues[opt] ? '[x]' : '[ ]'} ${escapeHtml(opt)}</div>`)
        .join('');
    case 'multi-select':
      return Array.isArray(value) ? escapeHtml(value.join(', ')) : '';
    case 'file-upload':
      if (typeof value === 'string' && value.startsWith('data:image')) {
        return `<img src="${value}" style="max-width: 400px; max-height: 400px; object-fit: contain; border-radius: 4px; margin-top: 8px;" />`;
      }
      return '<i>[Embedded file - not an image]</i>';
    case 'audio-recording':
      return '<i>[Audio Recording - Not Exportable]</i>';
    case 'url':
        const url = escapeHtml(String(value));
        return `<a href="${url}">${url}</a>`;
    case 'time': {
        if (typeof value !== 'string' || !value.includes(':')) {
            return escapeHtml(String(value));
        }
        const [hourString, minute] = value.split(':');
        const hour = parseInt(hourString, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        let formattedHour = hour % 12;
        if (formattedHour === 0) {
            formattedHour = 12;
        }
        return escapeHtml(`${formattedHour}:${minute} ${ampm}`);
    }
    default:
      return escapeHtml(String(value)).replace(/\n/g, '<br />');
  }
};

const generateHtmlForEntries = (
  entries: Entry[],
  templates: Template[],
  customFieldDefs: CustomFieldDef[]
): string => {
  let html = `
    <style>
      body { font-family: sans-serif; color: #000; }
      .entry-export { border-bottom: 2px solid #999; padding-bottom: 20px; margin-bottom: 20px; page-break-inside: avoid; }
      .entry-export:last-child { border-bottom: none; }
      h1, h2, h3 { color: #000; }
      h1 { font-size: 24px; } h2 { font-size: 20px; } h3 { font-size: 16px; margin-top: 1.5em; margin-bottom: 0.5em; }
      p { margin: 0 0 10px; }
      .block-content { padding-left: 10px; border-left: 3px solid #ddd; }
    </style>
  `;

  const sortedEntries = [...entries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const dompurify = (window as any).DOMPurify;

  for (const entry of sortedEntries) {
    let template = templates.find(t => t.id === entry.templateId);
    if (entry.templateId === 'SIMPLE_NOTE_TEMPLATE') {
        template = {
            id: 'SIMPLE_NOTE_TEMPLATE',
            name: 'Simple Note',
            blocks: [{ id: 'notes', type: 'rich-text', label: 'Notes' }]
        };
    }
    if (!template) continue;

    const entryHtml = template.blocks.map(block => {
        const valueKey = block.type === 'rich-text' && entry.templateId === 'SIMPLE_NOTE_TEMPLATE' ? 'notes' : block.id;
        let content = getFormattedValueForExport(block, entry.data[valueKey], customFieldDefs);
        // Sanitize rich text content for export
        if (block.type === 'rich-text' && dompurify) {
            content = dompurify.sanitize(content);
        }
        return `
          <div>
            <h3 style="color: ${block.color || '#000'}">${escapeHtml(block.label)}</h3>
            <div class="block-content">
              ${content}
            </div>
          </div>
        `;
    }).join('');
    
    const headerHtml = entry.title 
      ? `<h2>${escapeHtml(entry.title)}</h2>`
      : ``;

    html += `
      <div class="entry-export">
        <div class="entry-header">
          ${headerHtml}
          <p><strong>Template:</strong> ${escapeHtml(template.name)}</p>
          <p><strong>Date:</strong> ${new Date(entry.createdAt).toLocaleString()}</p>
        </div>
        ${entryHtml}
      </div>
    `;
  }
  return html;
};

const exportDocument = async (
    format: 'pdf' | 'docx',
    filename: string,
    htmlContent: string
) => {
    const jspdfLib = (window as any).jspdf;
    const htmlToDocxLib = (window as any).htmlToDocx;

    if (format === 'pdf') {
        if (!jspdfLib) {
            console.error("jsPDF library not loaded.");
            alert("Error: The PDF generation library failed to load. Please refresh the page and try again.");
            return;
        }
        const { jsPDF } = jspdfLib;
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });
        await doc.html(htmlContent, {
            callback: (doc: any) => {
                doc.save(`${filename}.pdf`);
            },
            margin: [15, 15, 15, 15],
            autoPaging: 'text',
            width: 180,
            windowWidth: 800
        });
    } else if (format === 'docx') {
        if (!htmlToDocxLib) {
            console.error("html-to-docx-ts library not loaded.");
            alert("Error: The Word document generation library failed to load. Please refresh the page and try again.");
            return;
        }
        const fileBuffer = await htmlToDocxLib.asBlob(htmlContent, {
            orientation: 'portrait',
            margins: { top: 720, right: 720, bottom: 720, left: 720 },
        });
        const url = URL.createObjectURL(fileBuffer);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// --- REACT COMPONENTS ---

const LoadingScreen: FC<{ message?: string }> = ({ message = "Loading NoteLoom..." }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '10px'}}><path d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" stroke="var(--accent-primary)" strokeWidth="2"/><path d="M7 7H17" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round"/><path d="M7 12H17" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round"/><path d="M7 17H12" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round"/></svg>
                NoteLoom
            </h1>
            <p>{message}</p>
        </div>
    );
};


const StyleInjector: FC<{ settings: Settings }> = ({ settings }) => {
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-noteloom-styles', 'true');
    styleElement.innerHTML = GlobalStyles;
    document.head.appendChild(styleElement);

    // Apply settings
    document.body.className = `${settings.theme}-theme`;
    const root = document.documentElement;
    root.style.setProperty('--accent-primary', settings.accentColor);
    root.style.setProperty('--font-family', `'${settings.fontFamily}', sans-serif`);
    root.style.setProperty('--font-size', `${settings.fontSize}px`);
    root.style.setProperty('--line-spacing', String(settings.lineSpacing));
    root.style.setProperty('--text-width', settings.textWidth === 'comfortable' ? '70ch' : '90ch');

    return () => {
      // Only remove if it still exists
      const existingStyle = document.head.querySelector('[data-noteloom-styles="true"]');
      if (existingStyle && existingStyle.parentNode) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [settings]);
  return null;
};

const Modal: FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const mouseDownOnOverlay = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the mousedown event started on the overlay itself, not a child.
    if (e.target === e.currentTarget) {
      mouseDownOnOverlay.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    // If mousedown was on the overlay and mouseup is also on the overlay, it's a click.
    if (mouseDownOnOverlay.current && e.target === e.currentTarget) {
      onClose();
    }
    // Reset for the next click.
    mouseDownOnOverlay.current = false;
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the mouse leaves the overlay while dragging, reset the state.
    mouseDownOnOverlay.current = false;
  };

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.body
  );
};


const Sidebar: FC<{
  journals: Journal[];
  activeView: View;
  activeJournalId?: string;
  onNavigate: (view: View, journalId?: string) => void;
  onTriggerAddJournal: () => void;
  onReorderJournals: (reordered: Journal[]) => void;
  isOpen: boolean;
  profiles: Profile[];
  activeProfile: Profile | null;
  onSwitchProfile: (profileId: string) => void;
}> = ({ journals, activeView, activeJournalId, onNavigate, onTriggerAddJournal, onReorderJournals, isOpen, profiles, activeProfile, onSwitchProfile }) => {
    const dragItemIndex = useRef<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent, index: number) => {
        dragItemIndex.current = index;
        const targetNode = (e.currentTarget as HTMLElement).closest('.draggable-item');
        if (targetNode) {
            targetNode.classList.add('dragging');
        }
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (dragItemIndex.current === null || !listRef.current) return;
        const children = Array.from(listRef.current.children);
        const newOverIndex = children.findIndex(child => {
            const rect = (child as HTMLElement).getBoundingClientRect();
            return e.clientY >= rect.top && e.clientY <= rect.bottom;
        });

        if (newOverIndex !== -1 && newOverIndex !== dragOverIndex.current) {
            if (dragOverIndex.current !== null) {
                (children[dragOverIndex.current] as HTMLElement)?.classList.remove('drag-over-active');
            }
            dragOverIndex.current = newOverIndex;
            if (dragOverIndex.current !== dragItemIndex.current) {
                (children[dragOverIndex.current] as HTMLElement)?.classList.add('drag-over-active');
            }
        }
    };
    
    const handlePointerUp = () => {
        if (dragItemIndex.current !== null && dragOverIndex.current !== null && dragItemIndex.current !== dragOverIndex.current) {
            const reorderedItems = [...journals];
            const [draggedItem] = reorderedItems.splice(dragItemIndex.current, 1);
            reorderedItems.splice(dragOverIndex.current, 0, draggedItem);
            onReorderJournals(reorderedItems);
        }

        document.querySelectorAll('.sidebar .draggable-item').forEach(el => el.classList.remove('dragging', 'drag-over-active'));
        dragItemIndex.current = null;
        dragOverIndex.current = null;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    };


  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`} style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <div className="sidebar-content-wrapper">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '10px'}}><path d="M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" stroke="var(--accent-primary)" strokeWidth="2"/><path d="M7 7H17" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round"/><path d="M7 12H17" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round"/><path d="M7 17H12" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round"/></svg>
            NoteLoom
        </h1>
        <div style={{ flexGrow: 1 }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '10px' }}>Journals</h3>
            <div ref={listRef}>
                {journals.map((j, index) => (
                    <div key={j.id} className="draggable-item" style={{display: 'flex', alignItems: 'stretch', marginBottom: '5px'}}>
                        <div className="drag-handle" onPointerDown={(e) => handlePointerDown(e, index)}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
                        </div>
                        <button
                            onClick={() => onNavigate('journal', j.id)}
                            style={{
                                width: '100%',
                                textAlign: 'left',
                                background: activeView === 'journal' && activeJournalId === j.id ? 'var(--accent-primary)' : 'transparent',
                                color: activeView === 'journal' && activeJournalId === j.id ? 'white' : 'var(--text-secondary)',
                                flexGrow: 1,
                                padding: '10px'
                            }}
                        >
                            {j.name}
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={onTriggerAddJournal} style={{width: '100%', textAlign: 'left', background: 'transparent', color: 'var(--accent-secondary)', marginTop: '10px'}}>+ New Journal</button>
        </div>
        <div>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem', paddingLeft: '10px' }}>Library</h3>
            <button onClick={() => onNavigate('templates')} style={{width: '100%', textAlign: 'left', background: activeView === 'templates' ? 'var(--bg-tertiary)' : 'transparent', color: 'var(--text-secondary)'}}>Templates</button>
            <button onClick={() => onNavigate('custom-fields')} style={{width: '100%', textAlign: 'left', background: activeView === 'custom-fields' ? 'var(--bg-tertiary)' : 'transparent', color: 'var(--text-secondary)'}}>Custom Fields</button>
        </div>
        <div style={{borderTop: '1px solid var(--border-color)', marginTop: '1rem', paddingTop: '1rem'}}>
             <button onClick={() => onNavigate('settings')} style={{width: '100%', textAlign: 'left', background: activeView === 'settings' ? 'var(--bg-tertiary)' : 'transparent', color: 'var(--text-secondary)'}}>Account/Settings</button>
             <ProfileSwitcher 
                profiles={profiles}
                activeProfile={activeProfile}
                onSwitchProfile={onSwitchProfile}
                onNavigate={onNavigate}
             />
        </div>
      </div>
    </div>
  );
};

const ProfileSwitcher: FC<{
    profiles: Profile[];
    activeProfile: Profile | null;
    onSwitchProfile: (profileId: string) => void;
    onNavigate: (view: View) => void;
}> = ({ profiles, activeProfile, onSwitchProfile, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!activeProfile) return null;

    return (
        <div ref={wrapperRef} style={{ position: 'relative', marginTop: '0.5rem' }}>
            {isOpen && (
                <div className="profile-menu">
                    {profiles.map(p => (
                        <div key={p.id} onClick={() => { onSwitchProfile(p.id); setIsOpen(false); }}
                            className={`profile-menu-item ${p.id === activeProfile.id ? 'active' : ''}`}>
                            {p.name}
                        </div>
                    ))}
                    <div style={{borderTop: '1px solid var(--border-color)'}}>
                        <button onClick={() => { onNavigate('profile-manager'); setIsOpen(false); }}>Manage Profiles</button>
                    </div>
                </div>
            )}
            <button onClick={() => setIsOpen(o => !o)} style={{ width: '100%', textAlign: 'left', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', justifyContent: 'space-between' }}>
                <span>{activeProfile.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/></svg>
            </button>
        </div>
    );
};

const OnboardingView: FC<{
    onCreateProfile: (name: string) => void;
    setUsername: React.Dispatch<React.SetStateAction<string | null>>;
    setSecretPhrase: React.Dispatch<React.SetStateAction<string | null>>;
    setUserUUID: React.Dispatch<React.SetStateAction<string | null>>;
    topLevelState: TopLevelState;
    setTopLevelState: React.Dispatch<React.SetStateAction<TopLevelState>>;
}> = ({ onCreateProfile, setUsername, setSecretPhrase, setUserUUID, topLevelState, setTopLevelState }) => {
    const [profileName, setProfileName] = useState('');
    const [enableSync, setEnableSync] = useState(false);
    const [username, setUsernameLocal] = useState('');
    const [secretPhrase, setSecretPhraseLocal] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // If sync is enabled and credentials are provided, try to log in
            if (enableSync && username.trim() && secretPhrase.trim() && secretPhrase.trim().length >= 6) {
                const trimmedUsername = username.trim();
                const trimmedSecretPhrase = secretPhrase.trim();
                
                // Generate UUID from credentials
                let uuid: string;
                try {
                    uuid = await generateUUIDFromCredentials(trimmedUsername, trimmedSecretPhrase);
                } catch (err) {
                    uuid = generateUUIDFromCredentialsSync(trimmedUsername, trimmedSecretPhrase);
                }
                
                // Save credentials and UUID
                setUsername(trimmedUsername);
                setSecretPhrase(trimmedSecretPhrase);
                setUserUUID(uuid);
                
                // Try to authenticate and load existing data
                const authSuccess = await authenticateSupabase(trimmedUsername, trimmedSecretPhrase, uuid);
                
                if (authSuccess) {
                    // Try to load existing profiles
                    const existingProfilesResult = await loadFromSupabase(uuid, 'profiles');
                    
                    if (existingProfilesResult && existingProfilesResult.data && existingProfilesResult.data.profiles && existingProfilesResult.data.profiles.length > 0) {
                        // Account exists - load existing data
                        logDebug('Logging in to existing account, loading profiles');
                        setTopLevelState(existingProfilesResult.data);
                        // Reload to sync everything
                        window.location.reload();
                        return;
                    } else {
                        // New account - create profile if name provided, otherwise create "Personal"
                        const finalProfileName = profileName.trim() || 'Personal';
                        onCreateProfile(finalProfileName);
                        // Save credentials are already set above
                    }
                } else {
                    // Authentication failed, but we'll still create the account
                    // Create profile if name provided, otherwise create "Personal"
                    const finalProfileName = profileName.trim() || 'Personal';
                    onCreateProfile(finalProfileName);
                }
            } else {
                // No sync - just create profile (name required if no sync)
                if (profileName.trim()) {
                    onCreateProfile(profileName.trim());
                } else {
                    alert('Please enter a profile name.');
                    setIsLoading(false);
                }
            }
        } catch (error) {
            console.error('Error during login/create:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: 'var(--bg-primary)',
            padding: '2rem'
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '800px',
                width: '100%'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.25rem',
                    color: 'var(--text-primary)'
                }}>
                    Welcome to NoteLoom
                </h1>
                <p style={{
                    fontSize: '1.2rem',
                    color: 'var(--text-secondary)',
                    marginTop: '1rem',
                    marginBottom: '3rem',
                    lineHeight: '1.6'
                }}>
                    Start by creating and naming your first profile to begin organizing your journals. Profiles act as categories for your journals, letting you separate them by focus areas such as Personal, Health, Finance, Creative, Academic, or Spiritual. You can tailor it however you like; it's designed for flexibility.
                </p>
                
                <form onSubmit={handleSubmit} style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '2.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    <div className="form-group" style={{marginBottom: '1.5rem'}}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 500,
                            color: 'var(--text-primary)',
                            textAlign: 'left'
                        }}>
                            Profile Name {enableSync && <span style={{fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)'}}>(optional when logging in)</span>}
                        </label>
                        <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder={enableSync ? "e.g., Personal, Health, Finance... (optional)" : "e.g., Personal, Health, Finance..."}
                            style={{
                                fontFamily: 'var(--font-family)',
                                backgroundColor: 'var(--bg-primary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                padding: '10px',
                                fontSize: '1rem',
                                width: '100%',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            autoFocus
                        />
                    </div>
                    
                    {/* Optional Account Sync Section */}
                    <div style={{
                        marginTop: '2rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid var(--border-color)'
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1rem',
                            cursor: 'pointer',
                            fontWeight: 500,
                            color: 'var(--text-primary)'
                        }}>
                            <input
                                type="checkbox"
                                checked={enableSync}
                                onChange={(e) => setEnableSync(e.target.checked)}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer'
                                }}
                            />
                            <span>Enable server-side sync (optional)</span>
                        </label>
                        <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            marginBottom: '1.5rem',
                            marginLeft: '2rem',
                            lineHeight: '1.5'
                        }}>
                            Creating a Username and Secret Phrase will allow you to store your data server-side and sync across devices. You can skip this and use local storage only. Also use this option to Log In to a pre-existing account.
                        </p>
                        
                        {enableSync && (
                            <>
                                <div className="form-group" style={{marginBottom: '1.5rem'}}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: 500,
                                        color: 'var(--text-primary)',
                                        textAlign: 'left'
                                    }}>
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsernameLocal(e.target.value)}
                                        placeholder="Choose a username"
                                        style={{
                                            fontFamily: 'var(--font-family)',
                                            backgroundColor: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            padding: '10px',
                                            fontSize: '1rem',
                                            width: '100%',
                                            transition: 'border-color 0.2s, box-shadow 0.2s'
                                        }}
                                    />
                                </div>
                                <div className="form-group" style={{marginBottom: '1.5rem'}}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontWeight: 500,
                                        color: 'var(--text-primary)',
                                        textAlign: 'left'
                                    }}>
                                        Secret Phrase (minimum 6 characters)
                                    </label>
                                    <input
                                        type="password"
                                        value={secretPhrase}
                                        onChange={(e) => setSecretPhraseLocal(e.target.value)}
                                        placeholder="Choose a secret phrase (min 6 characters)"
                                        style={{
                                            fontFamily: 'var(--font-family)',
                                            backgroundColor: 'var(--bg-primary)',
                                            color: 'var(--text-primary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            padding: '10px',
                                            fontSize: '1rem',
                                            width: '100%',
                                            transition: 'border-color 0.2s, box-shadow 0.2s'
                                        }}
                                    />
                                    {secretPhrase.length > 0 && secretPhrase.length < 6 && (
                                        <p style={{
                                            color: 'var(--danger)',
                                            fontSize: '0.85rem',
                                            marginTop: '0.25rem',
                                            marginBottom: 0
                                        }}>
                                            Secret phrase must be at least 6 characters
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={
                            isLoading || 
                            (enableSync && (!username.trim() || !secretPhrase.trim() || secretPhrase.length < 6)) ||
                            (!enableSync && !profileName.trim())
                        }
                        style={{
                            width: '100%',
                            marginTop: '0.5rem'
                        }}
                    >
                        {isLoading ? 'Loading...' : (enableSync && username.trim() && secretPhrase.trim() && secretPhrase.length >= 6) ? 'Log In' : 'Create Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const GettingStartedView: FC<{
    onNavigate: (view: View) => void;
    onTriggerAddJournal: () => void;
}> = ({ onNavigate, onTriggerAddJournal }) => {
    return (
        <div style={{textAlign: 'center', maxWidth: '800px', margin: '4rem auto'}}>
            <h1 style={{fontSize: '2.5rem', marginBottom: '0.25rem'}}>Welcome to NoteLoom!</h1>
            <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic'}}>Made by Caleb MB</p>
            <p style={{fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: '4rem'}}>Your personal, structured journaling space. Here's how to get started:</p>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'left'}}>
                {/* Step 1 */}
                <div style={{backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '8px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                        <div style={{backgroundColor: 'color-mix(in srgb, var(--accent-primary) 20%, transparent)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--accent-primary)" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5v-2.121a.5.5 0 0 0-.146-.354l-2.121-2.121-2.121 2.121A.5.5 0 0 0 8.5 10.879V13.5h-1a.5.5 0 0 0 0 1h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-9A1.5 1.5 0 0 1 2 13.5V2.5zM3 3v10.5a.5.5 0 0 0 .5.5h3.146a.5.5 0 0 0 .354-.146L8.121 12.5l1.121-1.121a.5.5 0 0 0 0-.707L8.121 9.543 6.99 8.412a.5.5 0 0 0-.707 0L3.146 11.543A.5.5 0 0 0 3 11.879V3z"/></svg>
                        </div>
                        <h2 style={{margin: 0}}>1. Create a Journal</h2>
                    </div>
                    <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>A journal is a dedicated space for your entries, like "Personal", "Work", or "Fitness". Start by creating your first one.</p>
                    <button onClick={onTriggerAddJournal}>Create Journal</button>
                </div>
                
                {/* Step 2 */}
                <div style={{backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '8px'}}>
                     <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                        <div style={{backgroundColor: 'color-mix(in srgb, var(--accent-secondary) 20%, transparent)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--accent-secondary)" viewBox="0 0 16 16"><path d="M.5 4.5A.5.5 0 0 1 1 4h2.52a.5.5 0 0 1 .49.596l-.84 3.15a.5.5 0 0 1-.49.404H1a.5.5 0 0 1-.5-.5v-3zm3.15.404a.5.5 0 0 1 .49-.404h2.52a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H4.16a.5.5 0 0 1-.49-.404l-.84-3.15zM8.5 4.5A.5.5 0 0 1 9 4h2.52a.5.5 0 0 1 .49.596l-.84 3.15a.5.5 0 0 1-.49.404H9a.5.5 0 0 1-.5-.5v-3zm3.15.404a.5.5 0 0 1 .49-.404h2.52a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-2.52a.5.5 0 0 1-.49-.404l-.84-3.15zM1 12.5a.5.5 0 0 1 .5-.5h2.52a.5.5 0 0 1 .49.596l-.84 3.15a.5.5 0 0 1-.49.404H1.5a.5.5 0 0 1-.5-.5v-3zm3.15.404a.5.5 0 0 1 .49-.404h2.52a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5H4.16a.5.5 0 0 1-.49-.404l-.84-3.15z"/></svg>
                        </div>
                        <h2 style={{margin: 0}}>2. Define Fields</h2>
                    </div>
                    <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>Custom Fields are reusable building blocks for your templates, like "Mood" (a star rating) or "Habits" (a checklist).</p>
                    <button onClick={() => onNavigate('custom-fields')} className="secondary">Go to Custom Fields</button>
                </div>

                {/* Step 3 */}
                <div style={{backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: '8px'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                       <div style={{backgroundColor: 'color-mix(in srgb, var(--star-color) 20%, transparent)', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="var(--star-color)" viewBox="0 0 16 16"><path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3zM5 5A1.5 1.5 0 0 0 3.5 6.5v1A1.5 1.5 0 0 0 5 9h6a1.5 1.5 0 0 0 1.5-1.5v-1A1.5 1.5 0 0 0 11 5H5zM3.5 12A1.5 1.5 0 0 0 2 13.5v1A1.5 1.5 0 0 0 3.5 16h9a1.5 1.5 0 0 0 1.5-1.5v-1A1.5 1.5 0 0 0 12.5 12h-9z"/></svg>
                        </div>
                        <h2 style={{margin: 0}}>3. Build Templates</h2>
                    </div>
                    <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>Templates define the structure of your entries with text blocks, star ratings, checklists, and more. You can also browse our library of premade templates to get started quickly.</p>
                    <button onClick={() => onNavigate('templates')} className="secondary">Go to Templates</button>
                </div>
            </div>
        </div>
    );
};

const ProfileManagerView: FC<{
    profiles: Profile[];
    activeProfileId: string | null;
    onAddProfile: (name: string, stayOnProfileManager?: boolean) => void;
    onUpdateProfile: (id: string, name: string) => void;
    onDeleteProfile: (id: string) => void;
    onSwitchProfile: (id: string, stayOnProfileManager?: boolean) => void;
    onReorderProfiles: (profiles: Profile[]) => void;
}> = ({ profiles, activeProfileId, onAddProfile, onUpdateProfile, onDeleteProfile, onSwitchProfile, onReorderProfiles }) => {
    const [modalState, setModalState] = useState<{ type: 'new' | 'rename' | 'delete', profile?: Profile } | null>(null);
    const [profileName, setProfileName] = useState('');

    const dragItemIndex = useRef<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent, index: number) => {
        dragItemIndex.current = index;
        const targetNode = (e.currentTarget as HTMLElement).closest('.draggable-item');
        if (targetNode) {
            targetNode.classList.add('dragging');
        }
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (dragItemIndex.current === null || !listRef.current) return;
        const children = Array.from(listRef.current.children);
        const newOverIndex = children.findIndex(child => {
            const rect = (child as HTMLElement).getBoundingClientRect();
            return e.clientY >= rect.top && e.clientY <= rect.bottom;
        });

        if (newOverIndex !== -1 && newOverIndex !== dragOverIndex.current) {
            if (dragOverIndex.current !== null) {
                (children[dragOverIndex.current] as HTMLElement)?.classList.remove('drag-over-active');
            }
            dragOverIndex.current = newOverIndex;
            if (dragOverIndex.current !== dragItemIndex.current) {
                (children[dragOverIndex.current] as HTMLElement)?.classList.add('drag-over-active');
            }
        }
    };
    
    const handlePointerUp = () => {
        if (dragItemIndex.current !== null && dragOverIndex.current !== null && dragItemIndex.current !== dragOverIndex.current) {
            const reorderedItems = [...profiles];
            const [draggedItem] = reorderedItems.splice(dragItemIndex.current, 1);
            reorderedItems.splice(dragOverIndex.current, 0, draggedItem);
            onReorderProfiles(reorderedItems);
        }

        document.querySelectorAll('.profile-manager-view .draggable-item').forEach(el => el.classList.remove('dragging', 'drag-over-active'));
        dragItemIndex.current = null;
        dragOverIndex.current = null;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    };


    const openModal = (type: 'new' | 'rename' | 'delete', profile?: Profile) => {
        setModalState({ type, profile });
        setProfileName(profile?.name || '');
    };

    const closeModal = () => {
        setModalState(null);
        setProfileName('');
    };

    const handleSave = () => {
        if (!profileName.trim()) return;
        if (modalState?.type === 'new') {
            onAddProfile(profileName, true); // Pass true to stay on profile manager
        }
        if (modalState?.type === 'rename' && modalState.profile) {
            onUpdateProfile(modalState.profile.id, profileName);
        }
        closeModal();
    };
    
    const handleDelete = () => {
        if(modalState?.type === 'delete' && modalState.profile) {
            onDeleteProfile(modalState.profile.id);
        }
        closeModal();
    }

    return (
        <div className="profile-manager-view">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Manage Profiles</h1>
                <button onClick={() => openModal('new')}>+ New Profile</button>
            </div>
            <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {profiles.map((profile, index) => (
                    <div key={profile.id} className="draggable-item" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                        <div className="drag-handle" onPointerDown={(e) => handlePointerDown(e, index)}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
                        </div>
                        <div onClick={() => onSwitchProfile(profile.id, true)} style={{ flexGrow: 1, padding: '1rem', cursor: 'pointer' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: 0 }}>
                                {profile.name}
                                {profile.id === activeProfileId && <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', marginLeft: '10px' }}>(Active)</span>}
                            </h3>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', paddingRight: '1.5rem' }}>
                            <button onClick={() => openModal('rename', profile)} className="secondary" style={{ fontSize: '0.9rem', padding: '5px 10px' }}>Rename</button>
                            <button onClick={() => openModal('delete', profile)} className="danger" style={{ fontSize: '0.9rem', padding: '5px 10px' }} disabled={profiles.length <= 1}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            
            <Modal isOpen={!!modalState} onClose={closeModal}>
                {modalState?.type === 'delete' ? (
                    <div>
                        <h2>Delete Profile</h2>
                        <p style={{margin: '1rem 0'}}>Are you sure you want to delete the profile "{modalState.profile?.name}" and all of its associated data? This action cannot be undone.</p>
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                            <button className="secondary" onClick={closeModal}>Cancel</button>
                            <button className="danger" onClick={handleDelete}>Delete Forever</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2>{modalState?.type === 'new' ? 'New Profile' : 'Rename Profile'}</h2>
                        <div className="form-group" style={{marginTop: '2rem'}}>
                            <label>Profile Name</label>
                            <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="e.g., Work Journals" />
                        </div>
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                            <button className="secondary" onClick={closeModal}>Cancel</button>
                            <button onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const JournalView: FC<{
  journal: Journal;
  entries: Entry[];
  templates: Template[];
  customFieldDefs: CustomFieldDef[];
  settings: Settings;
  onAddEntry: (entry: Omit<Entry, 'id'>) => void;
  onUpdateEntry: (entry: Entry) => void;
  onDeleteEntry: (entryId: string) => void;
  onUpdateJournal: (journalId: string, updates: Partial<Journal>) => void;
  onDeleteJournal: (journalId: string) => void;
}> = ({ journal, entries, templates, customFieldDefs, settings, onAddEntry, onUpdateEntry, onDeleteEntry, onUpdateJournal, onDeleteJournal }) => {
    const [editorState, setEditorState] = useState<{ mode: 'new' | 'edit' | 'new-simple', entry?: Entry } | null>(null);
    const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(journal.defaultTemplateId);
    const [activeTab, setActiveTab] = useState('entries');
    const [exportMenuOpenFor, setExportMenuOpenFor] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [editedJournalName, setEditedJournalName] = useState(journal.name);

    useEffect(() => {
        setEditedJournalName(journal.name);
    }, [journal.name]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuOpenFor && !(event.target as HTMLElement).closest('.export-menu-container')) {
                setExportMenuOpenFor(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [exportMenuOpenFor]);

    useEffect(() => {
        setSelectedTemplateId(journal.defaultTemplateId);
    }, [journal.id, journal.defaultTemplateId]);

    const handleNewEntry = () => {
        if (!selectedTemplateId) return;
        setEditorState({ mode: 'new' });
    };
    
    const handleNewSimpleNote = () => {
        setEditorState({ mode: 'new-simple' });
    };

    const handleEditEntry = (entry: Entry) => {
        setEditorState({ mode: 'edit', entry });
    };
    
    const handleSave = (fullFormData: Record<string, any>) => {
        if (!editorState) return;
    
        const { title, ...entryData } = fullFormData;
    
        if (editorState.mode === 'edit' && editorState.entry) {
            onUpdateEntry({ ...editorState.entry, title: title || undefined, data: entryData });
        } else if (editorState.mode === 'new' && selectedTemplateId) {
            onAddEntry({
                journalId: journal.id,
                templateId: selectedTemplateId,
                createdAt: new Date().toISOString(),
                title: title || undefined,
                data: entryData,
            });
        } else if (editorState.mode === 'new-simple') {
            onAddEntry({
                journalId: journal.id,
                templateId: 'SIMPLE_NOTE_TEMPLATE',
                createdAt: new Date().toISOString(),
                title: title || undefined,
                data: entryData
            })
        }
        setEditorState(null);
    };

    const handleCancel = () => {
        setEditorState(null);
    };

    const confirmDeleteEntry = () => {
        if (entryToDelete) {
            onDeleteEntry(entryToDelete.id);
            setEntryToDelete(null);
        }
    }

    const handleExport = async (format: 'pdf' | 'docx', entry?: Entry) => {
        setIsExporting(true);
        setExportMenuOpenFor(null);

        const entriesToExport = entry ? [entry] : entries;
        const baseFilename = entry
            ? `${journal.name} - ${new Date(entry.createdAt).toLocaleDateString()}`
            : `${journal.name} - Export ${new Date().toLocaleDateString()}`;

        try {
            const htmlContent = generateHtmlForEntries(entriesToExport, templates, customFieldDefs);
            await exportDocument(format, baseFilename, htmlContent);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Sorry, there was an error generating your document.");
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleSaveJournalName = () => {
        if(editedJournalName.trim() && editedJournalName.trim() !== journal.name) {
            onUpdateJournal(journal.id, { name: editedJournalName.trim() });
        }
    };

    const editorTemplate = useMemo(() => {
        if (!editorState) return undefined;

        const templateId = editorState.mode === 'edit' ? editorState.entry?.templateId : selectedTemplateId;

        if (editorState.mode === 'new-simple' || templateId === 'SIMPLE_NOTE_TEMPLATE') {
            const simpleTemplate: Template = {
                id: 'SIMPLE_NOTE_TEMPLATE',
                name: 'Simple Note',
                blocks: [{ id: 'notes', type: 'rich-text', label: 'Notes', color: '#a0a0a0' }]
            };
            return simpleTemplate;
        }

        return templates.find(t => t.id === templateId);
    }, [editorState, templates, selectedTemplateId]);

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h1>{journal.name}</h1>
            </div>

            <div className="tabs">
              <div className={`tab ${activeTab === 'entries' ? 'active' : ''}`} onClick={() => setActiveTab('entries')}>Entries</div>
              <div className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</div>
            </div>

            {isExporting && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px', zIndex: 1020, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    Generating document...
                </div>
            )}

            {activeTab === 'entries' && (
              <>
                <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap'}}>
                    <button onClick={handleNewSimpleNote} className="secondary" style={{ flexShrink: 0 }}>+ Simple Note</button>
                    <div style={{ flexGrow: 1, display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'flex-end'}}>
                        <select value={selectedTemplateId || ''} onChange={e => setSelectedTemplateId(e.target.value)} style={{minWidth: '200px', flexBasis: '200px'}}>
                            <option value="" disabled>Select a template...</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button onClick={handleNewEntry} disabled={!selectedTemplateId} style={{ flexShrink: 0 }}>+ New Entry</button>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: settings.viewDensity === 'comfortable' ? '1rem' : '0.5rem' }}>
                    {entries.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No entries yet.</p>}
                    {entries.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(entry => {
                        let template: Template | undefined = templates.find(t => t.id === entry.templateId);
                        if (entry.templateId === 'SIMPLE_NOTE_TEMPLATE') {
                            template = {
                                id: 'SIMPLE_NOTE_TEMPLATE',
                                name: 'Simple Note',
                                blocks: [{ id: 'notes', type: 'rich-text', label: 'Notes', color: '#a0a0a0' }]
                            };
                        }
                        if (!template) return null;

                        return (
                            <div key={entry.id} className={`entry-card ${settings.viewDensity}`} style={{backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', position: 'relative'}}>
                               <div style={{position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem'}}>
                                    <button className="secondary" onClick={() => handleEditEntry(entry)} style={{padding: '4px 8px', fontSize: '0.8rem'}}>Edit</button>
                                    <button className="danger" onClick={() => setEntryToDelete(entry)} style={{padding: '4px 8px', fontSize: '0.8rem'}}>Delete</button>
                                    <div className="export-menu-container" style={{position: 'relative'}}>
                                        <button className="secondary" onClick={() => setExportMenuOpenFor(exportMenuOpenFor === entry.id ? null : entry.id)} style={{padding: '4px 8px', fontSize: '0.8rem'}}>...</button>
                                        {exportMenuOpenFor === entry.id && (
                                            <div className="export-menu">
                                                <button onClick={() => handleExport('pdf', entry)}>Export as PDF</button>
                                                <button onClick={() => handleExport('docx', entry)}>Export as DOCX</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                               {entry.title && <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{entry.title}</h2>}
                               <p style={{color: 'var(--text-secondary)', marginBottom: '1rem'}}>{new Date(entry.createdAt).toLocaleString()} <em style={{marginLeft: '10px'}}>({template.name})</em></p>
                               {template.blocks.map(block => {
                                   const valueKey = block.type === 'rich-text' && entry.templateId === 'SIMPLE_NOTE_TEMPLATE' ? 'notes' : block.id;
                                   return (
                                       <div key={block.id} style={{marginBottom: '1rem'}}>
                                           <h3 style={{fontSize: '1rem', color: block.color || 'var(--text-secondary)'}}>{block.label}</h3>
                                           <FieldValueDisplay block={block} value={entry.data[valueKey]} customFieldDefs={customFieldDefs} />
                                       </div>
                                   );
                               })}
                            </div>
                        );
                    })}
                </div>
              </>
            )}
            
            {activeTab === 'settings' && (
              <div>
                <h2>Journal Settings</h2>
                <div style={{marginTop: '2rem', padding: '1.5rem', border: `1px solid var(--border-color)`, borderRadius: '8px'}}>
                  <h3>Rename Journal</h3>
                  <div className="form-group" style={{margin: '1rem 0 0 0'}}>
                    <label>Journal Name</label>
                    <input type="text" value={editedJournalName} onChange={e => setEditedJournalName(e.target.value)} />
                  </div>
                  <button onClick={handleSaveJournalName} disabled={!editedJournalName.trim() || editedJournalName.trim() === journal.name} style={{marginTop: '1rem'}}>
                      Save Name
                  </button>
                </div>
                 <div style={{marginTop: '2rem', padding: '1.5rem', border: `1px solid var(--border-color)`, borderRadius: '8px'}}>
                  <h3>Export</h3>
                  <p style={{color: 'var(--text-secondary)', margin: '0.5rem 0 1rem'}}>Export all entries from this journal into a single file.</p>
                  <div style={{display: 'flex', gap: '1rem'}}>
                    <button className="secondary" onClick={() => handleExport('pdf')}>Export as PDF</button>
                    <button className="secondary" onClick={() => handleExport('docx')}>Export as DOCX</button>
                  </div>
                </div>
                <div style={{marginTop: '2rem', padding: '1.5rem', border: `1px solid var(--danger)`, borderRadius: '8px'}}>
                  <h3 style={{color: 'var(--danger)'}}>Delete Journal</h3>
                  <p style={{color: 'var(--text-secondary)', margin: '0.5rem 0 1rem'}}>This action is permanent and cannot be undone. All entries in this journal will be lost.</p>
                  <button className="danger" onClick={() => onDeleteJournal(journal.id)}>Delete this journal</button>
                </div>
              </div>
            )}
            
            <Modal isOpen={!!editorState} onClose={handleCancel}>
                {editorTemplate && (
                    <EntryEditor
                        template={editorTemplate}
                        entry={editorState?.entry}
                        customFieldDefs={customFieldDefs}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                )}
            </Modal>
            
            <Modal isOpen={!!entryToDelete} onClose={() => setEntryToDelete(null)}>
                <h2>Confirm Deletion</h2>
                <p style={{margin: '1rem 0'}}>Are you sure you want to delete this entry from {new Date(entryToDelete?.createdAt || '').toLocaleString()}? This action cannot be undone.</p>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                    <button className="secondary" onClick={() => setEntryToDelete(null)}>Cancel</button>
                    <button className="danger" onClick={confirmDeleteEntry}>Delete</button>
                </div>
            </Modal>
        </div>
    );
}

const FieldValueDisplay: FC<{
    block: BlockDef;
    value: any;
    customFieldDefs: CustomFieldDef[];
}> = ({ block, value, customFieldDefs }) => {
    if (value === null || typeof value === 'undefined' || value === '') {
        return <p style={{color: 'var(--text-secondary)'}}>N/A</p>;
    }

    if (block.type === 'rich-text') {
        const dompurify = (window as any).DOMPurify;
        const cleanHtml = dompurify ? dompurify.sanitize(value) : value;
        return <div className="rich-text-viewer" dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
    }

    const fieldDef = customFieldDefs.find(cf => cf.id === block.customFieldId);
    if (!fieldDef) {
        return <p style={{color: 'var(--danger)'}}>Field definition not found.</p>;
    }

    switch (fieldDef.type) {
        case 'url':
            return <a href={value} target="_blank" rel="noopener noreferrer" style={{color: 'var(--accent-secondary)'}}>{value}</a>;
        case 'checkbox':
            return <p>{value ? 'Checked' : 'Unchecked'}</p>;
        case 'star-rating':
            return <p>{'★'.repeat(value)}{'☆'.repeat((fieldDef.max || 5) - value)}</p>;
        case 'checklist':
            return (
                <ul style={{listStyle: 'none'}}>
                    {fieldDef.options?.map(opt => (
                        <li key={opt}>
                            <input type="checkbox" checked={!!value[opt]} readOnly disabled style={{marginRight: '8px'}} />
                            {opt}
                        </li>
                    ))}
                </ul>
            );
        case 'time': {
            if (typeof value !== 'string' || !value.includes(':')) {
                return <p>{String(value)}</p>;
            }
            const [hourString, minute] = value.split(':');
            const hour = parseInt(hourString, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            let formattedHour = hour % 12;
            if (formattedHour === 0) {
                formattedHour = 12; // 0 hour should be 12 AM
            }
            return <p>{`${formattedHour}:${minute} ${ampm}`}</p>;
        }
        case 'multi-select':
             return <p>{Array.isArray(value) ? value.join(', ') : ''}</p>;
        case 'audio-recording':
            return <audio controls src={value} />;
        case 'file-upload':
            if(typeof value === 'string' && value.startsWith('data:image')) {
                return <img src={value} alt="upload" style={{maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginTop: '0.5rem'}} />;
            }
            return <p>File data exists.</p>; // Don't link to data URLs for security
        default:
            return <p style={{whiteSpace: 'pre-wrap'}}>{String(value)}</p>;
    }
}

const EntryEditor: FC<{
    template: Template;
    entry?: Entry;
    customFieldDefs: CustomFieldDef[];
    onSave: (data: Record<string, any>) => void;
    onCancel: () => void;
}> = ({ template, entry, customFieldDefs, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initialData = entry?.data || {};
        // Special handling for simple notes on initial load
        if (template.id === 'SIMPLE_NOTE_TEMPLATE' && entry?.data?.notes) {
            initialData.notes = entry.data.notes;
        }
        return {
            title: entry?.title || '',
            ...initialData
        };
    });

    const handleSave = () => {
        onSave(formData);
    };

    const setFieldValue = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const renderField = (block: BlockDef) => {
        const valueKey = block.type === 'rich-text' && template.id === 'SIMPLE_NOTE_TEMPLATE' ? 'notes' : block.id;
        if (block.type === 'rich-text') {
            return <RichTextEditor value={formData[valueKey] || ''} onChange={(val) => setFieldValue(valueKey, val)} />;
        }

        if (block.type === 'custom-field') {
            const fieldDef = customFieldDefs.find(cf => cf.id === block.customFieldId);
            if (!fieldDef) return <p>Field definition not found. It may have been deleted.</p>;

            return <CustomFieldInput block={block} fieldDef={fieldDef} value={formData[block.id]} onChange={(val) => setFieldValue(block.id, val)} />;
        }
        return null;
    };

    return (
        <div>
            <h2>{entry ? 'Edit Entry' : 'New Entry'}: {template.name}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ marginTop: '2rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '1rem' }}>
                <div className="form-group">
                    <label>Title (Optional)</label>
                    <input
                        type="text"
                        value={formData.title || ''}
                        onChange={e => setFieldValue('title', e.target.value)}
                        placeholder="e.g., A Productive Monday"
                    />
                </div>
                {template.blocks.map(block => {
                    const fieldDef = block.customFieldId ? customFieldDefs.find(cf => cf.id === block.customFieldId) : undefined;
                    return (
                        <div key={block.id} className="form-group">
                            <label style={{ color: block.color || 'var(--text-secondary)' }}>{block.label}{fieldDef?.prompt ? <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> - {fieldDef.prompt}</span> : ''}</label>
                            {renderField(block)}
                        </div>
                    );
                })}
            </form>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
                <button type="button" onClick={handleSave}>Save Entry</button>
            </div>
        </div>
    );
};

const CustomFieldInput: FC<{
    block: BlockDef;
    fieldDef: CustomFieldDef;
    value: any;
    onChange: (value: any) => void;
}> = ({ block, fieldDef, value, onChange }) => {
    const genericOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    switch (fieldDef.type) {
        case 'plain-text':
        case 'url':
            return <input type={fieldDef.type === 'url' ? 'url' : 'text'} value={value || ''} onChange={genericOnChange} />;
        case 'text-area':
        case 'prompt-text':
            return <textarea value={value || ''} onChange={genericOnChange} placeholder={fieldDef.prompt} />;
        case 'rich-text':
        case 'rich-prompt-text':
             return <RichTextEditor value={value || ''} onChange={onChange} placeholder={fieldDef.prompt} />;
        case 'number':
            return <input type="number" value={value || ''} onChange={genericOnChange} />;
        case 'date':
        case 'time':
        case 'datetime-local':
            return <input type={fieldDef.type} value={value || ''} onChange={genericOnChange} />;
        case 'checkbox':
            return <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />;
        case 'counter':
            return (
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <button type="button" className="secondary" onClick={() => onChange((Number(value) || 0) - 1)}>-</button>
                    <input type="number" value={value || 0} onChange={genericOnChange} style={{textAlign: 'center', minWidth: '80px'}}/>
                    <button type="button" className="secondary" onClick={() => onChange((Number(value) || 0) + 1)}>+</button>
                </div>
            );
        case 'slider':
            return (
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <input type="range" min={fieldDef.min || 0} max={fieldDef.max || 100} value={value || fieldDef.min || 0} onChange={genericOnChange} style={{padding: '0'}}/>
                    <span>{value || fieldDef.min || 0}</span>
                </div>
            );
        case 'dropdown':
            return (
                <select value={value || ''} onChange={genericOnChange}>
                    <option value="">-- Select --</option>
                    {fieldDef.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        case 'multi-select':
            return (
                <select multiple value={value || []} onChange={e => onChange(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} style={{minHeight: '120px'}}>
                    {fieldDef.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        case 'checklist': {
            const currentValues = value || {};
            return (
                <div>
                {fieldDef.options?.map(opt => (
                    <div key={opt} style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                        <input type="checkbox" id={`${block.id}-${opt}`} checked={!!currentValues[opt]} onChange={e => onChange({...currentValues, [opt]: e.target.checked})} style={{width: 'auto', marginRight: '10px'}}/>
                        <label htmlFor={`${block.id}-${opt}`} style={{marginBottom: 0, fontWeight: 400}}>{opt}</label>
                    </div>
                ))}
                </div>
            );
        }
        case 'star-rating': {
            const max = fieldDef.max || 5;
            return (
                <div>
                    {[...Array(max)].map((_, i) => (
                        <span key={i} onClick={() => onChange(i + 1)} style={{cursor: 'pointer', fontSize: '2rem', color: i < (value || 0) ? 'var(--star-color)' : 'var(--border-color)'}}>
                            ★
                        </span>
                    ))}
                </div>
            )
        }
        case 'linear-scale': {
            const min = fieldDef.min || 1;
            const max = fieldDef.max || 5;
            return (
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem'}}>
                    <span style={{color: 'var(--text-secondary)'}}>{fieldDef.minLabel}</span>
                    {[...Array(max - min + 1)].map((_, i) => {
                        const num = min + i;
                        return (
                        <label key={num} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer'}}>
                            {num}
                            <input type="radio" name={block.id} value={num} checked={Number(value) === num} onChange={genericOnChange} />
                        </label>
                        )
                    })}
                    <span style={{color: 'var(--text-secondary)'}}>{fieldDef.maxLabel}</span>
                </div>
            )
        }
        case 'audio-recording':
            return <AudioRecorder value={value} onChange={onChange} />;
        case 'file-upload': {
            const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        onChange(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                }
            }
            return (
                <div>
                    <input type="file" onChange={handleFileChange} accept={fieldDef.fileConfig?.accept} />
                    {value && typeof value === 'string' && value.startsWith('data:image') && <img src={value} style={{maxWidth: '200px', marginTop: '1rem', borderRadius: '4px'}} />}
                </div>
            )
        }
        default:
            return <input type="text" value={value || ''} onChange={genericOnChange} />;
    }
}

const AudioRecorder: FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    onChange(reader.result as string);
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div>
            {value && !isRecording && <audio controls src={value} style={{marginBottom: '1rem', width: '100%'}}/>}
            {!isRecording ? (
                <button type="button" className="secondary" onClick={handleStartRecording}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/><path d="M8 8a3 3 0 0 0-3 3v.5a.5.5 0 0 0 1 0V11a2 2 0 0 1 4 0v.5a.5.5 0 0 0 1 0V11a3 3 0 0 0-3-3z"/></svg>
                    {value ? 'Record New' : 'Record Audio'}
                </button>
            ) : (
                <button type="button" className="danger" onClick={handleStopRecording}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/></svg>
                    Stop Recording
                </button>
            )}
        </div>
    );
};

const FONT_FAMILIES = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'Inter', 'Lora', 'Roboto Slab', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Playfair Display'];
const FONT_SIZES = [
  { name: '10px', value: '1' },
  { name: '12px', value: '2' },
  { name: '16px', value: '3' },
  { name: '18px', value: '4' },
  { name: '24px', value: '5' },
  { name: '32px', value: '6' },
  { name: '48px', value: '7' },
];

const rgbToHex = (rgbStr: string) => {
    if (!rgbStr || !rgbStr.startsWith('rgb')) return '#ffffff';
    const match = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#ffffff';
    const [, r, g, b] = match.map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0')}`;
};

const RichTextEditor: FC<{ value: string; onChange: (value: string) => void; placeholder?: string }> = ({ value, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = useState<Record<string, boolean | string>>({});

    const isEmpty = useMemo(() => {
        if (!value || value.trim() === '' || value === '<p><br></p>' || value === '<br>') {
            return true;
        }
        // Use a temporary element to robustly check if the content is just whitespace
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;
        return tempDiv.textContent?.trim() === '';
    }, [value]);

    const updateToolbarState = () => {
        if (!editorRef.current) return;
        const formats: Record<string, boolean | string> = {};
        const commands = ['bold', 'italic', 'underline', 'strikethrough', 'insertOrderedList', 'insertUnorderedList', 'justifyLeft', 'justifyCenter', 'justifyRight'];
        commands.forEach(cmd => {
            if (document.queryCommandState(cmd)) formats[cmd] = true;
        });
        
        const block = document.queryCommandValue('formatBlock');
        if (block) formats.formatBlock = block;

        formats.fontName = document.queryCommandValue('fontName').replace(/['"]/g, '');
        formats.fontSize = document.queryCommandValue('fontSize');
        formats.foreColor = rgbToHex(document.queryCommandValue('foreColor'));

        let node = window.getSelection()?.anchorNode;
        while(node && node !== editorRef.current) {
            if(node.nodeName === 'UL' && (node as HTMLElement).dataset.type === 'checklist') {
                formats.checklist = true;
                break;
            }
            node = node.parentNode;
        }
        
        setActiveFormats(formats);
    };
    
    useEffect(() => {
        document.execCommand('styleWithCSS', false, 'true');

        const editor = editorRef.current;
        if (!editor) return;

        const handleSelectionChange = () => updateToolbarState();
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const execCmd = (command: string, value: string | null = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        updateToolbarState();
    };

    const handleInput = () => {
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };

    const handleIndentAction = (isOutdent: boolean) => {
        const selection = window.getSelection();
        if (!editorRef.current || !selection?.anchorNode) return;
    
        let elementToModify: HTMLElement | null = selection.anchorNode.nodeType === Node.TEXT_NODE 
            ? selection.anchorNode.parentElement 
            : selection.anchorNode as HTMLElement;
    
        while (elementToModify && elementToModify !== editorRef.current && window.getComputedStyle(elementToModify).display !== 'block' && window.getComputedStyle(elementToModify).display !== 'list-item') {
            elementToModify = elementToModify.parentElement;
        }
        
        if (!elementToModify || elementToModify === editorRef.current) {
             // If no block element is found (e.g., first line), wrap the content in a paragraph and indent that.
            execCmd('formatBlock', 'p');
            // After wrapping, re-run the logic to find the new paragraph.
            setTimeout(() => handleIndentAction(isOutdent), 0);
            return;
        }
    
        const isInsideList = elementToModify.closest('li');
    
        if (isInsideList) {
            execCmd(isOutdent ? 'outdent' : 'indent');
        } else {
            const INDENT_SIZE_PX = 40;
            const currentPadding = parseInt(elementToModify.style.paddingLeft || '0', 10);
            let newPadding = isOutdent 
                ? Math.max(0, currentPadding - INDENT_SIZE_PX)
                : currentPadding + INDENT_SIZE_PX;
            
            elementToModify.style.paddingLeft = newPadding > 0 ? `${newPadding}px` : '';
            handleInput(); 
        }
    };
    
    const handleLink = () => {
        const url = prompt("Enter URL:", "https://");
        if (url) execCmd('createLink', url);
    };
    
    const handleImage = () => {
        const url = prompt("Enter image URL:");
        if (url) execCmd('insertImage', url);
    };

    const handleChecklist = () => {
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;
    
        let listNode = selection.anchorNode;
        while(listNode && listNode !== editorRef.current) {
            if(listNode.nodeName === 'UL' || listNode.nodeName === 'OL') break;
            listNode = listNode.parentNode;
        }
        if (listNode === editorRef.current) listNode = null;
    
        if (listNode) { // Already in a list
            const ul = listNode as HTMLUListElement;
            if (ul.dataset.type === 'checklist') { // Is a checklist, convert to normal list
                delete ul.dataset.type;
                ul.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.parentNode?.removeChild(cb));
            } else { // Is a normal list, convert to checklist
                ul.dataset.type = 'checklist';
                ul.querySelectorAll('li').forEach(li => {
                    if (!li.querySelector('input[type="checkbox"]')) {
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        li.prepend(checkbox, ' ');
                    }
                });
            }
        } else { // Not in a list, create a new one
            execCmd('insertUnorderedList');
            // This is tricky because execCommand is sync. We need to find the new list.
            setTimeout(() => {
                const newSelection = window.getSelection();
                if (!newSelection) return;
                let newList = newSelection.anchorNode;
                 while(newList && newList !== editorRef.current) {
                    if(newList.nodeName === 'UL') break;
                    newList = newList.parentNode;
                }
                if (newList && newList.nodeName === 'UL') {
                    const ul = newList as HTMLUListElement;
                    ul.dataset.type = 'checklist';
                    ul.querySelectorAll('li').forEach(li => {
                         if (!li.querySelector('input[type="checkbox"]')) {
                            const checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            li.prepend(checkbox, ' ');
                        }
                    });
                }
                handleInput();
            }, 50);
        }
        handleInput();
        updateToolbarState();
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pastedHtml = e.clipboardData.getData('text/html');
        const pastedText = e.clipboardData.getData('text/plain');
        
        const dompurify = (window as any).DOMPurify;
        let cleanHtml = '';

        if (pastedHtml && dompurify) {
            cleanHtml = dompurify.sanitize(pastedHtml);
        } else if (pastedText) {
            cleanHtml = pastedText.replace(/\n/g, '<br>');
        }
        
        if (cleanHtml) document.execCommand('insertHTML', false, cleanHtml);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            handleIndentAction(e.shiftKey);
            return;
        }
    
        if (e.key === 'Backspace') {
            const selection = window.getSelection();
            if (!editorRef.current || !selection || !selection.isCollapsed) return;

            const range = selection.getRangeAt(0);
            if (range.startOffset !== 0) return; // Not at the beginning of the text node

            let node: Node | null = range.startContainer;
            let blockElement: HTMLElement | null = null;
            
            while(node && node !== editorRef.current) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node as HTMLElement;
                    const display = window.getComputedStyle(el).display;
                    if (display === 'block' || display === 'list-item') {
                        blockElement = el;
                        break;
                    }
                }
                node = node.parentNode;
            }

            if (!blockElement) return;

            const testRange = document.createRange();
            testRange.selectNodeContents(blockElement);
            testRange.setEnd(range.startContainer, range.startOffset);
            
            const isAtStartOfBlock = testRange.toString().trim() === '';

            if (isAtStartOfBlock) {
                const hasCustomIndent = parseInt(blockElement.style.paddingLeft || '0', 10) > 0;
                const isInsideList = blockElement.closest('li');

                if (hasCustomIndent) {
                    e.preventDefault();
                    handleIndentAction(true); // Outdent custom indent
                } else if (isInsideList) {
                    // Check if it's a nested list item
                    const isNested = blockElement.closest('ul > li ul > li, ol > li ol > li, ul > li ol > li, ol > li ul > li');
                    if(isNested) {
                        e.preventDefault();
                        execCmd('outdent'); // Outdent list item
                    }
                    // if not nested, default backspace behavior is fine (merge with prev item or convert to paragraph)
                }
            }
        }
    };
    
    const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
        updateToolbarState();
        const target = e.target as HTMLElement;
        if (target.nodeName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
            const checkbox = target as HTMLInputElement;
            if (checkbox.closest('ul[data-type="checklist"]')) {
                checkbox.checked = !checkbox.checked; // Manually toggle state
                handleInput(); // Trigger update
            }
        }
    };

    return (
        <div className="rich-text-editor-container">
            <div className="rich-text-editor-toolbar">
                <select value={typeof activeFormats.formatBlock === 'string' ? activeFormats.formatBlock : 'p'} onChange={e => execCmd('formatBlock', e.target.value)}>
                    <option value="p">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="blockquote">Blockquote</option>
                </select>
                <select value={typeof activeFormats.fontName === 'string' ? activeFormats.fontName : 'Inter'} onChange={e => execCmd('fontName', e.target.value)}>
                    {FONT_FAMILIES.map(font => <option key={font} value={font} style={{fontFamily: font}}>{font}</option>)}
                </select>
                <select value={typeof activeFormats.fontSize === 'string' ? activeFormats.fontSize : '3'} onChange={e => execCmd('fontSize', e.target.value)}>
                    {FONT_SIZES.map(size => <option key={size.value} value={size.value}>{size.name}</option>)}
                </select>
                 <div className="separator" />
                <button type="button" className={activeFormats.bold ? 'active' : ''} onMouseDown={e => {e.preventDefault(); execCmd('bold')}} title="Bold"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13h4.368zM5.07 4.002h2.167c1.625 0 2.622.82 2.622 2.159 0 1.222-.93 1.95-2.215 1.95H5.07V4.002zm2.25 4.604h2.29c1.546 0 2.508.854 2.508 2.215 0 1.355-1.01 2.225-2.5 2.225H7.32V8.606z"/></svg></button>
                <button type="button" className={activeFormats.italic ? 'active' : ''} onMouseDown={e => {e.preventDefault(); execCmd('italic')}} title="Italic"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7.991 11.683 9.865 4.26a.5.5 0 0 1 .962.246l-1.874 7.423a.5.5 0 0 1-.962-.246zM6.34 4.26a.5.5 0 0 1 .962.246L5.429 11.93a.5.5 0 0 1-.962-.246L6.34 4.26z"/></svg></button>
                <button type="button" className={activeFormats.underline ? 'active' : ''} onMouseDown={e => {e.preventDefault(); execCmd('underline')}} title="Underline"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.313 3.136h5.374v6.851H5.313zM4.313 2.136V1h7.374v1.136c0 .552-.33 1-1.025 1h-5.324c-.695 0-1.025-.448-1.025-1zM3.313 11.838h9.374v1.056H3.313z"/></svg></button>
                <button type="button" className={activeFormats.strikethrough ? 'active' : ''} onMouseDown={e => {e.preventDefault(); execCmd('strikethrough')}} title="Strikethrough"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.21 5.238c1.35-.015 2.688.63 3.237 1.763.438.895.545 1.83.134 2.603-.414.777-1.218 1.25-2.122 1.25-.824 0-1.612-.38-2.184-.946-.566-.564-.89-1.343-.84-2.14.052-.796.486-1.554 1.134-2.023.633-.458 1.41-.655 2.23-.653zm-1.09 1.14c-.583.21-.983.69-.983 1.296 0 .773.629 1.408 1.408 1.408.57 0 1.07-.353 1.29-.838-.19-.033-.38-.052-.57-.052-.79 0-1.512.29-2.062.77-.145.127-.294.24-.448.341a3.49 3.49 0 0 1-1.12-1.517c-.126-.41-.15-.82-.07-1.221.08-.4.24-.78.47-1.11.45-.65 1.12-1.08 1.9-1.18.23-.026.46-.04.69-.04.22 0 .43.013.64.04.14.018.27.04.4.06-1.03-.02-2.11.39-2.8.99z"/><path d="M2.5 7.556C2.5 7 3 6.5 3.5 6.5h1c.55 0 1 .446 1 1.056v.22c0 .59-.47 1.072-1.05 1.072h-.9c-.63 0-1.05-.52-1.05-1.125V7.556zm2 .17c0-.18-.14-.32-.31-.32h-.4c-.17 0-.3.14-.3.32v.22c0 .18.14.32.31.32h.4c.17 0 .3-.14.3-.32v-.22zM12.5 7.556c0-.556.45-1.056 1-1.056h1c.55 0 1 .446 1 1.056v.22c0 .59-.47 1.072-1.05 1.072h-.9c-.63 0-1.05-.52-1.05-1.125V7.556zm2 .17c0-.18-.14-.32-.31-.32h-.4c-.17 0-.3.14-.3.32v.22c0 .18.14.32.31.32h.4c.17 0 .3-.14.3-.32v-.22zM2.875 8h10.25a.5.5 0 0 1 0 1H2.875a.5.5 0 0 1 0-1z"/></svg></button>
                <div className="color-picker-wrapper" title="Text Color">
                   <div className="color-preview" style={{backgroundColor: typeof activeFormats.foreColor === 'string' ? activeFormats.foreColor : 'var(--text-primary)'}} />
                   <input type="color" value={typeof activeFormats.foreColor === 'string' ? activeFormats.foreColor : '#ffffff'} onChange={e => execCmd('foreColor', e.target.value)} />
                </div>
                <div className="separator" />
                <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }} className={activeFormats.insertUnorderedList ? 'active' : ''} title="Bulleted List"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg></button>
                <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('insertOrderedList'); }} className={activeFormats.insertOrderedList ? 'active' : ''} title="Numbered List"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.62 1.62A.5.5 0 0 1 2 1h1.634a.5.5 0 0 1 .5.5v1.634a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V2.12h-.38V1.62zM2.5 2h.634V2.5H2.5V2zM1.5 5.5A.5.5 0 0 1 2 5h1.5a.5.5 0 0 1 0 1H2a.5.5 0 0 1-.5-.5zM2 9.5a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H2.5a.5.5 0 0 1-.5-.5z"/><path d="M5.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 4a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 4a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5z"/></svg></button>
                <button type="button" onMouseDown={e => { e.preventDefault(); handleChecklist(); }} className={activeFormats.checklist ? 'active' : ''} title="Checklist"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.5 1a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 .5-.5h9zM4.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-7z"/><path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z"/></svg></button>
                <button type="button" onMouseDown={e => { e.preventDefault(); handleIndentAction(true); }} title="Outdent"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/><path fillRule="evenodd" d="M1.354 4.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L2.707 4l1.355 1.354a.5.5 0 1 1-.708.708l-2-2z"/></svg></button>
                <button type="button" onMouseDown={e => { e.preventDefault(); handleIndentAction(false); }} title="Indent"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/><path fillRule="evenodd" d="M3.354 4.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L4.707 4l1.355 1.354a.5.5 0 1 1-.708.708l-2-2z"/></svg></button>
                <div className="separator" />
                <button type="button" onMouseDown={e => { e.preventDefault(); handleLink(); }} title="Link"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/></svg></button>
                <button type="button" onMouseDown={e => { e.preventDefault(); handleImage(); }} title="Image"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/></svg></button>
                <div className="separator" />
                <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('justifyLeft'); }} className={activeFormats.justifyLeft ? 'active' : ''} title="Align Left"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg></button>
                <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('justifyCenter'); }} className={activeFormats.justifyCenter ? 'active' : ''} title="Align Center"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5z"/></svg></button>
                <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('justifyRight'); }} className={activeFormats.justifyRight ? 'active' : ''} title="Align Right"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M6 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg></button>
                <div className="separator" />
                <button type="button" onMouseDown={e => { e.preventDefault(); execCmd('removeFormat'); }} title="Clear Formatting"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.646 12.354a.5.5 0 0 1-.708-.708L12.292 10H2.5a.5.5 0 0 1 0-1h9.793L10.938 7.354a.5.5 0 1 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2z"/><path d="M2.5 4a.5.5 0 0 1 .5-.5h5.793l-1.147-1.146a.5.5 0 1 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L8.793 4.5H3a.5.5 0 0 1-.5-.5z"/></svg></button>
            </div>
            <div
                ref={editorRef}
                className={`rich-text-editor-content ${isEmpty ? 'with-placeholder' : ''}`}
                contentEditable
                onInput={handleInput}
                onPaste={handlePaste}
                onClick={handleEditorClick}
                onKeyDown={handleKeyDown}
                data-placeholder={placeholder}
            />
        </div>
    );
};


const CustomFieldEditor: FC<{
    field?: CustomFieldDef;
    categories: CustomFieldCategory[];
    defaultCategoryId?: string;
    onSave: (field: CustomFieldDef) => void;
    onCancel: () => void;
}> = ({ field, categories, defaultCategoryId, onSave, onCancel }) => {
    const [name, setName] = useState(field?.name || '');
    const [type, setType] = useState<CustomFieldType>(field?.type || 'plain-text');
    const [categoryId, setCategoryId] = useState(field?.categoryId || defaultCategoryId || '');
    const [options, setOptions] = useState(field?.options?.join(', ') || '');
    const [min, setMin] = useState(field?.min ?? 1);
    const [max, setMax] = useState(field?.max ?? 5);
    const [minLabel, setMinLabel] = useState(field?.minLabel || '');
    const [maxLabel, setMaxLabel] = useState(field?.maxLabel || '');
    const [promptText, setPromptText] = useState(field?.prompt || '');
    
    const isNew = !field?.id;

    const handleSave = () => {
        if (!name.trim()) {
            alert("Field name cannot be empty.");
            return;
        }
        const finalField: CustomFieldDef = {
            id: field?.id || generateId(),
            name,
            type,
            categoryId: categoryId || undefined,
        };
        
        if (['dropdown', 'checklist', 'multi-select'].includes(type)) {
            finalField.options = options.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (['slider', 'star-rating', 'linear-scale'].includes(type)) {
            finalField.min = Number(min);
            finalField.max = Number(max);
        }
        if (type === 'linear-scale') {
            finalField.minLabel = minLabel;
            finalField.maxLabel = maxLabel;
        }
        if (type === 'prompt-text' || type === 'rich-prompt-text') {
            finalField.prompt = promptText;
        }

        onSave(finalField);
    };

    const renderConfigOptions = () => {
        switch (type) {
            case 'dropdown':
            case 'checklist':
            case 'multi-select':
                return (
                    <div className="form-group">
                        <label>Options (comma-separated)</label>
                        <textarea value={options} onChange={e => setOptions(e.target.value)} placeholder="e.g., Option 1, Option 2, Option 3" />
                    </div>
                );
            case 'slider':
            case 'star-rating':
                return (
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <div className="form-group">
                            <label>Minimum</label>
                            <input type="number" value={min} onChange={e => setMin(Number(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label>Maximum</label>
                            <input type="number" value={max} onChange={e => setMax(Number(e.target.value))} />
                        </div>
                    </div>
                )
            case 'linear-scale':
                return (
                     <>
                        <div style={{display: 'flex', gap: '1rem'}}>
                            <div className="form-group">
                                <label>Minimum</label>
                                <input type="number" value={min} onChange={e => setMin(Number(e.target.value))} />
                            </div>
                            <div className="form-group">
                                <label>Maximum</label>
                                <input type="number" value={max} onChange={e => setMax(Number(e.target.value))} />
                            </div>
                        </div>
                        <div style={{display: 'flex', gap: '1rem'}}>
                            <div className="form-group">
                                <label>Min Label</label>
                                <input type="text" value={minLabel} onChange={e => setMinLabel(e.target.value)} placeholder="e.g., Not stressed" />
                            </div>
                            <div className="form-group">
                                <label>Max Label</label>
                                <input type="text" value={maxLabel} onChange={e => setMaxLabel(e.target.value)} placeholder="e.g., Very stressed" />
                            </div>
                        </div>
                    </>
                );
            case 'prompt-text':
            case 'rich-prompt-text':
                return (
                    <div className="form-group">
                        <label>Prompt / Placeholder</label>
                        <textarea value={promptText} onChange={e => setPromptText(e.target.value)} placeholder="e.g., What are you grateful for today?" />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div>
            <h2>{isNew ? 'New Custom Field' : 'Edit Custom Field'}</h2>
            <div className="form-group" style={{marginTop: '2rem'}}>
                <label>Field Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Energy Level"/>
            </div>
            <div className="form-group">
                <label>Field Type</label>
                <select value={type} onChange={e => setType(e.target.value as CustomFieldType)}>
                    {Object.entries(fieldCategories).map(([category, types]) => (
                        <optgroup label={category} key={category}>
                            {types.map(t => <option key={t} value={t}>{formatFieldTypeName(t)}</option>)}
                        </optgroup>
                    ))}
                </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                <option value="">Uncategorized</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            {renderConfigOptions()}
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)'}}>
                <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
                <button type="button" onClick={handleSave}>Save Field</button>
            </div>
        </div>
    );
};

const CustomFieldManager: FC<{
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}> = ({ appState, setAppState }) => {
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingField, setEditingField] = useState<CustomFieldDef | undefined>(undefined);
    const [defaultCategoryIdForEditor, setDefaultCategoryIdForEditor] = useState<string | undefined>();
    const [fieldToDelete, setFieldToDelete] = useState<CustomFieldDef | null>(null);

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CustomFieldCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<CustomFieldCategory | null>(null);
    const [deletionWarning, setDeletionWarning] = useState<{title: string; message: string} | null>(null);

    // Refs for category drag-and-drop
    const categoryDragItemIndex = useRef<number | null>(null);
    const categoryDragOverIndex = useRef<number | null>(null);
    const categoryListRef = useRef<HTMLDivElement>(null);

    // Refs for field drag-and-drop
    const fieldDragItemIndex = useRef<number | null>(null);
    const fieldDragOverIndex = useRef<number | null>(null);
    const fieldListRef = useRef<HTMLDivElement>(null);

    const handleCategoryPointerDown = (e: React.PointerEvent, index: number) => {
        categoryDragItemIndex.current = index;
        const targetNode = (e.currentTarget as HTMLElement).closest('.draggable-item');
        if (targetNode) targetNode.classList.add('dragging');
        window.addEventListener('pointermove', handleCategoryPointerMove);
        window.addEventListener('pointerup', handleCategoryPointerUp);
    };

    const handleCategoryPointerMove = (e: PointerEvent) => {
        if (categoryDragItemIndex.current === null || !categoryListRef.current) return;
        const children = Array.from(categoryListRef.current.children);
        const newOverIndex = children.findIndex(child => {
            const rect = (child as HTMLElement).getBoundingClientRect();
            return e.clientY >= rect.top && e.clientY <= rect.bottom;
        });

        if (newOverIndex !== -1 && newOverIndex !== categoryDragOverIndex.current) {
            if (categoryDragOverIndex.current !== null) {
                (children[categoryDragOverIndex.current] as HTMLElement)?.classList.remove('drag-over-active');
            }
            categoryDragOverIndex.current = newOverIndex;
            if (categoryDragOverIndex.current !== categoryDragItemIndex.current) {
                (children[categoryDragOverIndex.current] as HTMLElement)?.classList.add('drag-over-active');
            }
        }
    };

    const handleCategoryPointerUp = () => {
        if (categoryDragItemIndex.current !== null && categoryDragOverIndex.current !== null && categoryDragItemIndex.current !== categoryDragOverIndex.current) {
            const reorderedItems = [...categoryGridData.categories];
            const [draggedItem] = reorderedItems.splice(categoryDragItemIndex.current, 1);
            reorderedItems.splice(categoryDragOverIndex.current, 0, draggedItem);
            
            setAppState(prev => ({...prev, customFieldCategories: reorderedItems.map(c => ({ id: c.id, name: c.name }))}));
        }

        document.querySelectorAll('.custom-field-manager-categories .draggable-item').forEach(el => el.classList.remove('dragging', 'drag-over-active'));
        categoryDragItemIndex.current = null;
        categoryDragOverIndex.current = null;
        window.removeEventListener('pointermove', handleCategoryPointerMove);
        window.removeEventListener('pointerup', handleCategoryPointerUp);
    };

    const fieldsForActiveCategory = useMemo(() => {
        if (!activeCategoryId) return [];
        if (activeCategoryId === 'uncategorized') {
            return appState.customFieldDefs.filter(f => !f.categoryId || !appState.customFieldCategories.some(c => c.id === f.categoryId));
        }
        return appState.customFieldDefs.filter(f => f.categoryId === activeCategoryId);
    }, [activeCategoryId, appState.customFieldDefs, appState.customFieldCategories]);
    
    const handleFieldPointerDown = (e: React.PointerEvent, index: number) => {
        fieldDragItemIndex.current = index;
        const targetNode = (e.currentTarget as HTMLElement).closest('.draggable-item');
        if (targetNode) targetNode.classList.add('dragging');
        window.addEventListener('pointermove', handleFieldPointerMove);
        window.addEventListener('pointerup', handleFieldPointerUp);
    };

    const handleFieldPointerMove = (e: PointerEvent) => {
        if (fieldDragItemIndex.current === null || !fieldListRef.current) return;
        const children = Array.from(fieldListRef.current.children);
        const newOverIndex = children.findIndex(child => {
            const rect = (child as HTMLElement).getBoundingClientRect();
            return e.clientY >= rect.top && e.clientY <= rect.bottom;
        });

        if (newOverIndex !== -1 && newOverIndex !== fieldDragOverIndex.current) {
            if (fieldDragOverIndex.current !== null) {
                (children[fieldDragOverIndex.current] as HTMLElement)?.classList.remove('drag-over-active');
            }
            fieldDragOverIndex.current = newOverIndex;
            if (fieldDragOverIndex.current !== fieldDragItemIndex.current) {
                (children[fieldDragOverIndex.current] as HTMLElement)?.classList.add('drag-over-active');
            }
        }
    };
    
    const handleFieldPointerUp = () => {
        if (fieldDragItemIndex.current !== null && fieldDragOverIndex.current !== null && fieldDragItemIndex.current !== fieldDragOverIndex.current) {
            const reorderedCategoryFields = [...fieldsForActiveCategory];
            const [draggedItem] = reorderedCategoryFields.splice(fieldDragItemIndex.current, 1);
            reorderedCategoryFields.splice(fieldDragOverIndex.current, 0, draggedItem);
            
            setAppState(prev => {
                const allOtherFields = prev.customFieldDefs.filter(f => {
                    const fieldBelongsToCategory = activeCategoryId === 'uncategorized'
                        ? (!f.categoryId || !prev.customFieldCategories.some(c => c.id === f.categoryId))
                        : f.categoryId === activeCategoryId;
                    return !fieldBelongsToCategory;
                });
                return { ...prev, customFieldDefs: [...allOtherFields, ...reorderedCategoryFields] };
            });
        }
    
        document.querySelectorAll('.custom-field-manager-fields .draggable-item').forEach(el => el.classList.remove('dragging', 'drag-over-active'));
        fieldDragItemIndex.current = null;
        fieldDragOverIndex.current = null;
        window.removeEventListener('pointermove', handleFieldPointerMove);
        window.removeEventListener('pointerup', handleFieldPointerUp);
    };


    const handleSaveField = (field: CustomFieldDef) => {
        setAppState(prev => {
            const existing = prev.customFieldDefs.find(f => f.id === field.id);
            if (existing) {
                return { ...prev, customFieldDefs: prev.customFieldDefs.map(f => f.id === field.id ? field : f) };
            }
            return { ...prev, customFieldDefs: [...prev.customFieldDefs, field] };
        });
        handleCloseEditor();
    };

    const confirmDeleteField = () => {
        if (!fieldToDelete) return;
        setAppState(prev => ({
            ...prev,
            customFieldDefs: prev.customFieldDefs.filter(f => f.id !== fieldToDelete.id)
        }));
        setFieldToDelete(null);
    };
    
    const handleDeleteField = (field: CustomFieldDef) => {
        const templatesUsingField = appState.templates.filter(t => 
            t.blocks.some(b => b.type === 'custom-field' && b.customFieldId === field.id)
        );

        if (templatesUsingField.length > 0) {
            setDeletionWarning({
                title: "Cannot Delete Field",
                message: `This field is currently used in the following template(s): ${templatesUsingField.map(t => `"${t.name}"`).join(', ')}. Please remove it before deleting.`
            });
            return;
        }
        setFieldToDelete(field);
    };
    
    const handleNewField = (catId?: string) => {
        setEditingField(undefined);
        setDefaultCategoryIdForEditor(catId === 'uncategorized' ? undefined : catId);
        setIsEditorOpen(true);
    };
    
    const handleEditField = (field: CustomFieldDef) => {
        setEditingField(field);
        setDefaultCategoryIdForEditor(undefined);
        setIsEditorOpen(true);
    };
    
    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setEditingField(undefined);
        setDefaultCategoryIdForEditor(undefined);
    };

    const handleSaveCategory = (name: string) => {
        if (!name.trim()) return;
        setAppState(prev => {
            if (editingCategory) {
                return {...prev, customFieldCategories: prev.customFieldCategories.map(c => c.id === editingCategory.id ? {...c, name} : c)};
            }
            const newCategory = { id: generateId(), name };
            return {...prev, customFieldCategories: [...prev.customFieldCategories, newCategory]};
        });
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
    };

    const confirmDeleteCategory = () => {
        if (!categoryToDelete) return;
        setAppState(prev => ({
            ...prev,
            customFieldCategories: prev.customFieldCategories.filter(c => c.id !== categoryToDelete.id)
        }));
        setCategoryToDelete(null);
    };

    const handleDeleteCategory = (category: CustomFieldCategory) => {
        const fieldsInCategory = appState.customFieldDefs.filter(f => f.categoryId === category.id);
        if (fieldsInCategory.length > 0) {
             setDeletionWarning({
                title: "Cannot Delete Category",
                message: `This category cannot be deleted because it contains ${fieldsInCategory.length} field(s). Please move or delete the fields first.`
            });
            return;
        }
        setCategoryToDelete(category);
    };
    
    const categoryGridData = useMemo(() => {
        const categories = appState.customFieldCategories.map(cat => ({
            ...cat,
            count: appState.customFieldDefs.filter(f => f.categoryId === cat.id).length
        }));
        
        const uncategorizedCount = appState.customFieldDefs.filter(f => !f.categoryId || !appState.customFieldCategories.some(c => c.id === f.categoryId)).length;

        return { categories, uncategorizedCount };
    }, [appState.customFieldDefs, appState.customFieldCategories]);

    const activeCategory = useMemo(() => {
        if (!activeCategoryId) return null;
        if (activeCategoryId === 'uncategorized') return { id: 'uncategorized', name: 'Uncategorized' };
        return appState.customFieldCategories.find(c => c.id === activeCategoryId);
    }, [activeCategoryId, appState.customFieldCategories]);


    return (
        <div className="custom-field-manager">
            {activeCategoryId ? (
                <div className="custom-field-manager-fields">
                     <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                        <button className="secondary" onClick={() => setActiveCategoryId(null)}>&larr; Back to Categories</button>
                         <button onClick={() => handleNewField(activeCategoryId)}>+ New Field</button>
                    </div>
                    <h1 style={{fontSize: '1.8rem'}}>{activeCategory?.name}</h1>
                    <p style={{color: 'var(--text-secondary)', marginTop: '-0.5rem', marginBottom: '2rem'}}>{fieldsForActiveCategory.length} field(s)</p>

                    <div ref={fieldListRef} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        {fieldsForActiveCategory.length === 0 && <p style={{color: 'var(--text-secondary)'}}>No custom fields in this category yet.</p>}
                        {fieldsForActiveCategory.map((field, index) => (
                            <div key={field.id} className="draggable-item" style={{backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center'}}>
                                <div className="drag-handle" onPointerDown={(e) => handleFieldPointerDown(e, index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
                                </div>
                                <div style={{flexGrow: 1, padding: '1rem 0'}}>
                                    <h3 style={{fontSize: '1.1rem', marginBottom: 0}}>{field.name}</h3>
                                    <p style={{color: 'var(--text-secondary)', textTransform: 'capitalize'}}>{formatFieldTypeName(field.type)}</p>
                                </div>
                                <div style={{display: 'flex', gap: '0.5rem', paddingRight: '1rem'}}>
                                <button onClick={() => handleEditField(field)} className="secondary" style={{fontSize: '0.9rem', padding: '5px 10px'}}>Edit</button>
                                <button onClick={() => handleDeleteField(field)} className="danger" style={{fontSize: '0.9rem', padding: '5px 10px'}}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="custom-field-manager-categories">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                        <h1>Custom Fields</h1>
                        <div style={{display: 'flex', gap: '1rem'}}>
                            <button className="secondary" onClick={() => { setEditingCategory(null); setIsCategoryModalOpen(true);}}>+ New Category</button>
                            <button onClick={() => handleNewField()}>+ New Field</button>
                        </div>
                    </div>
                    
                    <div ref={categoryListRef} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                        {categoryGridData.categories.map((cat, index) => (
                             <div key={cat.id} className="draggable-item" style={{backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center'}}>
                                <div className="drag-handle" onPointerDown={(e) => handleCategoryPointerDown(e, index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
                                </div>
                                <div onClick={() => setActiveCategoryId(cat.id)} style={{flexGrow: 1, cursor: 'pointer'}}>
                                    <h3 style={{marginBottom: '0.5rem'}}>{cat.name}</h3>
                                    <p style={{color: 'var(--text-secondary)'}}>{cat.count} field(s)</p>
                                </div>
                                <div style={{marginLeft: '1rem', display: 'flex', gap: '0.5rem'}}>
                                   <button onClick={(e) => { e.stopPropagation(); setEditingCategory(cat); setIsCategoryModalOpen(true); }} className="secondary" style={{fontSize: '0.9rem', padding: '5px 10px'}}>Rename</button>
                                   <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }} className="danger" style={{fontSize: '0.9rem', padding: '5px 10px'}}>Delete</button>
                                </div>
                            </div>
                        ))}
                        {categoryGridData.uncategorizedCount > 0 && (
                            <div onClick={() => setActiveCategoryId('uncategorized')} style={{backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', cursor: 'pointer', marginTop: '1rem'}}>
                                <div style={{flexGrow: 1}}>
                                    <h3 style={{marginBottom: '0.5rem'}}>Uncategorized</h3>
                                    <p style={{color: 'var(--text-secondary)'}}>{categoryGridData.uncategorizedCount} field(s)</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {categoryGridData.categories.length === 0 && categoryGridData.uncategorizedCount === 0 && (
                         <p style={{color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4rem'}}>No custom fields or categories defined yet.</p>
                    )}
                </div>
            )}

            {/* All modals are rendered here to be available in both views */}
            <Modal isOpen={isEditorOpen} onClose={handleCloseEditor}>
                <CustomFieldEditor 
                    field={editingField} 
                    categories={appState.customFieldCategories}
                    defaultCategoryId={defaultCategoryIdForEditor}
                    onSave={handleSaveField} 
                    onCancel={handleCloseEditor}
                />
            </Modal>

            <Modal isOpen={isCategoryModalOpen} onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}>
                <CategoryEditor 
                    category={editingCategory} 
                    onSave={handleSaveCategory}
                    onCancel={() => { setIsCategoryModalOpen(false); setEditingCategory(null); }}
                />
            </Modal>
            
            <Modal isOpen={!!fieldToDelete} onClose={() => setFieldToDelete(null)}>
                <h2>Confirm Deletion</h2>
                <p style={{margin: '1rem 0'}}>Are you sure you want to delete the field "{fieldToDelete?.name}"? This cannot be undone.</p>
                 <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                    <button className="secondary" onClick={() => setFieldToDelete(null)}>Cancel</button>
                    <button className="danger" onClick={confirmDeleteField}>Delete</button>
                </div>
            </Modal>

            <Modal isOpen={!!categoryToDelete} onClose={() => setCategoryToDelete(null)}>
                <h2>Confirm Deletion</h2>
                <p style={{margin: '1rem 0'}}>Are you sure you want to delete the category "{categoryToDelete?.name}"? This cannot be undone.</p>
                 <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                    <button className="secondary" onClick={() => setCategoryToDelete(null)}>Cancel</button>
                    <button className="danger" onClick={confirmDeleteCategory}>Delete</button>
                </div>
            </Modal>
            
            <Modal isOpen={!!deletionWarning} onClose={() => setDeletionWarning(null)}>
                <h2>{deletionWarning?.title}</h2>
                <p style={{margin: '1rem 0', lineHeight: '1.6'}}>{deletionWarning?.message}</p>
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                    <button onClick={() => setDeletionWarning(null)}>OK</button>
                </div>
            </Modal>
        </div>
    );
};

const CategoryEditor: FC<{
    category: CustomFieldCategory | null;
    onSave: (name: string) => void;
    onCancel: () => void;
}> = ({ category, onSave, onCancel }) => {
    const [name, setName] = useState(category?.name || '');
    useEffect(() => {
        setName(category?.name || '');
    }, [category]);
    
    return (
        <div>
            <h2>{category ? 'Rename Category' : 'New Category'}</h2>
            <div className="form-group" style={{marginTop: '2rem'}}>
                <label>Category Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Health & Wellness" />
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                <button className="secondary" onClick={onCancel}>Cancel</button>
                <button onClick={() => onSave(name)}>Save</button>
            </div>
        </div>
    )
}

const TemplateManager: FC<{
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState>>;
    onAddPremadeTemplate: (data: { categoryName: string; templateName: string; fields: Array<PremadeField & { customizedOptions?: string[] }> }) => void;
}> = ({appState, setAppState, onAddPremadeTemplate}) => {
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
    const [isPremadeModalOpen, setIsPremadeModalOpen] = useState(false);
    
    const dragItemIndex = useRef<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent, index: number) => {
        dragItemIndex.current = index;
        const targetNode = (e.currentTarget as HTMLElement).closest('.draggable-item');
        if (targetNode) {
            targetNode.classList.add('dragging');
        }
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (dragItemIndex.current === null || !listRef.current) return;
        const children = Array.from(listRef.current.children);
        const newOverIndex = children.findIndex(child => {
            const rect = (child as HTMLElement).getBoundingClientRect();
            return e.clientY >= rect.top && e.clientY <= rect.bottom;
        });

        if (newOverIndex !== -1 && newOverIndex !== dragOverIndex.current) {
            if (dragOverIndex.current !== null) {
                (children[dragOverIndex.current] as HTMLElement)?.classList.remove('drag-over-active');
            }
            dragOverIndex.current = newOverIndex;
            if (dragOverIndex.current !== dragItemIndex.current) {
                (children[dragOverIndex.current] as HTMLElement)?.classList.add('drag-over-active');
            }
        }
    };
    
    const handlePointerUp = () => {
        if (dragItemIndex.current !== null && dragOverIndex.current !== null && dragItemIndex.current !== dragOverIndex.current) {
            const reorderedItems = [...appState.templates];
            const [draggedItem] = reorderedItems.splice(dragItemIndex.current, 1);
            reorderedItems.splice(dragOverIndex.current, 0, draggedItem);
            setAppState(prev => ({...prev, templates: reorderedItems}));
        }

        document.querySelectorAll('.template-manager .draggable-item').forEach(el => el.classList.remove('dragging', 'drag-over-active'));
        dragItemIndex.current = null;
        dragOverIndex.current = null;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    };

    const handleSaveTemplate = (template: Template) => {
        setAppState(prev => {
            const existing = prev.templates.find(t => t.id === template.id);
            if(existing) {
                return {...prev, templates: prev.templates.map(t => t.id === template.id ? template : t)};
            }
            return {...prev, templates: [...prev.templates, template]};
        });
        setEditingTemplate(null);
    }
    
    const handleNewTemplate = () => {
        setEditingTemplate({
            id: generateId(),
            name: 'New Template',
            blocks: [{id: generateId(), type: 'rich-text', label: 'Notes', color: '#a0a0a0'}]
        });
    }

    const handleEditTemplate = (template: Template) => {
        setEditingTemplate(JSON.parse(JSON.stringify(template))); // deep copy
    }
    
    const confirmDelete = () => {
        if (!templateToDelete) return;
        setAppState(prev => ({...prev, templates: prev.templates.filter(t => t.id !== templateToDelete.id)}));
        setTemplateToDelete(null);
    }


    if (editingTemplate) {
        return <TemplateEditor 
            template={editingTemplate} 
            customFieldDefs={appState.customFieldDefs}
            customFieldCategories={appState.customFieldCategories}
            onSave={handleSaveTemplate} 
            onCancel={() => setEditingTemplate(null)}
        />
    }

    return (
        <div className="template-manager">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <h1>Templates</h1>
                <div style={{display: 'flex', gap: '1rem'}}>
                    <button className="secondary" onClick={() => setIsPremadeModalOpen(true)}>Browse Premade</button>
                    <button onClick={handleNewTemplate}>+ New Template</button>
                </div>
            </div>
            <div ref={listRef} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {appState.templates.length === 0 && (
                    <p style={{color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4rem'}}>
                        No templates defined yet. Try adding one from the premade library!
                    </p>
                )}
                {appState.templates.map((template, index) => (
                    <div key={template.id} className="draggable-item" style={{backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center'}}>
                         <div className="drag-handle" onPointerDown={(e) => handlePointerDown(e, index)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
                        </div>
                        <div style={{flexGrow: 1}}>
                            <h3 style={{marginBottom: '1rem'}}>{template.name}</h3>
                            <ul style={{listStyle: 'none', color: 'var(--text-secondary)', paddingLeft: 0}}>
                                {template.blocks.slice(0, 3).map(block => <li key={block.id} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><span style={{width: '12px', height: '12px', borderRadius: '3px', backgroundColor: block.color || 'var(--text-secondary)', marginRight: '8px', flexShrink: 0}}></span> {block.label} ({block.type === 'rich-text' ? 'Text' : formatFieldTypeName(appState.customFieldDefs.find(cf=> cf.id === block.customFieldId)?.type || 'Custom')})</li>)}
                                {template.blocks.length > 3 && <li style={{color: 'var(--text-secondary)'}}>...and {template.blocks.length - 3} more</li>}
                            </ul>
                        </div>
                        <div style={{display: 'flex', gap: '0.5rem', marginLeft: '1rem'}}>
                           <button onClick={() => handleEditTemplate(template)} className="secondary" style={{fontSize: '0.9rem', padding: '5px 10px'}}>Edit</button>
                           <button onClick={() => setTemplateToDelete(template)} className="danger" style={{fontSize: '0.9rem', padding: '5px 10px'}}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            <Modal isOpen={!!templateToDelete} onClose={() => setTemplateToDelete(null)}>
                <h2>Confirm Deletion</h2>
                <p style={{margin: '1rem 0'}}>Are you sure you want to delete the template "{templateToDelete?.name}"?</p>
                 <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                    <button className="secondary" onClick={() => setTemplateToDelete(null)}>Cancel</button>
                    <button className="danger" onClick={confirmDelete}>Delete</button>
                </div>
            </Modal>
             <Modal isOpen={isPremadeModalOpen} onClose={() => setIsPremadeModalOpen(false)}>
                <PremadeTemplatesModal onAdd={onAddPremadeTemplate} onClose={() => setIsPremadeModalOpen(false)} />
            </Modal>
        </div>
    )
}

const PremadeTemplatesModal: FC<{
    onAdd: (data: { categoryName: string; templateName: string; fields: Array<PremadeField & { customizedOptions?: string[] }> }) => void;
    onClose: () => void;
}> = ({ onAdd, onClose }) => {
    const [selected, setSelected] = useState<{ category: PremadeTemplateCategory; template: PremadeTemplate } | null>(null);
    const [customizedName, setCustomizedName] = useState('');
    const [customizedFields, setCustomizedFields] = useState<Record<string, string>>({});

    const handleSelect = (category: PremadeTemplateCategory, template: PremadeTemplate) => {
        setSelected({ category, template });
        setCustomizedName(template.name);
        const initialCustomizations: Record<string, string> = {};
        template.fields.forEach(field => {
            if (['checklist', 'dropdown', 'multi-select'].includes(field.fieldType)) {
                initialCustomizations[field.fieldName] = (field.config?.options || []).join(', ');
            }
        });
        setCustomizedFields(initialCustomizations);
    };

    const handleAdd = () => {
        if (!selected) return;
        const finalFields = selected.template.fields.map(field => {
            if (customizedFields[field.fieldName] !== undefined) {
                return { ...field, customizedOptions: customizedFields[field.fieldName].split(',').map(s => s.trim()).filter(Boolean) };
            }
            return field;
        });
        onAdd({
            categoryName: selected.category.categoryName,
            templateName: customizedName,
            fields: finalFields
        });
        onClose();
    };

    return (
        <div style={{maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
            {selected ? (
                <>
                    <div style={{ flexShrink: 0, paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                        <button className="secondary" onClick={() => setSelected(null)}>&larr; Back to Library</button>
                        <h2 style={{marginTop: '1.5rem'}}>Customize & Add Template</h2>
                    </div>
                    <div style={{ overflowY: 'auto', padding: '1.5rem 0.5rem 0 0' }}>
                        <div className="form-group">
                            <label>Template Name</label>
                            <input type="text" value={customizedName} onChange={e => setCustomizedName(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>New Category for Fields</label>
                            <input type="text" readOnly value={selected.category.categoryName} style={{backgroundColor: 'var(--bg-tertiary)'}}/>
                        </div>
                        <h3>Fields to be Created</h3>
                        {selected.template.fields.map(field => (
                            <div key={field.fieldName} style={{borderBottom: '1px solid var(--border-color)', padding: '1rem 0'}}>
                                <p style={{margin: 0}}><strong>{field.label}</strong> <span style={{color: 'var(--text-secondary)'}}>({formatFieldTypeName(field.fieldType)})</span></p>
                                {['checklist', 'dropdown', 'multi-select'].includes(field.fieldType) && (
                                     <div className="form-group" style={{marginTop: '1rem', marginBottom: 0}}>
                                        <label>Options (comma-separated)</label>
                                        <textarea 
                                            value={customizedFields[field.fieldName]}
                                            onChange={e => setCustomizedFields(prev => ({...prev, [field.fieldName]: e.target.value}))}
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexShrink: 0}}>
                        <button className="secondary" onClick={onClose}>Cancel</button>
                        <button onClick={handleAdd}>Add to My Templates</button>
                    </div>
                </>
            ) : (
                <>
                    <h2 style={{ flexShrink: 0 }}>Premade Template Library</h2>
                    <div style={{ overflowY: 'auto', paddingRight: '1rem' }}>
                        {premadeTemplates.map(category => (
                            <div key={category.categoryName} style={{marginBottom: '2rem'}}>
                                <h3 style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>{category.categoryName}</h3>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
                                {category.templates.map(template => (
                                    <button key={template.name} className="secondary" onClick={() => handleSelect(category, template)} style={{textAlign: 'left', justifyContent: 'flex-start'}}>{template.name}</button>
                                ))}
                                </div>
                            </div>
                        ))}
                    </div>
                     <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexShrink: 0}}>
                        <button className="secondary" onClick={onClose}>Close</button>
                    </div>
                </>
            )}
        </div>
    );
};

const TemplateEditor: FC<{
    template: Template;
    customFieldDefs: CustomFieldDef[];
    customFieldCategories: CustomFieldCategory[];
    onSave: (template: Template) => void;
    onCancel: () => void;
}> = ({template, customFieldDefs, customFieldCategories, onSave, onCancel}) => {
    const [localTemplate, setLocalTemplate] = useState<Template>(template);
    const dragItemIndex = useRef<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent, index: number) => {
        dragItemIndex.current = index;
        const targetNode = (e.currentTarget as HTMLElement).closest('.block-editor-item');
        if (targetNode) {
            targetNode.classList.add('dragging');
        }
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (dragItemIndex.current === null || !listRef.current) return;
        const children = Array.from(listRef.current.children);
        const newOverIndex = children.findIndex(child => {
            const rect = (child as HTMLElement).getBoundingClientRect();
            return e.clientY >= rect.top && e.clientY <= rect.bottom;
        });

        if (newOverIndex !== -1 && newOverIndex !== dragOverIndex.current) {
            if (dragOverIndex.current !== null) {
                (children[dragOverIndex.current] as HTMLElement)?.classList.remove('drag-over-active');
            }
            dragOverIndex.current = newOverIndex;
            if (dragOverIndex.current !== dragItemIndex.current) {
                (children[dragOverIndex.current] as HTMLElement)?.classList.add('drag-over-active');
            }
        }
    };
    
    const handlePointerUp = () => {
        if (dragItemIndex.current !== null && dragOverIndex.current !== null && dragItemIndex.current !== dragOverIndex.current) {
            const newBlocks = [...localTemplate.blocks];
            const [reorderedItem] = newBlocks.splice(dragItemIndex.current, 1);
            newBlocks.splice(dragOverIndex.current, 0, reorderedItem);
            setLocalTemplate(prev => ({ ...prev, blocks: newBlocks }));
        }

        document.querySelectorAll('.block-editor-item').forEach(el => {
            el.classList.remove('dragging', 'drag-over-active');
        });

        dragItemIndex.current = null;
        dragOverIndex.current = null;
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    };

    const groupedFieldsForSelect = useMemo(() => {
        const groups: Record<string, { name: string; fields: CustomFieldDef[] }> = {};
        
        customFieldCategories.forEach(cat => {
            groups[cat.id] = { name: cat.name, fields: [] };
        });

        const uncategorized: CustomFieldDef[] = [];
        
        customFieldDefs.forEach(field => {
            if (field.categoryId && groups[field.categoryId]) {
                groups[field.categoryId].fields.push(field);
            } else {
                uncategorized.push(field);
            }
        });
        
        if (uncategorized.length > 0) {
            groups.uncategorized = { name: 'Uncategorized', fields: uncategorized };
        }

        return Object.entries(groups).filter(([id, group]) => group.fields.length > 0);
    }, [customFieldDefs, customFieldCategories]);

    const handleAddBlock = (type: 'rich-text' | 'custom-field') => {
        let newBlock: BlockDef;
        if(type === 'rich-text') {
            newBlock = {id: generateId(), type: 'rich-text', label: 'New Rich Text', color: '#a0a0a0'};
        } else {
            if(customFieldDefs.length === 0) {
                alert("Please create a custom field first.");
                return;
            }
            const cf = customFieldDefs[0];
            newBlock = {id: generateId(), type: 'custom-field', customFieldId: cf.id, label: cf.name, color: '#a0a0a0' };
        }
        setLocalTemplate(prev => ({...prev, blocks: [...prev.blocks, newBlock]}));
    }
    
    const handleDeleteBlock = (blockId: string) => {
        setLocalTemplate(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== blockId)
        }));
    };

    const updateBlock = (blockId: string, updates: Partial<BlockDef>) => {
        setLocalTemplate(prev => ({
            ...prev,
            blocks: prev.blocks.map(b => {
                if(b.id === blockId) {
                    const updatedBlock = {...b, ...updates};
                    if (updates.customFieldId) { // auto-update label if custom field changes
                        const cf = customFieldDefs.find(c => c.id === updates.customFieldId);
                        if(cf) updatedBlock.label = cf.name;
                    }
                    return updatedBlock;
                }
                return b;
            })
        }));
    };

    return (
        <div>
            <h1>Editing Template</h1>
            <div className="form-group">
                <label>Template Name</label>
                <input value={localTemplate.name} onChange={e => setLocalTemplate({...localTemplate, name: e.target.value})} />
            </div>
            <h3>Blocks</h3>
            <div ref={listRef} style={{marginTop: '1rem', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px'}}>
                {localTemplate.blocks.map((block, index) => (
                    <div 
                        key={block.id} 
                        className="block-editor-item draggable-item"
                    >
                        <div className="drag-handle" onPointerDown={(e) => handlePointerDown(e, index)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
                        </div>
                        <div style={{flexGrow: 1, display: 'flex', gap: '1rem', alignItems: 'flex-end'}}>
                            <div style={{flexGrow: 1}}>
                                <label>Label</label>
                                <input value={block.label} onChange={e => updateBlock(block.id, {label: e.target.value})} />
                            </div>
                            <div style={{flexGrow: 1}}>
                                <label>Type</label>
                                {block.type === 'rich-text' ? <div style={{height: '42px', display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 10px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)'}}>Rich Text</div> : (
                                    <select value={block.customFieldId} onChange={e => updateBlock(block.id, {customFieldId: e.target.value})}>
                                        {groupedFieldsForSelect.map(([id, group]) => (
                                            <optgroup label={group.name} key={id}>
                                                {group.fields.map(cf => <option key={cf.id} value={cf.id}>{cf.name}</option>)}
                                            </optgroup>
                                        ))}
                                    </select>
                                )}
                            </div>
                             <div>
                                <label>Color</label>
                                <input 
                                    type="color" 
                                    value={block.color || '#e2e2e2'}
                                    onChange={e => updateBlock(block.id, { color: e.target.value })}
                                    style={{ padding: '2px', height: '42px', cursor: 'pointer', width: '42px' }}
                                />
                            </div>
                            <button className="danger" onClick={() => handleDeleteBlock(block.id)}>X</button>
                        </div>
                    </div>
                ))}
                 <div style={{display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={() => handleAddBlock('rich-text')} className="secondary">+ Add Rich Text</button>
                    <button onClick={() => handleAddBlock('custom-field')} className="secondary" disabled={customFieldDefs.length === 0}>+ Add Custom Field</button>
                </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                <button onClick={onCancel} className="secondary">Cancel</button>
                <button onClick={() => onSave(localTemplate)}>Save Template</button>
            </div>
        </div>
    )
}

const SettingsView: FC<{
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    userUUID: string | null;
    setUserUUID: React.Dispatch<React.SetStateAction<string | null>>;
    username: string | null;
    setUsername: React.Dispatch<React.SetStateAction<string | null>>;
    secretPhrase: string | null;
    setSecretPhrase: React.Dispatch<React.SetStateAction<string | null>>;
    topLevelState: TopLevelState;
}> = ({ settings, setSettings, userUUID, setUserUUID, username, setUsername, secretPhrase, setSecretPhrase, topLevelState }) => {
    const [importUsername, setImportUsername] = useState('');
    const [importSecretPhrase, setImportSecretPhrase] = useState('');
    const [showImportField, setShowImportField] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showSecretPhrase, setShowSecretPhrase] = useState(false);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [showDeleteSecretField, setShowDeleteSecretField] = useState(false);
    const [deleteSecretPhrase, setDeleteSecretPhrase] = useState('');
    const [showFinalConfirm, setShowFinalConfirm] = useState(false);
    
    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings(prev => ({...prev, [key]: value}));
    }

    const handleCopyCredentials = async () => {
        if (username && secretPhrase) {
            const credentials = `Username: ${username}\nSecret Phrase: ${secretPhrase}`;
            try {
                await navigator.clipboard.writeText(credentials);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = credentials;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                } catch (e) {
                    console.error('Failed to copy credentials', e);
                }
                document.body.removeChild(textArea);
            }
        }
    };

    const handleImportCredentials = async () => {
        const trimmedUsername = importUsername.trim();
        const trimmedSecretPhrase = importSecretPhrase.trim();
        
        if (trimmedSecretPhrase.length < 6) {
            alert('Secret phrase must be at least 6 characters long');
            return;
        }
        
        if (trimmedUsername && trimmedSecretPhrase) {
            try {
                // Generate UUID from imported credentials
                let uuid: string;
                try {
                    uuid = await generateUUIDFromCredentials(trimmedUsername, trimmedSecretPhrase);
                } catch (err) {
                    uuid = generateUUIDFromCredentialsSync(trimmedUsername, trimmedSecretPhrase);
                }
                
                // Save credentials and UUID
                setUsername(trimmedUsername);
                setSecretPhrase(trimmedSecretPhrase);
                setUserUUID(uuid);
                
                setImportUsername('');
                setImportSecretPhrase('');
                setShowImportField(false);
                
                // Reload the page to sync with new credentials
                window.location.reload();
            } catch (err) {
                alert('Failed to import credentials. Please try again.');
                console.error('Import error:', err);
            }
        } else {
            alert('Please enter both username and secret phrase');
        }
    };
    
    const handleDeleteAccount = async () => {
        if (!userUUID || !username || !secretPhrase) {
            alert('No account to delete');
            return;
        }
        
        try {
            logDebug('Deleting account from Supabase', { userUUID, username });
            
            // Authenticate first
            const authSuccess = await authenticateSupabase(username, secretPhrase, userUUID);
            if (!authSuccess) {
                alert('Authentication failed. Cannot delete account.');
                return;
            }
            
            // Delete all user_data records for this UUID
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                alert('Authentication failed. Cannot delete account.');
                return;
            }
            
            // Delete all data records for this user
            const { error: deleteError } = await supabase
                .from('user_data')
                .delete()
                .eq('user_uuid', userUUID);
            
            if (deleteError) {
                logDebug('Error deleting user data', deleteError);
                console.error('[Delete Account Error]', deleteError);
                alert('Failed to delete account data. Check console for details.');
                return;
            }
            
            // Delete the auth user (this will also remove from auth.users table)
            // Note: We need to use admin API or a database function for this
            // For now, we'll just delete the data and sign out
            await supabase.auth.signOut();
            
            // Clear local credentials
            setUsername(null);
            setSecretPhrase(null);
            setUserUUID(null);
            
            // Clear all state
            setShowDeleteWarning(false);
            setShowDeleteSecretField(false);
            setShowFinalConfirm(false);
            setDeleteSecretPhrase('');
            
            logDebug('Account deleted successfully');
            alert('Account deleted successfully. Your local data remains intact.');
            
            // Reload to reflect changes
            window.location.reload();
        } catch (error) {
            logDebug('Error deleting account', error);
            console.error('[Delete Account Error]', error);
            alert('Failed to delete account. Check console for details.');
        }
    };

    return (
        <div>
            <h1>Account/Settings</h1>
            
            {/* Account Sync Section */}
            <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)'
            }}>
                <h2 style={{marginTop: 0, marginBottom: '1rem'}}>Account Sync</h2>
                {username && secretPhrase ? (
                    <>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '1.5rem',
                            fontSize: '0.95rem',
                            lineHeight: '1.6'
                        }}>
                            Your account is set up for server-side syncing. Use your Username and Secret Phrase to access your data from other devices.
                        </p>
                        
                        {/* Display Username */}
                        <div className="form-group" style={{marginBottom: '1.5rem'}}>
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                readOnly
                                style={{
                                    fontFamily: 'var(--font-family)',
                                    fontSize: '1rem',
                                    backgroundColor: 'var(--bg-primary)',
                                    cursor: 'text'
                                }}
                            />
                        </div>
                        
                        {/* Display Secret Phrase */}
                        <div className="form-group" style={{marginBottom: '1.5rem'}}>
                            <label>Secret Phrase</label>
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }}>
                                <input
                                    type={showSecretPhrase ? 'text' : 'password'}
                                    value={secretPhrase}
                                    readOnly
                                    style={{
                                        fontFamily: 'var(--font-family)',
                                        fontSize: '1rem',
                                        backgroundColor: 'var(--bg-primary)',
                                        cursor: 'text',
                                        flex: 1
                                    }}
                                />
                                <button
                                    onClick={() => setShowSecretPhrase(!showSecretPhrase)}
                                    className="secondary"
                                    style={{
                                        whiteSpace: 'nowrap',
                                        minWidth: 'auto',
                                        padding: '10px 15px'
                                    }}
                                >
                                    {showSecretPhrase ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        
                        {/* Copy Credentials */}
                        <button
                            onClick={handleCopyCredentials}
                            className="secondary"
                            style={{
                                width: '100%',
                                marginBottom: '1rem'
                            }}
                        >
                            {copySuccess ? (
                                <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                                    </svg>
                                    Copied!
                                </span>
                            ) : (
                                <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                                    </svg>
                                    Copy Credentials
                                </span>
                            )}
                        </button>
                        
                        {/* Manual Sync Button */}
                        <button
                            onClick={async () => {
                                if (userUUID && username && secretPhrase) {
                                    logDebug('Manual sync triggered');
                                    try {
                                            // Re-authenticate
                                        const authSuccess = await authenticateSupabase(username, secretPhrase, userUUID);
                                        if (authSuccess) {
                                            // Get last sync times
                                            const profilesLastSyncKey = 'profiles-state-last-sync';
                                            const settingsLastSyncKey = 'settings-last-sync';
                                            const profilesLastSync = (await db.appData.get(profilesLastSyncKey))?.value || null;
                                            const settingsLastSync = (await db.appData.get(settingsLastSyncKey))?.value || null;
                                            
                                            // Sync profiles and settings
                                            const sync1 = await syncToSupabase(userUUID, 'profiles', topLevelState, profilesLastSync);
                                            console.log('[Manual Sync] Profiles sync result:', sync1);
                                            
                                            const sync2 = await syncToSupabase(userUUID, 'settings', settings, settingsLastSync);
                                            console.log('[Manual Sync] Settings sync result:', sync2);
                                            
                                            // Update last sync times
                                            if (sync1) {
                                                await db.appData.put({ key: profilesLastSyncKey, value: new Date().toISOString() });
                                            }
                                            if (sync2) {
                                                await db.appData.put({ key: settingsLastSyncKey, value: new Date().toISOString() });
                                            }
                                            
                                            if (sync1 && sync2) {
                                                alert('✓ Sync successful! Data has been saved. Other devices will update automatically within 30 seconds.');
                                            } else {
                                                alert('⚠ Sync completed with errors. Check console for details.');
                                            }
                                        } else {
                                            alert('Authentication failed. Check console for details.');
                                        }
                                    } catch (err) {
                                        console.error('[Manual Sync Error]', err);
                                        alert('Sync failed. Check console for details.');
                                    }
                                }
                            }}
                            style={{
                                width: '100%',
                                marginBottom: '1rem'
                            }}
                        >
                            <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                                </svg>
                                Manual Sync Now
                            </span>
                        </button>
                        
                        {/* Delete Account Button */}
                        <button
                            onClick={() => {
                                setShowDeleteWarning(true);
                                setShowDeleteSecretField(false);
                                setDeleteSecretPhrase('');
                            }}
                            className="danger"
                            style={{
                                width: '100%',
                                marginTop: '1rem'
                            }}
                        >
                            Delete Account
                        </button>
                        
                        {/* Delete Warning Message */}
                        {showDeleteWarning && !showDeleteSecretField && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--danger)',
                                borderRadius: '6px'
                            }}>
                                <p style={{
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.5rem',
                                    fontWeight: 500
                                }}>
                                    ⚠️ Warning: Delete Account
                                </p>
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    marginBottom: '1rem'
                                }}>
                                    You are about to remove your account data from the cloud. All your synced data will be permanently deleted from Supabase. Your local data will remain untouched.
                                </p>
                                <p style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    marginBottom: '1rem',
                                    fontWeight: 500
                                }}>
                                    To confirm deletion, please enter your secret phrase below.
                                </p>
                                <div style={{display: 'flex', gap: '0.5rem'}}>
                                    <button
                                        onClick={() => {
                                            setShowDeleteSecretField(true);
                                        }}
                                        className="danger"
                                        style={{flex: 1}}
                                    >
                                        Continue
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDeleteWarning(false);
                                            setShowDeleteSecretField(false);
                                            setDeleteSecretPhrase('');
                                        }}
                                        className="secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Delete Secret Phrase Field */}
                        {showDeleteSecretField && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                backgroundColor: 'var(--bg-primary)',
                                border: '1px solid var(--danger)',
                                borderRadius: '6px'
                            }}>
                                <div className="form-group" style={{marginBottom: '1rem'}}>
                                    <label style={{color: 'var(--text-primary)'}}>Enter Secret Phrase to Delete Account</label>
                                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                        <input
                                            type="password"
                                            value={deleteSecretPhrase}
                                            onChange={(e) => setDeleteSecretPhrase(e.target.value)}
                                            placeholder="Enter your secret phrase"
                                            style={{
                                                fontFamily: 'var(--font-family)',
                                                fontSize: '1rem',
                                                flex: 1
                                            }}
                                        />
                                        <button
                                            onClick={async () => {
                                                if (!deleteSecretPhrase.trim()) {
                                                    alert('Please enter your secret phrase');
                                                    return;
                                                }
                                                if (deleteSecretPhrase !== secretPhrase) {
                                                    alert('Secret phrase does not match. Please try again.');
                                                    setDeleteSecretPhrase('');
                                                    return;
                                                }
                                                setShowFinalConfirm(true);
                                            }}
                                            className="danger"
                                            style={{
                                                padding: '10px 20px',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                boxShadow: '0 0 10px rgba(220, 53, 69, 0.5)',
                                                animation: 'pulse 2s infinite'
                                            }}
                                        >
                                            DELETE
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDeleteWarning(false);
                                        setShowDeleteSecretField(false);
                                        setDeleteSecretPhrase('');
                                    }}
                                    className="secondary"
                                    style={{width: '100%'}}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '1.5rem',
                            fontSize: '0.95rem',
                            lineHeight: '1.6'
                        }}>
                            No account sync configured. Import credentials from another device to sync your data, or create new credentials during profile setup.
                        </p>
                    </>
                )}
                
                {/* Final Delete Confirmation Modal */}
                <Modal isOpen={showFinalConfirm} onClose={() => {
                    setShowFinalConfirm(false);
                    setShowDeleteWarning(false);
                    setShowDeleteSecretField(false);
                    setDeleteSecretPhrase('');
                }}>
                    <div>
                        <h2 style={{color: 'var(--danger)', marginTop: 0}}>⚠️ Final Confirmation</h2>
                        <p style={{
                            color: 'var(--text-primary)',
                            marginBottom: '1rem',
                            lineHeight: '1.6',
                            fontSize: '1rem'
                        }}>
                            Are you absolutely sure you want to delete your account? This will permanently remove all your data from Supabase.
                        </p>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '2rem',
                            lineHeight: '1.6',
                            fontSize: '0.9rem'
                        }}>
                            Your local data will remain untouched, but you will lose access to cloud sync and all synced data will be permanently deleted.
                        </p>
                        <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                            <button
                                onClick={() => {
                                    setShowFinalConfirm(false);
                                    setShowDeleteWarning(false);
                                    setShowDeleteSecretField(false);
                                    setDeleteSecretPhrase('');
                                }}
                                className="secondary"
                                style={{padding: '10px 20px'}}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="danger"
                                style={{
                                    padding: '10px 20px',
                                    fontWeight: 600,
                                    boxShadow: '0 0 15px rgba(220, 53, 69, 0.6)'
                                }}
                            >
                                YES, DELETE ACCOUNT
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Import Credentials */}
                {!showImportField ? (
                    <button
                        onClick={() => setShowImportField(true)}
                        className="secondary"
                        style={{width: '100%'}}
                    >
                        {username && secretPhrase 
                            ? 'Switch Account/Import Credentials from Another Device'
                            : 'Create Account/Import Credentials from Another Device'
                        }
                    </button>
                ) : (
                    <div>
                        <div className="form-group" style={{marginBottom: '1rem'}}>
                            <label>Username</label>
                            <input
                                type="text"
                                value={importUsername}
                                onChange={(e) => setImportUsername(e.target.value)}
                                placeholder="Enter username"
                                style={{
                                    fontFamily: 'var(--font-family)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div className="form-group" style={{marginBottom: '1rem'}}>
                            <label>Secret Phrase (minimum 6 characters)</label>
                            <input
                                type="password"
                                value={importSecretPhrase}
                                onChange={(e) => setImportSecretPhrase(e.target.value)}
                                placeholder="Enter secret phrase (min 6 characters)"
                                style={{
                                    fontFamily: 'var(--font-family)',
                                    fontSize: '1rem'
                                }}
                            />
                            {importSecretPhrase.length > 0 && importSecretPhrase.length < 6 && (
                                <p style={{
                                    color: 'var(--danger)',
                                    fontSize: '0.85rem',
                                    marginTop: '0.25rem',
                                    marginBottom: 0
                                }}>
                                    Secret phrase must be at least 6 characters
                                </p>
                            )}
                        </div>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                            <button
                                onClick={handleImportCredentials}
                                disabled={!importUsername.trim() || !importSecretPhrase.trim() || importSecretPhrase.length < 6}
                                style={{flex: 1}}
                            >
                                Import & Sync
                            </button>
                            <button
                                onClick={() => {
                                    setShowImportField(false);
                                    setImportUsername('');
                                    setImportSecretPhrase('');
                                }}
                                className="secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <h2 style={{marginTop: '3rem'}}>Appearance & Theme</h2>
            <div className="form-group">
                <label>Mode</label>
                <select value={settings.theme} onChange={e => updateSetting('theme', e.target.value as Settings['theme'])}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (Sync with System)</option>
                </select>
            </div>
            <div className="form-group">
                <label>Accent Color</label>
                <input type="color" value={settings.accentColor} onChange={e => updateSetting('accentColor', e.target.value)} />
            </div>

            <h2 style={{marginTop: '3rem'}}>Typography</h2>
            <div className="form-group">
                <label>Font Selection</label>
                <select value={settings.fontFamily} onChange={e => updateSetting('fontFamily', e.target.value as Settings['fontFamily'])}>
                    <option value="Inter">Inter (Sans-serif)</option>
                    <option value="Lora">Lora (Serif)</option>
                    <option value="Roboto Slab">Roboto Slab (Slab Serif)</option>
                </select>
            </div>
             <div className="form-group">
                <label>Font Size ({settings.fontSize}px)</label>
                <input type="range" min="12" max="20" step="1" value={settings.fontSize} onChange={e => updateSetting('fontSize', Number(e.target.value))} />
            </div>
             <div className="form-group">
                <label>Line Spacing</label>
                 <select value={settings.lineSpacing} onChange={e => updateSetting('lineSpacing', Number(e.currentTarget.value))}>
                    <option value="1.4">Small</option>
                    <option value="1.6">Medium</option>
                    <option value="1.8">Large</option>
                </select>
            </div>
             <div className="form-group">
                <label>Text Width</label>
                 <select value={settings.textWidth} onChange={e => updateSetting('textWidth', e.target.value as Settings['textWidth'])}>
                    <option value="comfortable">Comfortable</option>
                    <option value="wide">Wide</option>
                </select>
            </div>

            <h2 style={{marginTop: '3rem'}}>Layout</h2>
             <div className="form-group">
                <label>Journal View Density</label>
                 <select value={settings.viewDensity} onChange={e => updateSetting('viewDensity', e.target.value as Settings['viewDensity'])}>
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                </select>
            </div>
        </div>
    )
}


const App: FC = () => {
  const [userUUID, setUserUUID, isLoadingUUID] = useIndexedDB<string | null>('user-uuid', null);
  const [username, setUsername, isLoadingUsername] = useIndexedDB<string | null>('username', null);
  const [secretPhrase, setSecretPhrase, isLoadingSecretPhrase] = useIndexedDB<string | null>('secret-phrase', null);
  
  // Generate UUID from username/secret phrase if they exist, otherwise generate random UUID
  useEffect(() => {
    if (!isLoadingUUID && !isLoadingUsername && !isLoadingSecretPhrase) {
      if (username && secretPhrase) {
        // Always regenerate UUID from credentials when they exist
        (async () => {
          try {
            const uuid = await generateUUIDFromCredentials(username, secretPhrase);
            // Always update if different, or if current UUID looks like a random one (starts with 00000000-4000-8000)
            if (userUUID !== uuid || !userUUID || (userUUID && userUUID.startsWith('00000000-4000-8000'))) {
              logDebug('Regenerating UUID from credentials', { oldUUID: userUUID, newUUID: uuid, username });
              setUserUUID(uuid);
            }
          } catch (err) {
            // Fallback to sync version if crypto.subtle not available
            const uuid = generateUUIDFromCredentialsSync(username, secretPhrase);
            if (userUUID !== uuid || !userUUID || (userUUID && userUUID.startsWith('00000000-4000-8000'))) {
              logDebug('Regenerating UUID from credentials (sync fallback)', { oldUUID: userUUID, newUUID: uuid, username });
              setUserUUID(uuid);
            }
          }
        })();
      } else if (!username && !secretPhrase && !userUUID) {
        // No credentials and no UUID - generate random one (for backwards compatibility)
        const newUUID = generateUUID();
        setUserUUID(newUUID);
      }
    }
  }, [isLoadingUUID, isLoadingUsername, isLoadingSecretPhrase, userUUID, username, secretPhrase]);

  // Use sync-enabled hooks for profiles and settings
  const [topLevelState, setTopLevelState, isLoadingProfiles] = useIndexedDBWithSync<TopLevelState>(
    'profiles-state', 
    { profiles: [], activeProfileId: null },
    userUUID,
    username,
    secretPhrase,
    'profiles'
  );
  const [settings, setSettings, isLoadingSettings] = useIndexedDBWithSync<Settings>(
    'settings',
    {
    theme: 'dark',
    accentColor: '#4a90e2',
    fontFamily: 'Inter',
    fontSize: 16,
    lineSpacing: 1.6,
    textWidth: 'comfortable',
    viewDensity: 'comfortable'
    },
    userUUID,
    username,
    secretPhrase,
    'settings'
  );

  // Test Supabase connection on mount
  useEffect(() => {
    if (!isLoadingUUID && !isLoadingUsername && !isLoadingSecretPhrase) {
      testSupabaseConnection();
    }
  }, [isLoadingUUID, isLoadingUsername, isLoadingSecretPhrase]);

  const [activeView, setActiveView] = useState<View>('journal');
  const [activeJournalId, setActiveJournalId] = useState<string | undefined>();
  const [journalToDelete, setJournalToDelete] = useState<Journal | null>(null);
  const [isAddJournalModalOpen, setIsAddJournalModalOpen] = useState(false);
  const [newJournalName, setNewJournalName] = useState('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const isMobile = window.innerWidth <= 768;

  const activeProfile = useMemo(() => {
    return topLevelState.profiles.find(p => p.id === topLevelState.activeProfileId) || null;
  }, [topLevelState]);
  
  const setAppState = (updater: React.SetStateAction<AppState>) => {
      setTopLevelState(prev => {
          if (!prev.activeProfileId) return prev;
          return {
              ...prev,
              profiles: prev.profiles.map(p => 
                  p.id === prev.activeProfileId
                  ? {...p, data: typeof updater === 'function' ? updater(p.data) : updater}
                  : p
              )
          };
      });
  };

  const appState = useMemo(() => {
      return activeProfile?.data || initialAppState;
  }, [activeProfile]);

  // Effect to set initial journal view
  useEffect(() => {
    // Don't auto-navigate if we're on screens that don't require journals
    const viewsThatDontNeedJournals = ['profile-manager', 'templates', 'custom-fields', 'settings'];
    if (viewsThatDontNeedJournals.includes(activeView)) return;
    
    if (!isLoadingProfiles && appState.journals.length > 0 && !activeJournalId) {
      setActiveJournalId(appState.journals[0].id);
      setActiveView('journal');
    }
    if (!isLoadingProfiles && appState.journals.length === 0 && !viewsThatDontNeedJournals.includes(activeView)) {
      setActiveView('dashboard');
    }
  }, [isLoadingProfiles, appState.journals, activeJournalId, activeView]);
  
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth > 768) {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = (view: View, journalId?: string) => {
    setActiveView(view);
    if (journalId) {
        setActiveJournalId(journalId);
    }
    if(isMobile) setIsSidebarOpen(false);
  };
  
  const handleAddJournal = () => {
      if (!newJournalName.trim()) return;
      const newJournal: Journal = { id: generateId(), name: newJournalName.trim() };
      setAppState(prev => ({...prev, journals: [...prev.journals, newJournal]}));
      setActiveJournalId(newJournal.id);
      setActiveView('journal');
      setIsAddJournalModalOpen(false);
      setNewJournalName('');
  }
  
  const handleUpdateJournal = (journalId: string, updates: Partial<Journal>) => {
      setAppState(prev => ({
          ...prev,
          journals: prev.journals.map(j => j.id === journalId ? {...j, ...updates} : j)
      }));
  }
  
  const handleDeleteJournal = (journalId: string) => {
      const journal = appState.journals.find(j => j.id === journalId);
      if(journal) setJournalToDelete(journal);
  }
  
  const confirmDeleteJournal = () => {
      if(!journalToDelete) return;
      setAppState(prev => ({
          ...prev,
          journals: prev.journals.filter(j => j.id !== journalToDelete.id),
          entries: prev.entries.filter(e => e.journalId !== journalToDelete.id)
      }));
      setJournalToDelete(null);
      
      const remainingJournals = appState.journals.filter(j => j.id !== journalToDelete.id);
      if (remainingJournals.length > 0) {
          setActiveJournalId(remainingJournals[0].id);
          setActiveView('journal');
      } else {
          setActiveView('dashboard');
          setActiveJournalId(undefined);
      }
  }

  const handleAddEntry = (entry: Omit<Entry, 'id'>) => {
    setAppState(prev => ({ ...prev, entries: [...prev.entries, { ...entry, id: generateId() }] }));
  };

  const handleUpdateEntry = (updatedEntry: Entry) => {
    setAppState(prev => ({
      ...prev,
      entries: prev.entries.map(e => (e.id === updatedEntry.id ? updatedEntry : e)),
    }));
  };

  const handleDeleteEntry = (entryId: string) => {
    setAppState(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== entryId) }));
  };
  
  const handleAddPremadeTemplate = (data: { categoryName: string, templateName: string, fields: Array<PremadeField & { customizedOptions?: string[] }> }) => {
    setAppState(prev => {
        let nextState = {...prev};
        
        let category = nextState.customFieldCategories.find(c => c.name === data.categoryName);
        if (!category) {
            category = { id: generateId(), name: data.categoryName };
            nextState.customFieldCategories = [...nextState.customFieldCategories, category];
        }

        const newBlocks: BlockDef[] = [];
        const newFieldDefs: CustomFieldDef[] = [];

        data.fields.forEach(fieldInfo => {
            const fieldDef: CustomFieldDef = {
                id: generateId(),
                name: fieldInfo.label,
                type: fieldInfo.fieldType,
                categoryId: category.id,
                ...fieldInfo.config,
                options: fieldInfo.customizedOptions || fieldInfo.config?.options || []
            };
            newFieldDefs.push(fieldDef);
            newBlocks.push({
                id: generateId(),
                type: 'custom-field',
                customFieldId: fieldDef.id,
                label: fieldDef.name,
                color: '#a0a0a0'
            });
        });
        
        const newTemplate: Template = {
            id: generateId(),
            name: data.templateName,
            blocks: newBlocks
        };
        
        nextState.customFieldDefs = [...nextState.customFieldDefs, ...newFieldDefs];
        nextState.templates = [...nextState.templates, newTemplate];
        
        return nextState;
    });
  };

  // Profile Management Handlers
    const handleAddProfile = (name: string, stayOnProfileManager: boolean = false) => {
        const newProfile: Profile = {
            id: generateId(),
            name,
            data: initialAppState
        };
        setTopLevelState(prev => ({
            ...prev,
            profiles: [...prev.profiles, newProfile],
            activeProfileId: newProfile.id
        }));
        setActiveJournalId(undefined);
        // Only navigate if not staying on profile manager
        if (!stayOnProfileManager && activeView !== 'profile-manager') {
            setActiveView('dashboard');
        }
    };

    const handleUpdateProfile = (id: string, name: string) => {
        setTopLevelState(prev => ({
            ...prev,
            profiles: prev.profiles.map(p => p.id === id ? { ...p, name } : p)
        }));
    };

    const handleDeleteProfile = (id: string) => {
        setTopLevelState(prev => {
            const newProfiles = prev.profiles.filter(p => p.id !== id);
            let newActiveId = prev.activeProfileId;
            if (prev.activeProfileId === id) {
                newActiveId = newProfiles[0]?.id || null;
            }
            return { profiles: newProfiles, activeProfileId: newActiveId };
        });
    };

    const handleSwitchProfile = (id: string, stayOnProfileManager: boolean = false) => {
        if(id === topLevelState.activeProfileId) return;
        setTopLevelState(prev => ({ ...prev, activeProfileId: id }));
        setActiveJournalId(undefined);
        // Only navigate if not staying on profile manager AND not already on profile manager
        if (!stayOnProfileManager && activeView !== 'profile-manager') {
            const switchedProfile = topLevelState.profiles.find(p => p.id === id);
            if (switchedProfile?.data.journals.length > 0) {
                setActiveView('journal');
                setActiveJournalId(switchedProfile.data.journals[0].id);
            } else {
                setActiveView('dashboard');
            }
        }
    };
    
    const handleReorderJournals = (reorderedJournals: Journal[]) => {
        setAppState(prev => ({...prev, journals: reorderedJournals}));
    };
    
    const handleReorderProfiles = (reorderedProfiles: Profile[]) => {
        setTopLevelState(prev => ({...prev, profiles: reorderedProfiles}));
    }


  if (isLoadingProfiles || isLoadingSettings || isLoadingUUID || isLoadingUsername || isLoadingSecretPhrase) {
    return <LoadingScreen />;
  }
  
  // Show onboarding screen if no profiles exist
  if (topLevelState.profiles.length === 0) {
      return (
          <>
              <StyleInjector settings={settings} />
              <OnboardingView 
                onCreateProfile={handleAddProfile}
                setUsername={setUsername}
                setSecretPhrase={setSecretPhrase}
                setUserUUID={setUserUUID}
                topLevelState={topLevelState}
                setTopLevelState={setTopLevelState}
              />
          </>
      );
  }

  const currentJournal = appState.journals.find(j => j.id === activeJournalId);
  const journalEntries = appState.entries.filter(e => e.journalId === activeJournalId);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <GettingStartedView onNavigate={handleNavigate} onTriggerAddJournal={() => setIsAddJournalModalOpen(true)} />;
      case 'journal':
        if (currentJournal) {
          return <JournalView 
            journal={currentJournal}
            entries={journalEntries}
            templates={appState.templates}
            customFieldDefs={appState.customFieldDefs}
            settings={settings}
            onAddEntry={handleAddEntry}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
            onUpdateJournal={handleUpdateJournal}
            onDeleteJournal={handleDeleteJournal}
          />;
        }
        return <p>Select a journal</p>;
      case 'templates':
        return <TemplateManager appState={appState} setAppState={setAppState} onAddPremadeTemplate={handleAddPremadeTemplate} />;
      case 'custom-fields':
        return <CustomFieldManager appState={appState} setAppState={setAppState} />;
      case 'settings':
        return <SettingsView 
          settings={settings} 
          setSettings={setSettings} 
          userUUID={userUUID} 
          setUserUUID={setUserUUID}
          username={username}
          setUsername={setUsername}
          secretPhrase={secretPhrase}
          setSecretPhrase={setSecretPhrase}
          topLevelState={topLevelState}
        />;
      case 'profile-manager':
        return <ProfileManagerView 
                    profiles={topLevelState.profiles}
                    activeProfileId={topLevelState.activeProfileId}
                    onAddProfile={handleAddProfile}
                    onUpdateProfile={handleUpdateProfile}
                    onDeleteProfile={handleDeleteProfile}
                    onSwitchProfile={handleSwitchProfile}
                    onReorderProfiles={handleReorderProfiles}
                />;
      default:
        return <h1>NoteLoom</h1>;
    }
  };

  return (
    <>
      <StyleInjector settings={settings} />
      <div className="app-container">
        <Sidebar 
            journals={appState.journals} 
            activeView={activeView} 
            activeJournalId={activeJournalId}
            onNavigate={handleNavigate}
            onTriggerAddJournal={() => setIsAddJournalModalOpen(true)}
            onReorderJournals={handleReorderJournals}
            isOpen={isSidebarOpen}
            profiles={topLevelState.profiles}
            activeProfile={activeProfile}
            onSwitchProfile={handleSwitchProfile}
        />
         {isMobile && <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />}
        <main className="main-content">
            <button className="hamburger-menu" onClick={() => setIsSidebarOpen(o => !o)} aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
            </button>
          {renderContent()}
        </main>
      </div>
      <Modal isOpen={isAddJournalModalOpen} onClose={() => setIsAddJournalModalOpen(false)}>
        <h2>New Journal</h2>
        <div className="form-group" style={{marginTop: '2rem'}}>
            <label>Journal Name</label>
            <input type="text" value={newJournalName} onChange={e => setNewJournalName(e.target.value)} placeholder="e.g., Daily Gratitude" />
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
            <button className="secondary" onClick={() => setIsAddJournalModalOpen(false)}>Cancel</button>
            <button onClick={handleAddJournal}>Create</button>
        </div>
      </Modal>
      <Modal isOpen={!!journalToDelete} onClose={() => setJournalToDelete(null)}>
        <h2>Confirm Deletion</h2>
        <p style={{margin: '1rem 0'}}>Are you sure you want to delete the journal "{journalToDelete?.name}" and all of its entries? This cannot be undone.</p>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
            <button className="secondary" onClick={() => setJournalToDelete(null)}>Cancel</button>
            <button className="danger" onClick={confirmDeleteJournal}>Delete Forever</button>
        </div>
      </Modal>
    </>
  );
};

// Initialize React root only once
// Use a global variable to track if root has been created
declare global {
  interface Window {
    __noteLoomReactRoot?: ReturnType<typeof ReactDOM.createRoot>;
  }
}

const rootElement = document.getElementById('root') as HTMLElement;

if (!window.__noteLoomReactRoot) {
  window.__noteLoomReactRoot = ReactDOM.createRoot(rootElement);
}

window.__noteLoomReactRoot.render(<App />);