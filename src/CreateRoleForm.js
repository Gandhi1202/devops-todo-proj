import React, { useState } from 'react';
import axios from 'axios';

const CreateRoleForm = () => {
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle the form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!roleName) {
      setError('Role name is required!');
      return;
    }

    try {
      const newRole = { roleName };

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not authenticated!');
        return;
      }

      // Send the POST request to create a new role
      const response = await axios.post('http://localhost:8080/role/post', newRole, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to Authorization header
        },
      });

      if (response.status === 201) {
        setSuccess('Role created successfully!');
        setRoleName(''); // Clear the input field
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create the role.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Role</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="roleName">Role Name:</label>
          <input
            type="text"
            id="roleName"
            className="form-control"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-danger mt-2">{error}</div>}
        {success && <div className="alert alert-success mt-2">{success}</div>}

        <button type="submit" className="btn btn-primary mt-3">Create Role</button>
      </form>
    </div>
  );
};

export default CreateRoleForm;
