import React, { useState } from 'react';
import axios from 'axios';

const CreateServiceForm = () => {
  const [serviceName, setServiceName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!serviceName) {
      setError('Service name is required!');
      return;
    }

    try {
      const serviceData = { serviceName };

      // Send the POST request to create a new service
      const response = await axios.post('http://localhost:8080/service/post', serviceData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Assuming JWT for authentication
        },
      });

      if (response.status === 201) {
        setSuccess('Service created successfully!');
        setServiceName('');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create service.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Service</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="serviceName">Service Name:</label>
          <input
            type="text"
            id="serviceName"
            className="form-control"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-danger mt-2">{error}</div>}
        {success && <div className="alert alert-success mt-2">{success}</div>}

        <button type="submit" className="btn btn-primary mt-3">Create Service</button>
      </form>
    </div>
  );
};

export default CreateServiceForm;
