import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Link, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProjectForm from './ProjectForm';
import ProjectList from './ProjectList';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import Register from './RegisterPage';
import LoginPage from './LoginPage';
import UserProfile from './UserProfile';
import CreateRoleForm from './CreateRoleForm';
import RoleServiceMappingForm from './RoleServiceMappingForm';
import CreateServiceForm from './CreateServiceForm ';// Add CreateServiceForm import

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(''); // Store role (admin or user)
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null); // Store user object

  useEffect(() => {
    // Check localStorage for authentication data
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedRole = localStorage.getItem('userRole');
    const savedId = localStorage.getItem('userId');
    const savedUser = localStorage.getItem('user');

    if (savedAuth && savedRole && savedId && savedUser) {
      setIsAuthenticated(JSON.parse(savedAuth));
      setUserRole(savedRole);
      setUserId(JSON.parse(savedId));
      setUser(JSON.parse(savedUser)); // Load user data
    }
  }, []);

  const handleLogout = () => {
    // Reset states and clear localStorage on logout
    setIsAuthenticated(false);
    setUserRole('');
    setUserId(null);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Clear token on logout
  };

  return (
    <Router>
      <div className="container mt-4">
        <h1 className="mb-4">Project Management</h1>

        {isAuthenticated && (
          <nav className="nav mb-4">
            {/* Conditional rendering based on role */}
            {user.roleId === 1 && (
              <>
                <Link className="nav-link" to="/projects">Projects</Link>
                <Link className="nav-link" to="/projectsList">Projects List</Link>
                <Link className="nav-link" to="/tasks">Tasks</Link>
                <Link className="nav-link" to="/taskList">Tasks List</Link>
                <Link className="nav-link" to="/createRole">Create Role</Link> {/* Admin only */}
                <Link className="nav-link" to="/createService">Create Service</Link> {/* Admin only */}
                <Link className="nav-link" to="/roleServiceMappingForm">Create Role Service</Link> {/* Admin only */}
              </>
            )}
            {user.roleId === 2 && (
              <>
                <Link className="nav-link" to="/projectsList">Projects List</Link>
                <Link className="nav-link" to="/taskList">Tasks List</Link>
                <Link className="nav-link" to="/createService">Create Service</Link> 
              </>
            )}
            {user.roleId === 3 && (
              <>
               
                <Link className="nav-link" to="/taskList">Tasks List</Link>
                
              </>
            )}
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </nav>
        )}

        <Routes>
          {/* Route protection */}
          <Route path="/projects" element={isAuthenticated && user.roleId === 1 ? <ProjectForm /> : <Navigate to="/login" />} />
          <Route path="/projectsList" element={isAuthenticated ? <ProjectList user={user} /> : <Navigate to="/login" />} />
          <Route path="/tasks" element={isAuthenticated && user.roleId === 1 ? <TaskForm /> : <Navigate to="/login" />} />
          <Route path="/taskList" element={isAuthenticated ? <TaskList user={user} /> : <Navigate to="/login" />} />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={
            <LoginPage 
              setIsAuthenticated={setIsAuthenticated} 
              setUserRole={setUserRole} 
              setUserId={setUserId} 
              setUser={setUser} 
            />
          } />
          <Route path="/profile" element={isAuthenticated ? <UserProfile user={user} /> : <Navigate to="/login" />} />

          {/* Admin-Only Routes */}
          <Route path="/createRole" element={isAuthenticated && user.roleId === 1 ? <CreateRoleForm /> : <Navigate to="/login" />} />
          <Route path="/createService" element={isAuthenticated && (user.roleId === 1 || user.roleId === 2) ? <CreateServiceForm /> : <Navigate to="/login" />} />
          <Route path="/roleServiceMappingForm" element={isAuthenticated && user.roleId === 1 ? <RoleServiceMappingForm /> : <Navigate to="/login" />} />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
