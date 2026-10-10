import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoleServiceMappingForm = () => {
  const [roles, setRoles] = useState([]);  // List of roles
  const [services, setServices] = useState([]);  // List of services
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchRolesAndServices = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to access this data.');
        return;
      }

      try {
        // Fetch roles and services
        const rolesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/role/get/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRoles(rolesResponse.data);

        const servicesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/service/get/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setServices(servicesResponse.data);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load roles or services. Make sure you are logged in and have the correct permissions.');
      }
    };

    fetchRolesAndServices();
  }, []);

  const handleCheckboxChange = (serviceId) => {
    setSelectedServices((prevSelected) =>
      prevSelected.includes(serviceId)
        ? prevSelected.filter((id) => id !== serviceId)
        : [...prevSelected, serviceId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedRoleId || selectedServices.length === 0) {
      setError('Please select a role and at least one service.');
      return;
    }

    try {
      const roleServiceMappingDTO = {
        roleId: selectedRoleId,
        serviceIds: selectedServices,
      };

      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to assign services.');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/rsc/assign`, roleServiceMappingDTO, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setSuccess('Services successfully assigned to the role!');
        setSelectedServices([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to assign services to the role.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Assign Services to Role</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="role">Select Role:</label>
          <select
            id="role"
            className="form-control"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
          >
            <option value="">Select a Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.roleName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mt-3">
          <label>Select Services:</label>
          <div>
            {services.map((service) => (
              <div key={service.id} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={`service-${service.id}`}
                  checked={selectedServices.includes(service.id)}
                  onChange={() => handleCheckboxChange(service.id)}
                />
                <label className="form-check-label" htmlFor={`service-${service.id}`}>
                  {service.serviceName}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary mt-3">
          Assign Services
        </button>
      </form>
    </div>
  );
};

export default RoleServiceMappingForm;
