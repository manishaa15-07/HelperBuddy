// @ts-nocheck
"use client"
import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { FaSearch } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import SearchBar from '../common/SearchBar';
import ProductData from '../../../data/ProductData';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ScrollToTop from '@/components/ScrollToTop';

// Define types for service and modal items
interface ServiceItem {
  id: number;
  title: string;
  icon: string;
  category: string;
}

interface ModalItem {
  icon: string;
  title: string;
}

interface ModalContent {
  title: string;
  items: ModalItem[];
}

type MotionDivProps = HTMLMotionProps<"div">;

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1024 },
    items: 3,
  },
  desktop: {
    breakpoint: { max: 1024, min: 768 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 768, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
} as const;

// Add these testimonials data near the top with other interfaces
const testimonials = [
  { id: 1, text: "Excellent service! Very professional team.", author: "Sarah M." },
  { id: 2, text: "Best home service I've ever experienced!", author: "John D." },
  { id: 3, text: "Quick response and great work quality.", author: "Michael R." },
  { id: 4, text: "Very reliable and trustworthy service.", author: "Emma W." },
  { id: 5, text: "Highly recommend their cleaning service!", author: "David L." },
  { id: 6, text: "Outstanding customer service!", author: "Lisa P." },
];

const HomeServices: React.FC = () => {
  const [activeModal, setActiveModal] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredServices, setFilteredServices] = useState<ServiceItem[]>([]);
  const router = useRouter();

  const services: ServiceItem[] = [
    {
      id: 1,
      title: "Women's Salon & Spa",
      icon: "https://cdn-icons-png.flaticon.com/512/1940/1940922.png",
      category: "beauty"
    },
    {
      id: 2,
      title: "Men's Salon & Massage",
      icon: "https://cdn-icons-png.flaticon.com/512/2377/2377322.png",
      category: "beauty"
    },
    {
      id: 3,
      title: "AC & Appliance Repair",
      icon: "https://cdn-icons-png.flaticon.com/512/3069/3069674.png",
      category: "repair"
    },
    {
      id: 4,
      title: "Cleaning & Pest Control",
      icon: "https://cdn-icons-png.flaticon.com/512/2970/2970975.png",
      category: "cleaning"
    },
    {
      id: 5,
      title: "Electrician, Plumber & Carpenter",
      icon: "https://cdn-icons-png.flaticon.com/512/4264/4264901.png",
      category: "repair"
    },
    {
      id: 6,
      title: "Native Water Purifier",
      icon: "https://cdn-icons-png.flaticon.com/512/1175/1175277.png",
      category: "appliances"
    },
    {
      id: 7,
      title: "Rooms/walls painting",
      icon: "https://cdn-icons-png.flaticon.com/512/1048/1048947.png",
      category: "home"
    },
    {
      id: 8,
      title: "Wall Panels",
      icon: "https://cdn-icons-png.flaticon.com/512/3079/3079162.png",
      category: "home"
    }
  ];

  // Filter services from ProductData
  const filteredProducts = searchQuery ? ProductData.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Filter local services
  const filteredServicesLocal = services.filter(service =>
    service.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchFocus = () => {
    setShowSearchResults(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchResults(false), 200);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = services.filter((service) =>
      service.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleProductClick = (productId: number) => {
    setShowSearchResults(false);
    setSearchQuery('');
    router.push(`/components/Product/${productId}`);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } }
  };

  const modalContent: Record<number, ModalContent> = {
    1: {
      title: "Women's Salon & Spa",
      items: [
        {
          icon: "https://cdn-icons-png.flaticon.com/512/8028/8028145.png",
          title: "Hair Styling"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/3685/3685633.png",
          title: "Facial & Cleanup"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/9397/9397090.png",
          title: "Waxing"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/1005/1005768.png",
          title: "Manicure & Pedicure"
        }
      ]
    },
    2: {
      title: "Men's Salon & Massage",
      items: [
        {
          icon: "https://cdn-icons-png.flaticon.com/512/4867/4867608.png",
          title: "Haircut & Styling"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/7640/7640931.png",
          title: "Beard Trim & Shape"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/5262/5262327.png",
          title: "Body Massage"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/3531/3531990.png",
          title: "Face Care"
        }
      ]
    },
    3: {
      title: "AC & Appliance Repair",
      items: [
        {
          icon: "https://cdn-icons-png.flaticon.com/512/9457/9457452.png",
          title: "AC Service & Repair"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/2272/2272219.png",
          title: "Refrigerator Repair"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/2503/2503513.png",
          title: "Washing Machine"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/8002/8002163.png",
          title: "Microwave Repair"
        }
      ]
    },
    4: {
      title: "Cleaning & Pest Control",
      items: [
        {
          icon: "https://cdn-icons-png.flaticon.com/512/2865/2865775.png",
          title: "Home Deep Cleaning"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/995/995053.png",
          title: "Bathroom Cleaning"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/8342/8342542.png",
          title: "Pest Control"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/2927/2927347.png",
          title: "Sanitization"
        }
      ]
    },
    5: {
      title: "Electrician, Plumber & Carpenter",
      items: [
        {
          icon: "https://cdn-icons-png.flaticon.com/512/1983/1983275.png",
          title: "Electrical Work"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/4635/4635163.png",
          title: "Plumbing Services"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/2829/2829964.png",
          title: "Carpentry Work"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/4544/4544322.png",
          title: "Installation"
        }
      ]
    },
    6: {
      title: "Water Purifier",
      items: [
        {
          icon: "https://cdn-icons-png.flaticon.com/512/4147/4147164.png",
          title: "Installation"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/4147/4147126.png",
          title: "Repair"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/4147/4147176.png",
          title: "Service"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/4147/4147138.png",
          title: "Filter Change"
        }
      ]
    },
    7: {
      title: "Painting Services",
      items: [
        {
          icon: "https://cdn-icons-png.flaticon.com/512/3095/3095221.png",
          title: "Wall Painting"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/2913/2913136.png",
          title: "Texture Painting"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/4880/4880636.png",
          title: "Waterproofing"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/1048/1048947.png",
          title: "Wood Painting"
        }
      ]
    },
    8: {
      title: "Wall Panels",
      items: [
        {
          icon: "https://cdn-icons-png.flaticon.com/512/8068/8068123.png",
          title: "PVC Panels"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/2432/2432592.png",
          title: "Wooden Panels"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/5229/5229380.png",
          title: "3D Panels"
        },
        {
          icon: "https://cdn-icons-png.flaticon.com/512/4356/4356011.png",
          title: "Acoustic Panels"
        }
      ]
    }
  };

  interface ServiceModalProps {
    modalId: number;
    onClose: () => void;
  }

  const ServiceModal: React.FC<ServiceModalProps> = ({ modalId, onClose }) => {
    const content = modalContent[modalId];
    if (!content) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
        <div 
          className="bg-white p-4 md:p-6 rounded-lg w-full md:w-1/3 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold">{content.title}</h2>
            <button 
              onClick={onClose} 
              className="text-2xl font-bold p-2 hover:bg-gray-100 rounded-full"
            >
              &times;
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {content.items.map((item, index) => (
              <div 
                key={index} 
                className="text-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => router.push(`/components/services/${modalId}/${item.title.toLowerCase().replace(/ /g, '-')}`)}
              >
                <img
                  src={item.icon}
                  alt={item.title}
                  className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2"
                />
                <p className="text-xs md:text-sm">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Add this CSS to create the continuous scrolling animation
  const marqueeStyles = `
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;

  // Add these animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
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
        duration: 1
      }
    }
  };

  // Add these animation variants for testimonials
  const testimonialContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const testimonialItemVariants = {
    hidden: { 
      opacity: 0,
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 mt-8 sm:mt-12">
      {/* Search Section - Moved to top */}
      <div className="mb-12 relative">
        <div className="max-w-xl sm:max-w-2xl mx-auto">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={handleSearch}
            placeholder="Search for home services..."
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery && (
          <div className="absolute w-full bg-white mt-3 rounded-2xl shadow-2xl z-50 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto
                        border border-gray-100 backdrop-blur-sm backdrop-filter
                        transition-all duration-300 ease-in-out">
            {filteredProducts.length > 0 ? (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-4 px-2">Available Services</h3>
                <div className="space-y-2">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer rounded-xl
                                transition-all duration-200 ease-in-out group"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden group-hover:shadow-md
                                    transition-all duration-200">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover transform group-hover:scale-105
                                   transition-transform duration-200"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900 group-hover:text-black">{product.title}</h4>
                        <p className="text-sm text-gray-500">₹{product.discountedPrice}</p>
                      </div>
                      <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium
                                    opacity-0 group-hover:opacity-100 transform translate-x-2 
                                    group-hover:translate-x-0 transition-all duration-200">
                        View Details →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FaSearch className="w-6 h-6 mx-auto mb-3 text-gray-300" />
                <p className="text-lg">No services found matching your search</p>
                <p className="text-sm text-gray-400 mt-1">Try searching with different keywords</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main content section */}
      <div className="flex flex-col md:flex-row md:space-x-24">
        {/* Left column - Text and search */}
        <div className='flex flex-col justify-center mb-8 md:mb-0'>
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-black text-center md:text-left">
            Home services at your doorstep
          </h1>
          <div className="w-full md:w-4/5 bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border-4 border-black">
            <h2 className="text-lg sm:text-xl text-gray-100 mb-4 sm:mb-6">What are you looking for?</h2>
            {/* Service grid - Responsive columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {filteredServicesLocal.map((service) => (
                <div
                  key={service.id}
                  className="bg-gray-300 p-3 sm:p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setActiveModal(service.id)}
                >
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={service.icon}
                      alt={service.title}
                      className="w-6 h-6 sm:w-8 sm:h-8 mb-2 object-contain"
                    />
                    <span className="text-xs sm:text-sm">{service.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Images */}
        <div className="hidden md:flex gap-4">
          {/* First column - 3 images */}
          <div className="flex flex-col gap-4">
            <Image
              src="/img/showcase/service1.jpg"
              alt="Service 1"
              className="w-full h-48 object-cover rounded-lg shadow-md"
              width={300}
              height={300}
            />
            <Image
              src="/img/showcase/service2.jpg"
              alt="Service 2"
              className="w-full h-48 object-cover rounded-lg shadow-md"
              width={300}
              height={300}
            />
            <Image
              src="/img/showcase/service3.jpg"
              alt="Service 3"
              className="w-full h-48 object-cover rounded-lg shadow-md"
              width={300}
              height={300}
            />
          </div>

          {/* Second column - 1 image */}
          <div>
            <img
              src="/img/showcase/service4.jpg"
              alt="Service 4"
              className="w-full h-[calc(3*12rem+2rem)] object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </div>

      {activeModal !== null && (
        <ServiceModal
          modalId={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Popular Services Carousel */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-semibold mb-6">Popular Services</h2>
        <Carousel responsive={responsive} infinite autoPlay arrows={false}>
          {[
            { title: "Cleaning", desc: "Top-rated professionals available.", img: "https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=574,h=322,fit=crop,q=100/cdn-ecommerce/store_01JCYZKF09EKDA2HS3ZXYAX2G1%2Fassets%2F1734719804317-washing_machine_1702277226059_1702277226265.webp" },
            {
              title: "Plumbing", desc: "Expert plumbers at your service.",
              img: "https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=574,h=322,fit=crop,q=100/cdn-ecommerce/store_01JCYZKF09EKDA2HS3ZXYAX2G1%2Fassets%2F1734724488179-65ce57f83f48efe3c9ba6b20_AoIz5KCqLw88GZDa3lkcEH1mTa5tZEnYPaibiYi-Ur70UUVHzLg-y9b-8G67fZ53pov8cGxVNyCpImxyFoH5PpHbmabxUQaxbs4cYsPXXu9u00pIhjwzUhzdU-WyZC4jEp1J0WsA_djRYO47GeEjlXM.jpeg"
            },
            {
              title: "Electrical", desc: "Licensed electricians available.", img:
                "https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=574,h=322,fit=crop,q=100/cdn-ecommerce/store_01JCYZKF09EKDA2HS3ZXYAX2G1%2Fassets%2F1734721775540-1_4gthwYkzwqGIBjRkYKBlCQ.webp"
            },
            {
              title: "Painting", desc: "Give your home a fresh look.",
              img: "https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=574,h=322,fit=crop,q=100/cdn-ecommerce/store_01JCYZKF09EKDA2HS3ZXYAX2G1%2Fassets%2F1734723540812-store_01JCYZKF09EKDA2HS3ZXYAX2G1_assets_1732002352724-AC_Repair_Cost_279259535-1.webp"
            },
            {
              title: "Pest Control", desc: "Keep your home pest-free.",
              img: "https://cdn.zyrosite.com/cdn-cgi/image/format=auto,w=574,h=322,fit=crop,q=100/cdn-ecommerce/store_01JCYZKF09EKDA2HS3ZXYAX2G1%2Fassets%2F1734722591691-store_01JCYZKF09EKDA2HS3ZXYAX2G1_assets_1733056243258-1000s.webp"
            },
          ].map((service, index) => (
            <div key={index} className="p-6 bg-gray-200 shadow rounded-lg text-center mx-3">
              <img src={service.img} alt={service.title} className="w-[600px] h-[400px]object-cover rounded-lg mx-auto" />
              <h3 className="text-xl font-bold mt-4">{service.title}</h3>
              <p className="text-gray-600 mt-2">{service.desc}</p>
            </div>
          ))}
        </Carousel>
      </section>

      {/* steps */}
      <section className="py-16 text-center bg-gray-200">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-10 text-primary"
        >
          How It Works
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            { step: "1", title: "Search", desc: "Find the service you need." },
            { step: "2", title: "Select", desc: "Choose from verified professionals." },
            { step: "3", title: "Book", desc: "Schedule at your convenience." },
            { step: "4", title: "Enjoy", desc: "Relax while we handle the rest!" },
          ].map(({ step, title, desc }) => (
            <motion.div 
              key={step}
              variants={itemVariants}
              className="p-8 bg-white shadow-lg rounded-xl flex flex-col items-center"
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", bounce: 0.4 }
              }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.2,
                  rotate: [0, -10, 10, -10, 0],
                  transition: {
                    rotate: {
                      repeat: Infinity,
                      duration: 1.5
                    }
                  }
                }}
              >
                <FaCheckCircle className="text-black text-4xl mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold">Step {step}: {title}</h3>
              <p className="text-gray-600 mt-3 text-lg">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <div className="mt-16 overflow-hidden bg-gray-200 py-10">
        <style>{marqueeStyles}</style>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-center mb-10"
        >
          What Our Customers Say
        </motion.h2>

        <motion.div 
          className="relative overflow-hidden"
          variants={testimonialContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div
            className="flex space-x-8 whitespace-nowrap"
            style={{
              animation: 'scroll 30s linear infinite',
              display: 'flex',
              width: 'fit-content'
            }}
          >
            {/* Double the testimonials for seamless loop */}
            {[...testimonials, ...testimonials].map((review, index) => (
              <motion.div
                key={index}
                variants={testimonialItemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { type: "spring", bounce: 0.4 }
                }}
                className="w-[350px] inline-flex flex-none flex-col rounded-lg bg-black p-6 shadow-lg mx-4"
              >
                <motion.div 
                  className="flex justify-center mb-4"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <FaStar className="text-yellow-400 text-xl" />
                    </motion.div>
                  ))}
                </motion.div>
                <motion.p 
                  className="text-white italic mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  "{review.text}"
                </motion.p>
                <motion.p 
                  className="text-white font-semibold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  - {review.author}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <ScrollToTop />
    </div>
  );
};

export default HomeServices;