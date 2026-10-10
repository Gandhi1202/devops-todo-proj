import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const ProjectForm = () => {
    const [name, setName] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [users, setUsers] = useState([]); // State for users
    const [selectedUsers, setSelectedUsers] = useState([]); // State for selected user IDs
    const [error, setError] = useState(''); // State for error messages
    const [success, setSuccess] = useState(''); // State for success messages

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token'); // Get the token from local storage
            if (!token) {
                setError("No authentication token found.");
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/get/all`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include the token in the request headers
                        'Content-Type': 'application/json',
                    },
                });
                console.log('Fetched users:', response.data);
                setUsers(response.data); // Assuming the response is an array of user objects
            } catch (error) {
                console.error("Error fetching users:", error);
                setError("Failed to fetch users.");
            }
        };
    
        fetchUsers();
    }, []);
    
    const handleUserChange = (userId) => {
        setSelectedUsers(prevSelected =>
            prevSelected.includes(userId)
                ? prevSelected.filter(id => id !== userId) // Deselect user
                : [...prevSelected, userId] // Select user
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validate the project name
        if (!name || typeof name !== 'string' || name.trim() === '') {
            setError("Project name cannot be null, empty, or a number.");
            return; // Prevent empty submission
        }
    
        // Validate dateTime
        if (!dateTime) {
            setError("Date and time are required.");
            return;
        }
    
        // Validate selected users
        if (selectedUsers.length === 0) {
            setError("At least one user must be selected.");
            return;
        }
    
        setError(''); // Reset error message
    
        const projectData = {
            name,
            dateTime,
            userId: selectedUsers // Include selected user IDs
        };
    
        console.log("Submitting project data:", projectData); // Log the project data
    
        try {
            const token = localStorage.getItem('token'); // Make sure token is included
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/projects`, projectData, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token
                    'Content-Type': 'application/json',
                }
            });
            console.log("Project created response:", response.data); // Log response from the server
            setSuccess("Project created successfully!"); // Success message
            setName(''); // Clear the input after submission
            setDateTime(''); // Clear the dateTime input after submission
            setSelectedUsers([]); // Clear selected users
        } catch (error) {
            console.error("Error creating project:", error.response ? error.response.data : error);
            setError("Failed to create project: " + (error.response?.data?.message || "Unknown error.")); // Error message
        }
    };
    
    

    return (
        <form onSubmit={handleSubmit}>
            <h1 className="text-center my-4" style={{ fontSize: '2.5rem' }}>Create Project</h1>
            {error && <div className="alert alert-danger">{error}</div>} {/* Error message */}
            {success && <div className="alert alert-success">{success}</div>} {/* Success message */}
            <div className="mb-3">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Project Name"
                    className="form-control"
                    required
                />
            </div>
            <div className="mb-3">
                <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="form-control"
                    required
                />
            </div>
            <div className="mb-3">
                <strong>Select Users:</strong>
                {users.map(user => (
                    <div key={user.id} className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserChange(user.id)}
                        />
                        <label className="form-check-label">
                            {user.name}
                        </label>
                    </div>
                ))}
            </div>
            <div className="text-center">
                <button type="submit" className="btn btn-success" style={{ fontSize: '1.35rem' }}>
                    Create Project
                </button>
            </div>
        </form>
    );
};

export default ProjectForm;
