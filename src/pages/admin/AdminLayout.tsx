import React from 'react';
import { useRouter } from 'next/router';
import { FaUsers, FaCog, FaWallet, FaMoneyBill, FaBlog, FaMailBulk } from 'react-icons/fa';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Don't check on login page
        if (router.pathname === '/admin/login') {
            setIsLoading(false);
            return;
        }

        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
        } else {
            setIsLoading(false);
        }
    }, [router.pathname]);

    // Don't show sidebar on login page
    if (router.pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const menuItems = [
        {
            path: '/admin/service-partners/page',
            name: 'Service Partners',
            icon: <FaUsers className="w-5 h-5" />
        },
        {
            path: '/admin/manage-services/page',
            name: 'Manage Services',
            icon: <FaCog className="w-5 h-5" />
        },
        {
            path: '/admin/referall-wallet/page',
            name: 'Referral & Wallet',
            icon: <FaWallet className="w-5 h-5" />
        },
        {
            path: '/admin/admin-income/page',
            name: 'Income',
            icon: <FaMoneyBill className="w-5 h-5" />
        },
        {
            path: '/admin/blogs/page',
            name: 'Blogs',
            icon: <FaBlog className="w-5 h-5" />
        },
        {
            path: '/admin/mails/page',
            name: 'Mails',
            icon: <FaMailBulk className="w-5 h-5" />
        },
    ];

    const handleNavigation = (path: string) => {
        router.push(path);
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-black text-white fixed h-full">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item) => (
                        <div
                            key={item.path}
                            className={`p-4 cursor-pointer flex items-center space-x-3 
                                ${router.pathname.includes(item.path)
                                    ? 'bg-gray-800 border-l-4 border-white' 
                                    : 'hover:bg-gray-800'}`}
                            onClick={() => handleNavigation(item.path)}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout; 