import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProjectList = ({ user }) => {  
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDateTime, setEditDateTime] = useState('');
    const [error, setError] = useState('');
    const [showFilteredProjects, setShowFilteredProjects] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            setError("User is undefined");
            return;
        }

        const loadData = async () => {
            await fetchUsers();
            await fetchProjects();
        };
        loadData();
    }, [user]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let response;

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };

            if (!user || !user.roleId) {
                setError("User or role is not defined.");
                setLoading(false);
                return;
            }

            if (user.roleId === 1) { // Assuming roleId 1 corresponds to "ADMIN"
                response = await axios.get('http://localhost:8080/projects/all', config);
            } else if (user.roleId === 2 && user.id) { // Assuming roleId 2 corresponds to "USER"
                response = await axios.get(`http://localhost:8080/projects/user/${user.id}`, config);
            } else {
                setError("Invalid user role or user ID.");
                setLoading(false);
                return;
            }

            if (response && response.data) {
                setProjects(response.data);
            } else {
                setError("No projects found.");
            }
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : "Error fetching projects. Please try again later.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/user/get/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setUsers(response.data);
        } catch (error) {
            setError("Error fetching users. Please try again later.");
        }
    };

    const handleFilter = async () => {
        setFilteredProjects([]);
        setShowFilteredProjects(false);
        setError('');
    
        // Validate the date inputs
        if (!startDate || !endDate) {
            setError("Please select both start and end dates.");
            return;
        }
    
        const token = localStorage.getItem('token');
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            };
    
            // First API call: Filter projects by date range
            const dateResponse = await axios.get(`http://localhost:8080/projects/filter?startDate=${startDate}&endDate=${endDate}`, config);
            let filteredProjects = dateResponse.data;
    
            // If a user is selected, filter the results by user ID
            if (selectedUserId) {
                const userResponse = await axios.get(`http://localhost:8080/projects/user/${selectedUserId}`, config);
                const userProjects = userResponse.data;
    
                // Filter the projects by intersection of both lists
                filteredProjects = filteredProjects.filter(project => 
                    userProjects.some(userProject => userProject.id === project.id)
                );
            }
    
            // Set filtered projects to state
            if (filteredProjects.length === 0) {
                setError("No projects found for the selected criteria.");
            }
    
            setFilteredProjects(filteredProjects);
            setShowFilteredProjects(true);
        } catch (error) {
            setError("Error fetching projects. Please try again later.");
            console.error("Fetch error:", error);
        }
    };
    
    const handleEdit = (project) => {
        setEditingProjectId(project.id);
        setEditName(project.name);
        setEditDateTime(project.dateTime);
    };

    const handleUpdate = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`http://localhost:8080/projects/update/${editingProjectId}`, {
                name: editName,
                dateTime: editDateTime,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEditingProjectId(null);
            fetchProjects();
        } catch (error) {
            setError("Error updating project. Please try again.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            const token = localStorage.getItem('token');
            try {
                await axios.delete(`http://localhost:8080/projects/delete/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                fetchProjects();
            } catch (error) {
                setError("Error deleting project. Please try again.");
                console.error("Delete error:", error);
            }
        }
    };

    // New functions to handle approval and denial
    const handleApprove = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:8080/projects/approve/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchProjects(); // Refresh the project list after approving
        } catch (error) {
            setError("Error approving project. Please try again.");
            console.error("Approve error:", error);
        }
    };

    const handleDeny = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:8080/projects/deny/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchProjects(); // Refresh the project list after denying
        } catch (error) {
            setError("Error denying project. Please try again.");
            console.error("Deny error:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Projects</h2>
            {loading && <div>Loading...</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            
            {/* Filter Section (shown only for admins) */}
            {user.roleId === 1 && ( // Show filter section only if the user is admin
                <div className="filter-section mt-4">
                    <h4>Filter Projects by Date Range and User</h4>
                    <div className="d-flex">
                        <input
                            type="date"
                            className="form-control me-2"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input
                            type="date"
                            className="form-control me-2"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <select
                            className="form-control me-2"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">Select User</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} (ID: {user.id})
                                </option>
                            ))}
                        </select>
                        <button className="btn btn-primary" onClick={handleFilter}>
                            Filter
                        </button>
                    </div>
                </div>
            )}

            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Project ID</th>
                        <th>Project Name</th>
                        <th>Date Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project) => (
                        <tr key={project.id}>
                            <td>{project.id}</td>
                            <td>
                                {editingProjectId === project.id ? (
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                    />
                                ) : (
                                    project.name
                                )}
                            </td>
                            <td>
                                {editingProjectId === project.id ? (
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={editDateTime}
                                        onChange={(e) => setEditDateTime(e.target.value)}
                                    />
                                ) : (
                                    new Date(project.dateTime).toLocaleString()
                                )}
                            </td>
                            <td>
                                {user.roleId === 1 && ( // Show edit, delete, approve, and deny buttons only for admin
                                    <>
                                        {editingProjectId === project.id ? (
                                            <>
                                                <button className="btn btn-success me-2" onClick={handleUpdate}>
                                                    Save
                                                </button>
                                                <button className="btn btn-secondary" onClick={() => setEditingProjectId(null)}>
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-success me-2" onClick={() => handleApprove(project.id)}>
                                                    Approve
                                                </button>
                                                <button className="btn btn-danger me-2" onClick={() => handleDeny(project.id)}>
                                                    Deny
                                                </button>
                                                <button className="btn btn-warning me-2" onClick={() => handleEdit(project)}>
                                                    Edit
                                                </button>
                                                <button className="btn btn-danger" onClick={() => handleDelete(project.id)}>
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Filtered Project List */}
            {showFilteredProjects && (
                <div className="mt-4">
                    <h3 className="text-center">Filtered Projects</h3>
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Project ID</th>
                                <th>Project Name</th>
                                <th>Date Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map((project) => (
                                    <tr key={project.id}>
                                        <td>{project.id}</td>
                                        <td>{project.name}</td>
                                        <td>{new Date(project.dateTime).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">
                                        No projects found for the selected criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProjectList;
