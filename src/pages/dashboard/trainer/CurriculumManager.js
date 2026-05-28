import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

// Icon package preservation
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizIcon from '@mui/icons-material/Quiz';
import CodeIcon from '@mui/icons-material/Code';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { 
  getLearningPathNames, getAllQuizzes, getAllExercises, 
  deleteQuiz, getTopicsForLearningPath, addQuizCsv, addQuiz, updateQuiz,
  addExercise, updateExercise, deleteExercise, getFullCurriculum
} from '../../../utils/trainerService';
import QuizFlowModal from './QuizFlowModal';

const CurriculumManager = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pathNames, setPathNames] = useState([]);
  const [loadingPaths, setLoadingPaths] = useState(true);
  const [errorPaths, setErrorPaths] = useState(null);
  const [fullCurriculum, setFullCurriculum] = useState(null);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const data = await getLearningPathNames();
        setPathNames(data);
        
        const fullData = await getFullCurriculum();
        setFullCurriculum(fullData);
        setLoadingPaths(false);
      } catch (err) {
        setErrorPaths("Failed to load learning paths.");
        setLoadingPaths(false);
      }
    };
    fetchPaths();
  }, []);

  const tabs = [
    { id: 0, label: 'Syllabus', icon: <MenuBookIcon className="w-5 h-5" /> },
    { id: 1, label: 'Quizzes (MCQs)', icon: <QuizIcon className="w-5 h-5" /> },
    { id: 2, label: 'Challenges', icon: <CodeIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto min-h-screen bg-slate-50 text-slate-800 antialiased">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          Curriculum Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure systems, active challenges, and custom assessments.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
        {/* Navigation Tabs - Swappable layout with hidden scrollbar for smooth mobile scrolling */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 pt-2 flex items-center overflow-x-auto overflow-y-hidden scrollbar-none gap-1 unique-tab-scroller">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabValue(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold rounded-t-xl transition-all duration-200 -mb-[1px] border-b-2 whitespace-nowrap shrink-0 ${
                tabValue === tab.id
                  ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Component Display Wrapper */}
        <div className="p-4 sm:p-6 md:p-8">
          {tabValue === 0 && (
            <SyllabusTab 
              pathNames={pathNames} 
              fullCurriculum={fullCurriculum} 
              loading={loadingPaths} 
              error={errorPaths} 
            />
          )}
          {tabValue === 1 && <QuizTab pathNames={pathNames} />}
          {tabValue === 2 && <ChallengeTab pathNames={pathNames} />}
        </div>
      </div>
    </div>
  );
};

// --- Syllabus Module ---
const SyllabusTab = ({ pathNames, fullCurriculum, loading, error }) => {
  const [selectedPath, setSelectedPath] = useState(null);

  useEffect(() => {
    if (pathNames.length > 0 && !selectedPath) {
      setSelectedPath(pathNames[0]);
    }
  }, [pathNames, selectedPath]);

  if (loading) return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm">
      {error}
    </div>
  );

  const handleEditPath = () => {
    if (!selectedPath) return;
    const url = `/trainer/curriculum/editor?path=${encodeURIComponent(selectedPath)}`;
    window.open(url, '_blank');
  };

  const handleAddPath = () => {
    const url = `/trainer/curriculum/editor`;
    window.open(url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Sidebar Selector - Flexbox list on mobile, strict vertical list on Large screens */}
      <div className="lg:col-span-4 xl:col-span-3 space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Syllabus Structure</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Manage topic descriptions and learning paths.</p>
        </div>
        
        {/* Responsive layout: Swipes horizontally on mobile viewports */}
        <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 max-h-none lg:max-h-[380px] scrollbar-none">
          {pathNames.map((text, i) => (
            <button
              key={i}
              onClick={() => setSelectedPath(text)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs sm:text-sm font-medium rounded-xl text-left transition-all shrink-0 lg:shrink whitespace-nowrap lg:whitespace-normal lg:w-full ${
                selectedPath === text
                  ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 lg:border-transparent'
                  : 'text-slate-600 bg-slate-50 lg:bg-transparent border border-slate-100 lg:border-transparent hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MenuBookIcon className={`w-4 h-4 shrink-0 ${selectedPath === text ? "text-indigo-600" : "text-slate-400"}`} />
              <span className="truncate max-w-[200px] lg:max-w-none">{text}</span>
            </button>
          ))}
        </div>
        
        <button 
          onClick={handleAddPath}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-dashed border-indigo-300 shadow-sm"
        >
          <AddCircleIcon className="w-4 h-4" /> Add New Path
        </button>
      </div>

      {/* Editor Viewer Panel */}
      <div className="lg:col-span-8 xl:col-span-9">
        {selectedPath ? (
          <div className="border border-slate-200 rounded-xl sm:rounded-2xl p-6 sm:p-10 md:p-14 text-center bg-slate-50 flex flex-col items-center justify-center min-h-[260px]">
            <div className="p-3 sm:p-4 bg-indigo-100 text-indigo-600 rounded-full mb-4">
              <MenuBookIcon style={{ fontSize: 32 }} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 px-2">{selectedPath}</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm sm:max-w-md mx-auto mb-6 px-4">
              Open the Syllabus Editor to manage modules, internal topics, descriptions, custom code playgrounds, and structural ordering parameters.
            </p>
            <button 
              onClick={handleEditPath}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all text-xs sm:text-sm"
            >
              Launch Syllabus Editor
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-slate-300 rounded-xl h-48 flex items-center justify-center text-slate-400 text-xs sm:text-sm bg-slate-50">
            Select a path to view configuration parameters
          </div>
        )}
      </div>
    </div>
  );
};


// --- Quiz Module ---
const QuizTab = ({ pathNames }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPath, setFilterPath] = useState('All');

  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const [selectedPath, setSelectedPath] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [csvTitle, setCsvTitle] = useState('');

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const pathParam = filterPath === 'All' ? null : filterPath;
      const data = await getAllQuizzes(pathParam);
      setQuizzes(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load quizzes.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [filterPath]);

  useEffect(() => {
    if (selectedPath) {
      getTopicsForLearningPath(selectedPath).then(setTopics).catch(console.error);
    } else {
      setTopics([]);
    }
  }, [selectedPath]);

  const handleDelete = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await deleteQuiz(quizId);
        toast.success("Quiz deleted successfully!");
        fetchQuizzes();
      } catch (e) {
        toast.error("Failed to delete quiz.");
      }
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFlowModalOpen(true);
  };

  const handleSaveFlow = async (quizData) => {
    try {
      if (editingQuiz && Object.keys(editingQuiz).length > 0) {
        await updateQuiz(editingQuiz.id, quizData);
        toast.success("Quiz updated successfully!");
      } else {
        await addQuiz(selectedPath, selectedTopic, quizData);
        toast.success("Quiz created successfully!");
      }
      setFlowModalOpen(false);
      fetchQuizzes();
    } catch (e) {
      toast.error("Failed to save quiz.");
    }
  };

  const handleSaveCsv = async () => {
    if (!csvFile || !csvTitle || !selectedPath || !selectedTopic) return;
    try {
      const formData = new FormData();
      formData.append('title', csvTitle);
      formData.append('file', csvFile);

      await addQuizCsv(selectedPath, selectedTopic, formData);
      toast.success("Quiz imported successfully from CSV!");
      setCsvModalOpen(false);
      setCsvFile(null);
      setCsvTitle('');
      fetchQuizzes();
    } catch (e) {
      toast.error("Failed to import CSV.");
    }
  };

  if (loading && quizzes.length === 0) return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header Utilities */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Active Quizzes (MCQs)</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Manage assessment questions across all learning paths.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FilterListIcon className="text-slate-400 w-4 h-4 shrink-0" />
          <select 
            value={filterPath}
            onChange={(e) => setFilterPath(e.target.value)}
            className="w-full sm:w-52 text-xs sm:text-sm bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="All">All Paths</option>
            {pathNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Structured Card Feed */}
      <div className="space-y-3">
        {quizzes.length > 0 ? (
          quizzes.map((quiz, i) => (
            <div 
              key={quiz.id || i}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 bg-slate-50 text-slate-500 rounded-lg shrink-0 border border-slate-100">
                  <QuizIcon className="w-4 h-4 sm:w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{quiz.title}</h4>
                  <div className="text-[11px] sm:text-xs text-slate-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-1 items-center">
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">Path: {quiz.path_heading}</span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">Page: {quiz.page_text}</span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">Questions: {quiz.questions?.length || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons Stack horizontally on mobile */}
              <div className="flex items-center justify-end gap-1.5 pt-3 sm:pt-0 border-t border-slate-100 sm:border-0 shrink-0">
                <button 
                  onClick={() => handleEdit(quiz)}
                  className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(quiz.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  <DeleteIcon className="w-4 h-4 sm:w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl text-slate-400 text-xs sm:text-sm">
            No quizzes found matching the selected parameters.
          </div>
        )}
      </div>

      {/* Primary Actions Stacking Panel */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2.5 pt-2">
        <button 
          onClick={() => { setEditingQuiz(null); setFlowModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-colors"
        >
          <AddCircleIcon className="w-4 h-4" /> Create New Quiz
        </button>
        <button 
          onClick={() => setCsvModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-colors"
        >
          <CloudUploadIcon className="w-4 h-4" /> Import from File
        </button>
      </div>

      {/* CSV Import Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl border border-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Import Quiz from CSV</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Learning Path</label>
                <select 
                  value={selectedPath} 
                  onChange={(e) => setSelectedPath(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="">Select Learning Path</option>
                  {pathNames.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Topic / Page</label>
                <select 
                  value={selectedTopic} 
                  disabled={!selectedPath}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-50 font-medium"
                >
                  <option value="">Select Topic / Page</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Quiz Title</label>
                <input 
                  type="text" 
                  value={csvTitle} 
                  onChange={(e) => setCsvTitle(e.target.value)}
                  placeholder="Enter custom title"
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-slate-600 text-center">
                <CloudUploadIcon className="text-slate-400 mb-1 w-6 h-6" />
                <span className="text-xs font-bold truncate max-w-[260px]">{csvFile ? csvFile.name : "Select CSV File"}</span>
                <input type="file" accept=".csv" className="hidden" onChange={(e) => setCsvFile(e.target.files[0])} />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setCsvModalOpen(false)} className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSaveCsv} 
                disabled={!csvFile || !csvTitle || !selectedPath || !selectedTopic}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-sm transition-colors"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Structural Workflow Configuration Modal */}
      {flowModalOpen && !editingQuiz && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-xl border border-slate-100 flex flex-col gap-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Setup New Quiz</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Learning Path</label>
                <select 
                  value={selectedPath} 
                  onChange={(e) => setSelectedPath(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                >
                  <option value="">Select Learning Path</option>
                  {pathNames.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Topic / Page</label>
                <select 
                  value={selectedTopic} 
                  disabled={!selectedPath}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-50 font-medium"
                >
                  <option value="">Select Topic / Page</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setFlowModalOpen(false)} className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => setEditingQuiz({})} 
                disabled={!selectedPath || !selectedTopic}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-sm transition-colors"
              >
                Continue to Flow
              </button>
            </div>
          </div>
        </div>
      )}

      {flowModalOpen && editingQuiz && (
        <QuizFlowModal
          open={flowModalOpen}
          onClose={() => setFlowModalOpen(false)}
          initialData={Object.keys(editingQuiz).length > 0 ? editingQuiz : null}
          onSave={handleSaveFlow}
        />
      )}
    </div>
  );
};

// --- Challenge Module ---
const ChallengeTab = ({ pathNames }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPath, setFilterPath] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState(null);

  const [selectedPath, setSelectedPath] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    tags: ''
  });

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const pathParam = filterPath === 'All' ? null : filterPath;
      const data = await getAllExercises(pathParam);
      setExercises(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load challenges.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [filterPath]);

  useEffect(() => {
    if (selectedPath) {
      getTopicsForLearningPath(selectedPath).then(setTopics).catch(console.error);
    } else {
      setTopics([]);
    }
  }, [selectedPath]);

  const handleDelete = async (exId) => {
    if (window.confirm("Are you sure you want to delete this challenge?")) {
      try {
        await deleteExercise(exId);
        toast.success("Challenge deleted successfully!");
        fetchExercises();
      } catch (e) {
        toast.error("Failed to delete challenge.");
      }
    }
  };

  const openEditModal = (ex) => {
    setEditingEx(ex);
    setSelectedPath(ex.path_heading);
    setSelectedTopic(ex.page_text);
    setFormData({
      title: ex.title,
      description: ex.description,
      difficulty: ex.difficulty || 'Beginner',
      tags: (ex.tags || []).join(', ')
    });
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingEx(null);
    setSelectedPath('');
    setSelectedTopic('');
    setFormData({
      title: '',
      description: '',
      difficulty: 'Beginner',
      tags: ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const payload = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: tagsArray
      };

      if (editingEx) {
        await updateExercise(editingEx.id, payload);
        toast.success("Challenge updated successfully!");
      } else {
        await addExercise(selectedPath, selectedTopic, payload);
        toast.success("Challenge created successfully!");
      }
      setModalOpen(false);
      fetchExercises();
    } catch (e) {
      toast.error("Failed to save challenge.");
    }
  };

  const getDifficultyStyles = (difficulty) => {
    switch(difficulty) {
      case 'Advanced': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Intermediate': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  if (loading && exercises.length === 0) return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (error) return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header Utilities */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">Coding Challenges</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Manage interactive coding problems across all learning paths.</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FilterListIcon className="text-slate-400 w-4 h-4 shrink-0" />
          <select 
            value={filterPath}
            onChange={(e) => setFilterPath(e.target.value)}
            className="w-full sm:w-52 text-xs sm:text-sm bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="All">All Paths</option>
            {pathNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Stack */}
      <div className="space-y-3">
        {exercises.length > 0 ? (
          exercises.map((ex, i) => (
            <div 
              key={ex.id || i}
              className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 border border-blue-100">
                  <CodeIcon className="w-4 h-4 sm:w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{ex.title}</h4>
                  <div className="text-[11px] sm:text-xs text-slate-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-1 items-center">
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">Path: {ex.path_heading}</span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">Page: {ex.page_text}</span>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyStyles(ex.difficulty)}`}>
                      {ex.difficulty || 'Beginner'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-1.5 pt-3 sm:pt-0 border-t border-slate-100 sm:border-0 shrink-0">
                <button 
                  onClick={() => openEditModal(ex)}
                  className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(ex.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  <DeleteIcon className="w-4 h-4 sm:w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-blue-200 bg-blue-50/10 rounded-xl flex flex-col items-center justify-center p-6">
            <CodeIcon className="w-10 h-10 mb-2 text-blue-500/60" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">No Challenges Found</h4>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 max-w-xs">Create real-world coding problems for students to solve in the compiler.</p>
          </div>
        )}
      </div>

      {/* Launcher Action Button */}
      <div className="flex justify-center pt-2">
        <button 
          onClick={openCreateModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-sm"
        >
          <AddCircleIcon className="w-4 h-4" /> Launch Challenge Creator
        </button>
      </div>

      {/* Challenge Configuration Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-xl border border-slate-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {editingEx ? 'Edit Challenge' : 'Create New Challenge'}
            </h3>
            
            <div className="space-y-4">
              {!editingEx && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-600">Learning Path</label>
                    <select 
                      value={selectedPath} 
                      onChange={(e) => setSelectedPath(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                    >
                      <option value="">Select Learning Path</option>
                      {pathNames.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-600">Topic / Page</label>
                    <select 
                      value={selectedTopic} 
                      disabled={!selectedPath}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-slate-50 font-medium"
                    >
                      <option value="">Select Topic / Page</option>
                      {topics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Challenge Title</label>
                <input 
                  type="text"
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="e.g., Reverse an Array"
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Problem Description</label>
                <textarea 
                  rows={4}
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Provide markdown or clear specifications..."
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600">Difficulty</label>
                  <select 
                    value={formData.difficulty} 
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600">Tags (comma-separated)</label>
                  <input 
                    type="text"
                    value={formData.tags} 
                    onChange={(e) => setFormData({...formData, tags: e.target.value})} 
                    placeholder="e.g. basics, arrays"
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={!formData.title || !formData.description || (!editingEx && (!selectedPath || !selectedTopic))}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-sm transition-colors"
              >
                Save Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumManager;