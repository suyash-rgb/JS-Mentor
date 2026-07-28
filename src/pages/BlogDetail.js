import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import blogService from '../services/blogService';
import { slugify } from '../utils/slugify';
import { stripMarkdown } from '../utils/stripMarkdown';

const FALLBACK_BLOG_IMAGE = 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=800&q=80';

const EditorialMarkdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mt-10 mb-5 pb-3 border-b border-slate-200">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-snug mt-10 mb-4 pb-2 border-b border-slate-100">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-snug mt-8 mb-3">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg md:text-xl font-bold text-slate-800 mt-6 mb-2">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-slate-700 text-lg md:text-[19px] leading-[1.85] mb-6 font-normal tracking-normal text-left">
      {children}
    </p>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 font-medium underline underline-offset-4 decoration-blue-300 hover:decoration-blue-600 transition"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-600 bg-gradient-to-r from-blue-50/80 to-slate-50/30 py-4 px-6 my-8 italic text-slate-700 rounded-r-2xl shadow-sm text-lg">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside space-y-2 mb-6 ml-6 text-slate-700 text-lg md:text-[19px] leading-[1.85]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside space-y-2 mb-6 ml-6 text-slate-700 text-lg md:text-[19px] leading-[1.85]">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="pl-1">
      {children}
    </li>
  ),
  code: ({ inline, className, children, ...props }) => {
    return inline ? (
      <code className="bg-slate-100 text-blue-700 px-2 py-0.5 rounded-md font-mono text-sm border border-slate-200/80 font-semibold" {...props}>
        {children}
      </code>
    ) : (
      <pre className="bg-slate-900 text-slate-100 p-6 rounded-2xl font-mono text-sm sm:text-base overflow-x-auto my-6 shadow-lg border border-slate-800 leading-relaxed">
        <code className={className} {...props}>{children}</code>
      </pre>
    );
  },
  hr: () => <hr className="my-10 border-t border-slate-200" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-8 border border-slate-200 rounded-2xl shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
  tbody: ({ children }) => <tbody className="bg-white divide-y divide-slate-200">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-slate-50/70 transition">{children}</tr>,
  th: ({ children }) => <th className="px-5 py-3.5 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider border-b">{children}</th>,
  td: ({ children }) => <td className="px-5 py-3.5 text-sm text-slate-600">{children}</td>,
};

const BlogDetail = () => {
  const { slug, id } = useParams();
  const param = slug || id;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      setError(null);
      try {
        // First try direct ID lookup if param looks like a UUID
        try {
          const data = await blogService.fetchBlogById(param);
          if (data && data.id) {
            setBlog(data);
            updateSeoMetaTags(data);
            setLoading(false);
            return;
          }
        } catch (err) {
          // Ignore 404 and fallback to checking all blogs by slug or ID
        }

        const allBlogs = await blogService.fetchBlogs();
        const found = allBlogs.find(
          (b) => slugify(b.title) === param || b.id === param
        );

        if (!found) {
          throw new Error('Blog post not found.');
        }

        setBlog(found);
        updateSeoMetaTags(found);
      } catch (err) {
        setError(err.message || 'Could not load blog post.');
      } finally {
        setLoading(false);
      }
    };

    if (param) {
      loadBlog();
    }
    return () => {
      document.title = 'JS-Mentor | Expert JavaScript Coaching';
    };
  }, [param]);

  const updateSeoMetaTags = (blogData) => {
    if (!blogData) return;
    document.title = `${blogData.title} | JS-Mentor Blog`;

    const setMetaTag = (attrName, attrValue, content) => {
      let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    const cleanContent = blogData.content ? stripMarkdown(blogData.content) : '';
    const snippet = cleanContent
      ? cleanContent.substring(0, 160) + '...'
      : 'Read this article on JS-Mentor Blog.';

    setMetaTag('name', 'description', snippet);
    setMetaTag('property', 'og:title', `${blogData.title} | JS-Mentor Blog`);
    setMetaTag('property', 'og:description', snippet);
    setMetaTag('property', 'og:type', 'article');
    if (blogData.imageUrl) {
      setMetaTag('property', 'og:image', blogData.imageUrl);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTwitter = () => {
    if (!blog) return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out "${blog.title}" on JS-Mentor Blog! `);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    if (!blog) return;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const calculateReadTime = (content) => {
    if (!content) return 1;
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto px-6 py-12 w-full">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            id="back-to-blogs-btn"
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-xl"
          >
            <span aria-hidden="true">&larr;</span> Back to All Articles
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 font-medium text-sm">Loading article...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl text-center my-10 shadow-sm">
            <span className="text-4xl block mb-3" role="img" aria-label="Error">⚠️</span>
            <h2 className="text-lg font-bold mb-2">{error}</h2>
            <p className="text-sm text-red-600 mb-6">We couldn't load this blog post. It may have been removed or unpublished.</p>
            <Link
              to="/blog"
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl transition"
            >
              Return to Blog Directory
            </Link>
          </div>
        ) : blog ? (
          <article className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 md:p-14 transition-all">
            {/* Article Header / Hero */}
            <header className="border-b border-slate-100 pb-8 mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-blue-50 text-blue-700 font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full">
                  Tutorial &amp; Insights
                </span>
                <span className="text-slate-400 text-xs">&bull;</span>
                <span className="text-slate-500 font-semibold text-xs">
                  {calculateReadTime(blog.content)} min read
                </span>
              </div>

              {/* Single H1 for On-Page SEO */}
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                {blog.title}
              </h1>

              {/* Author & Publication Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shadow-md">
                    {blog.author ? blog.author.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{blog.author}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      Published on{' '}
                      {new Date(blog.createdAt || Date.now()).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Social Share Controls */}
                <div className="flex items-center gap-2">
                  <button
                    id="share-twitter-btn"
                    onClick={handleShareTwitter}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-blue-500 bg-slate-50/50 hover:bg-slate-100 transition"
                    title="Share on Twitter / X"
                    aria-label="Share on Twitter"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>
                  <button
                    id="share-linkedin-btn"
                    onClick={handleShareLinkedIn}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-blue-700 bg-slate-50/50 hover:bg-slate-100 transition"
                    title="Share on LinkedIn"
                    aria-label="Share on LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </button>
                  <button
                    id="copy-link-btn"
                    onClick={handleCopyLink}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 bg-slate-50/50 hover:bg-slate-100 transition text-xs font-bold flex items-center gap-1.5"
                    title="Copy Article Link"
                  >
                    <span>{copied ? '✓ Copied' : '🔗 Copy Link'}</span>
                  </button>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {blog.imageUrl && (
              <figure className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-md mb-10 bg-slate-100 max-h-[480px]">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_BLOG_IMAGE;
                  }}
                />
              </figure>
            )}

            {/* Article Content - Professional Editorial Typography & Markdown */}
            <div className="max-w-none font-sans text-left">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={EditorialMarkdownComponents}
              >
                {blog.content}
              </ReactMarkdown>
            </div>

            {/* Author Card Box */}
            <footer className="mt-16 pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/70 p-6 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
                  {blog.author ? blog.author.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Written by {blog.author}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    JS-Mentor Technical Author &amp; Educator
                  </p>
                </div>
              </div>
              <Link
                to="/blog"
                className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 rounded-xl text-sm transition shadow-sm self-stretch md:self-auto text-center"
              >
                Explore More Tutorials
              </Link>
            </footer>
          </article>
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
