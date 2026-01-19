import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUsers = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    // Load from localStorage on initial render
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    }
    // Default users
    return [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "Admin",
        status: "Active",
        phone: "+1 234 567 8900",
        joinDate: "2023-01-15",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "Manager",
        status: "Active",
        phone: "+1 234 567 8901",
        joinDate: "2023-02-20",
      },
      {
        id: 3,
        name: "Bob Johnson",
        email: "bob@example.com",
        role: "Editor",
        status: "Inactive",
        phone: "+1 234 567 8902",
        joinDate: "2023-03-10",
      },
      {
        id: 4,
        name: "Alice Brown",
        email: "alice@example.com",
        role: "Viewer",
        status: "Active",
        phone: "+1 234 567 8903",
        joinDate: "2023-04-05",
      },
      {
        id: 5,
        name: "Charlie Wilson",
        email: "charlie@example.com",
        role: "Manager",
        status: "Active",
        phone: "+1 234 567 8904",
        joinDate: "2023-05-15",
      },
    ];
  });

  // Save to localStorage whenever users change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const addUser = (user) => {
    const newUser = {
      ...user,
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      joinDate: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id, updatedData) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updatedData } : user
    ));
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const toggleUserStatus = (id) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' } : user
    ));
  };

  const getStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'Active').length;
    const admins = users.filter(user => user.role === 'Admin').length;
    
    // Count new users this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = users.filter(user => {
      const joinDate = new Date(user.joinDate);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;

    return { totalUsers, activeUsers, admins, newThisMonth };
  };

  return (
    <UserContext.Provider value={{
      users,
      addUser,
      updateUser,
      deleteUser,
      toggleUserStatus,
      getStats
    }}>
      {children}
    </UserContext.Provider>
  );
};