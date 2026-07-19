import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isTrainer = localStorage.getItem('role') === 'trainer';
  
  const [newBlog, setNewBlog] = useState({ title: '', content: '', author: '', imageUrl: '' });
  const [submitting, setSubmitting] = useState(false);
  const [expandedBlogs, setExpandedBlogs] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedBlogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/`);
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!newBlog.title || !newBlog.content || !newBlog.author) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/blogs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBlog)
      });
      if (!response.ok) throw new Error('Failed to add blog');
      const data = await response.json();
      setBlogs([...blogs, data]);
      setNewBlog({ title: '', content: '', author: '', imageUrl: '' });
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete blog');
      setBlogs(blogs.filter(b => b.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow max-w-5xl mx-auto px-6 py-12 w-full">
        <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Blog</h1>
            <p className="text-slate-500 mt-2">Latest updates, tutorials, and announcements.</p>
          </div>
        </div>

        {isTrainer && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-10">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-amber-600">✍️</span> Add New Blog (Trainer Only)
            </h2>
            <form onSubmit={handleAddBlog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" placeholder="Title" required 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                  value={newBlog.title} onChange={e => setNewBlog({...newBlog, title: e.target.value})} 
                />
                <input 
                  type="text" placeholder="Author Name" required 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                  value={newBlog.author} onChange={e => setNewBlog({...newBlog, author: e.target.value})} 
                />
              </div>
              <input 
                type="url" placeholder="Image URL (Optional)" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                value={newBlog.imageUrl} onChange={e => setNewBlog({...newBlog, imageUrl: e.target.value})} 
              />
              <textarea 
                placeholder="Blog Content..." required rows="5"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-y"
                value={newBlog.content} onChange={e => setNewBlog({...newBlog, content: e.target.value})} 
              />
              <button 
                type="submit" disabled={submitting}
                className="bg-slate-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish Blog'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <span className="text-4xl mb-4 block">📚</span>
            <p>No blogs published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {blogs.map(blog => {
              const isExpanded = expandedBlogs.has(blog.id);
              const snippet = blog.content.length > 250 ? blog.content.substring(0, 250) + '...' : blog.content;

              return (
                <article key={blog.id} className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row group transition hover:shadow-md p-5 md:p-6 gap-6">
                  {blog.imageUrl && (
                    <div className="md:w-1/4 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100" style={{ maxHeight: '180px' }}>
                      <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                  )}
                  <div className="flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h2 
                        className="text-xl font-bold text-slate-900 leading-tight hover:text-amber-600 cursor-pointer transition" 
                        onClick={() => toggleExpand(blog.id)}
                      >
                        {blog.title}
                      </h2>
                      {isTrainer && (
                        <button 
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition text-xs ml-4 flex-shrink-0"
                          title="Delete Blog"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mb-3 flex items-center gap-2">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{blog.author}</span>
                      <span>&bull;</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                      {isExpanded ? blog.content : snippet}
                    </div>
                    <div className="mt-auto">
                      <button 
                        onClick={() => toggleExpand(blog.id)}
                        className="text-amber-600 hover:text-amber-700 font-bold text-sm flex items-center gap-1 transition-colors"
                      >
                        {isExpanded ? 'Show Less ↑' : 'Read Article →'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
