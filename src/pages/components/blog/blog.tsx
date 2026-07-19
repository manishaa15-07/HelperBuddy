// @ts-nocheck
"use client"
import React, { useEffect, useState } from 'react';
import { AlertCircle, CalendarIcon, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion, HTMLMotionProps } from 'framer-motion';
import { NextSeo } from 'next-seo';
import ScrollToTop from '@/components/ScrollToTop';

interface BlogPost {
  _id: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
}

interface ApiResponse {
  success: boolean;
  data: BlogPost[];
}

// Add type definitions
type Div = HTMLMotionProps<"div">;
type Header = HTMLMotionProps<"header">;
type Button = HTMLMotionProps<"button">;
type Paragraph = HTMLMotionProps<"p">;
type Heading1 = HTMLMotionProps<"h1">;
type Heading2 = HTMLMotionProps<"h2">;

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/blog');

        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();

        if (!result.success) {
          throw new Error('Failed to fetch blogs');
        }

        // Ensure we always have an array, even if empty
        setBlogPosts(result.data || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        setBlogPosts([]); // Ensure blogPosts is an empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      y: 50
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[600px] bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-gray-50 p-4">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
        </div>
        <p className="text-gray-600 text-center max-w-md mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 
                   transition-colors duration-300 flex items-center gap-2"
        >
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (blogPosts.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">No Blog Posts Yet</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          We're working on creating amazing content for you. Please check back soon!
        </p>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title="Blog | Home Services Tips & Insights"
        description="Discover expert tips, maintenance guides, and insights about home services, repairs, and improvements."
        canonical="https://your-domain.com/blog"
        openGraph={{
          url: 'https://your-domain.com/blog',
          title: 'Blog | Home Services Tips & Insights',
          description: 'Discover expert tips, maintenance guides, and insights about home services, repairs, and improvements.',
          images: [
            {
              url: 'https://your-domain.com/blog-og-image.jpg',
              width: 1200,
              height: 630,
              alt: 'Home Services Blog',
            },
          ],
        }}
      />
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* Animated Header Section */}
        <motion.header className="relative py-20 bg-black text-white overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-500 opacity-90"></div>
          <motion.div 
            className="relative z-10 max-w-6xl mx-auto px-4 text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <motion.h1 className="text-5xl md:text-6xl font-bold mb-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Our Blog
            </motion.h1>
            <motion.p className="text-xl text-gray-300 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Discover expert tips, insights, and the latest trends in home services and maintenance.
            </motion.p>
          </motion.div>
        </motion.header>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {blogPosts.map((blog) => (
              <motion.div 
                key={blog._id}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
              >
                {/* Image Container */}
                <motion.div 
                  {...{
                    className: "relative h-48 overflow-hidden",
                    whileHover: { scale: 1.05 },
                    transition: { duration: 0.3 }
                  } as Div}
                >
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />
                </motion.div>

                {/* Content Container */}
                <div className="p-6 flex flex-col flex-grow">
                  <motion.h2 
                    className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-gray-700 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    {blog.title}
                  </motion.h2>
                  
                  <motion.div 
                    className="text-gray-600 mb-4 flex items-center gap-2 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {new Date(blog.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </motion.div>

                  <motion.p 
                    {...{
                      className: "text-gray-700 mb-6 line-clamp-3",
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      transition: { delay: 0.3 }
                    } as Paragraph}
                  >
                    {blog.excerpt}
                  </motion.p>

                  {/* Animated Read More Button */}
                  <div className="mt-auto pt-4">
                    <motion.button
                      {...{
                        onClick: () => router.push(`/components/blog/${blog._id}`),
                        className: "group relative w-full bg-black text-white py-3 px-6 rounded-lg overflow-hidden transition-all duration-300",
                        whileHover: { scale: 1.05 },
                        whileTap: { scale: 0.95 }
                      } as Button}
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2">
                        <span className="font-semibold">Read More</span>
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Animated Footer */}
        <motion.footer 
          className="bg-black text-white py-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.p 
              className="text-lg font-medium"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              BLOG by NISHIT_PARMAR
            </motion.p>
            <motion.p 
              className="text-gray-400 mt-2"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Sharing knowledge, empowering homes
            </motion.p>
          </div>
        </motion.footer>
      </div>
      <ScrollToTop />
    </>
  );
};

export default Blog;