import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const LoginPage = ({ setIsAuthenticated, setUserRole, setUserId, setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:8080/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const userData = {
          id: data.user.id,
          roleId: data.user.roleId,
          role: data.user.role,
          name: data.user.name,
          email: data.user.email,
          contact: data.user.contact,
          projects: data.projects,
          tasks: data.tasks,
        };
  
        // Store the user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role); 
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('user', JSON.stringify(userData));  // Save the entire user object
  
        setIsAuthenticated(true);
        setUserRole(data.user.role);
        setUserId(data.user.id);
        setUser(userData);
  
        // Redirect based on role
        if (data.user.roleId === 1) { // Admin
          navigate('/projectsList');
        } else if(data.user.roleId === 2) {
          navigate('/profile');
        }
        else{
          navigate('/profile');
        }
      } else {
        setError(data.message || 'Login failed');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    }
  };

  

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg p-4">
            <h2 className="text-center mb-4">Login</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group mb-3">
                <label>Email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label>Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-3">
                Login
              </button>
            </form>
            <div className="mt-3 text-center">
              <a href="/register">Don't have an account? Register here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
