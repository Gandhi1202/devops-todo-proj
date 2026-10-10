import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contact: '',
    roleId: '', // roleId to be sent to backend
  });

  const [roles, setRoles] = useState([]); // State to store roles
  const [loading, setLoading] = useState(false); // Loading state for roles
  const [error, setError] = useState(''); // To capture error messages
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/role/get/all`); // Adjust the endpoint as necessary
        setRoles(response.data); // Assuming response.data is an array of role objects
      } catch (error) {
        setError('Error fetching roles. Please try again later.');
        console.error('Error fetching roles:', error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simple front-end validation
    if (!formData.name || !formData.email || !formData.password || !formData.contact || !formData.roleId) {
      setError('All fields are required.');
      return;
    }

    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
      setError('Invalid email format.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password should be at least 8 characters.');
      return;
    }

    setError(''); // Clear any previous errors
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/register`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Registration successful', response.data);
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response ? error.response.data : 'Error registering user';
  
      setError(errorMessage);
      console.error('Error registering user:', errorMessage);
  
      // Show the error as an alert
      if (error.response && error.response.data) {
        if (error.response.data === 'Email already exists') {
          alert('The email you entered is already registered. Please try a different one.');
        } else {
          alert(`Error: ${error.response.data}`);
        }
      } else {
        alert('An error occurred. Please try again later.');
      }
    }
  };
  const handleLoginRedirect = () => {
    navigate('/login'); // Redirect to the login page
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ width: '400px' }}>
        <h2 className="text-center mb-4">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contact</label>
            <input
              type="text"
              name="contact"
              className="form-control"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              name="roleId" // Update to roleId to match your backend expectation
              className="form-select"
              value={formData.roleId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select your role</option>
              {roles.length === 0 ? (
                <option value="" disabled>Loading roles...</option>
              ) : (
                roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.roleName}</option> // Assuming role has 'id' and 'roleName' properties
                ))
              )}
            </select>
          </div>
          <button type="submit" className="btn btn-success w-100">
            Register
          </button>
        </form> 
        {/* Add margin-top between Register and Login buttons */}
        <button 
          className="btn btn-primary w-100 mt-2" 
          onClick={handleLoginRedirect} // Redirect to login page
        >
          Login
        </button>
      </div>
    </div>
  );
};
export default RegisterPage;
