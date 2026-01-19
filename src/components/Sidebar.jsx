import { 
  HomeIcon, 
  ChartBarIcon, 
  UsersIcon, 
  ShoppingCartIcon,
  CogIcon,
  DocumentTextIcon,
  BellIcon,
  CreditCardIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon, // For Category
  ReceiptPercentIcon, // For Invoices
} from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'

const Sidebar = ({ sidebarOpen, toggleSidebar, closeSidebar }) => {
  const navigation = [
    { name: 'Dashboard', icon: HomeIcon, to: '/' },
    { name: 'Products', icon: ShoppingCartIcon, to: '/products' },
    { name: 'Category', icon: TagIcon, to: '/categories' },
    { name: 'Orders', icon: CreditCardIcon, to: '/orders' },
    { name: 'Invoices', icon: ReceiptPercentIcon, to: '/invoices' },
    { name: 'Users', icon: UsersIcon, to: '/users' },

  ]

  const handleToggle = () => {
    if (toggleSidebar) {
      toggleSidebar()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 bg-white shadow-lg transition-all duration-300 ease-in-out lg:relative lg:inset-0 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex h-full flex-col">
          {/* Logo section */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold">A</span>
              </div>
              {sidebarOpen && (
                <span className="ml-3 text-xl font-bold whitespace-nowrap">AdminPanel</span>
              )}
            </div>
            {sidebarOpen ? (
              <button
                onClick={closeSidebar}
                className="lg:hidden"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            ) : null}
          </div>

          {/* Toggle button for desktop */}
          <button
            onClick={handleToggle}
            className="absolute -right-3 top-6 hidden lg:flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white shadow-md hover:bg-gray-50 z-40"
          >
            {sidebarOpen ? (
              <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) => `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors group relative ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!sidebarOpen ? item.name : ''}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-gray-400'
                    } ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                    {sidebarOpen && (
                      <span className="whitespace-nowrap">{item.name}</span>
                    )}
                    
                    {/* Tooltip for collapsed sidebar */}
                    {!sidebarOpen && (
                      <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

        
        </div>
      </aside>
    </>
  )
}

export default Sidebar