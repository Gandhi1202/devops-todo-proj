import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TaskList = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState({});
    const [users, setUsers] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [showFilteredTasks, setShowFilteredTasks] = useState(false);
    const [error, setError] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user || !user.id) {
                    setError("User ID is not defined. Please log in again.");
                    return;
                }

                const taskResponse = user.roleId === 1 // Assuming roleId 1 is for "ADMIN"
                    ? await axios.get('http://localhost:8080/tasks/all', { headers: { Authorization: `Bearer ${token}` } })
                    : await axios.get(`http://localhost:8080/tasks/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } });

                const projectResponse = await axios.get('http://localhost:8080/projects/all', { headers: { Authorization: `Bearer ${token}` } });
                const userResponse = await axios.get('http://localhost:8080/user/get/all', { headers: { Authorization: `Bearer ${token}` } });

                setTasks(taskResponse.data);
                const projectData = projectResponse.data.reduce((acc, project) => {
                    acc[project.id] = project.name;
                    return acc;
                }, {});
                setProjects(projectData);
                setUsers(userResponse.data);
            } catch (error) {
                setError("Error fetching data. Please check your permissions and try again.");
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [user, token]);

    const handleFilter = async () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        try {
            let filtered = [];

            if (user.roleId === 1 && selectedUserId) {
                const userTasksResponse = await axios.get(`http://localhost:8080/tasks/user/${selectedUserId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                filtered = userTasksResponse.data;
            } else {
                filtered = tasks;
            }

            filtered = filtered.filter(task => {
                const taskDate = new Date(task.dateTime);
                return taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
            });

            setFilteredTasks(filtered);
            setShowFilteredTasks(true);
        } catch (error) {
            console.error("Error fetching filtered tasks:", error);
        }
    };

    const handleExport = async () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8080/tasks/download/excel?start=${startDate}&end=${endDate}`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'filtered_tasks.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting tasks:", error);
        }
    };

    const handleEditClick = (task) => {
        setTasks((prevTasks) =>
            prevTasks.map((t) =>
                t.id === task.id ? { ...t, isEditing: true } : t
            )
        );
    };

    const handleSave = async (task) => {
        try {
            const updatedTask = {
                name: task.name,
                status: task.status,
                projectId: task.projectId,
                dateTime: task.dateTime,
            };

            await axios.put(`http://localhost:8080/tasks/update/${task.id}`, updatedTask, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks((prevTasks) =>
                prevTasks.map((t) =>
                    t.id === task.id ? { ...t, isEditing: false } : t
                )
            );
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleChange = (id, field, value) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === id ? { ...task, [field]: value } : task
            )
        );
    };

    const handleCancel = (task) => {
        setTasks((prevTasks) =>
            prevTasks.map(t =>
                t.id === task.id ? { ...t, isEditing: false } : t
            )
        );
    };

    const handleDelete = async (taskId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:8080/tasks/delete/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
            setFilteredTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    return (
        <div>
            <h2 className="text-center my-4">Tasks</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <h3>All Tasks</h3>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Task ID</th>
                        <th>Task Name</th>
                        <th>Status</th>
                        <th>Project</th>
                        <th>Date Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task.id}>
                            <td>{task.id}</td>
                            <td>
                                {task.isEditing ? (
                                    <input
                                        type="text"
                                        value={task.name}
                                        onChange={(e) => handleChange(task.id, 'name', e.target.value)}
                                    />
                                ) : (
                                    task.name
                                )}
                            </td>
                            <td>
                                {task.isEditing ? (
                                    <input
                                        type="text"
                                        value={task.status}
                                        onChange={(e) => handleChange(task.id, 'status', e.target.value)}
                                    />
                                ) : (
                                    task.status
                                )}
                            </td>
                            <td>{projects[task.projectId] || 'Unknown Project'}</td>
                            <td>
                                {task.isEditing ? (
                                    <input
                                        type="datetime-local"
                                        value={task.dateTime}
                                        onChange={(e) => handleChange(task.id, 'dateTime', e.target.value)}
                                    />
                                ) : (
                                    task.dateTime
                                )}
                            </td>
                            <td>
                                {task.isEditing ? (
                                    <>
                                        <button className="btn btn-success" onClick={() => handleSave(task)}>Save</button>
                                        <button className="btn btn-secondary ms-2" onClick={() => handleCancel(task)}>Cancel</button>
                                    </>
                                ) : (
                                    <>
                                        {/* Admin actions */}
                                        {user.roleId === 1 && (
                                            <>
                                                <button className="btn btn-warning" onClick={() => handleEditClick(task)}>Edit</button>
                                                <button className="btn btn-danger ms-2" onClick={() => handleDelete(task.id)}>Delete</button>
                                                <button className="btn btn-success ms-2">Approve</button>
                                                <button className="btn btn-danger ms-2">Deny</button>
                                            </>
                                        )}

                                        {/* User action */}
                                        {user.roleId ===2 && (
                                            <button className="btn btn-primary" onClick={() => handleEditClick(task)}>Edit</button>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

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
                    {user.roleId === 1 && (
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
                    )}
                    <button className="btn btn-primary" onClick={handleFilter}>
                        Filter
                    </button>
                    <button className="btn btn-secondary ms-2" onClick={handleExport}>
                        Export to Excel
                    </button>
                </div>
            </div>

            {showFilteredTasks && (
                <div>
                    <h3>Filtered Tasks</h3>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Task ID</th>
                                <th>Task Name</th>
                                <th>Status</th>
                                <th>Project</th>
                                <th>Date Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map((task) => (
                                <tr key={task.id}>
                                    <td>{task.id}</td>
                                    <td>{task.name}</td>
                                    <td>{task.status}</td>
                                    <td>{projects[task.projectId] || 'Unknown Project'}</td>
                                    <td>{task.dateTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TaskList;
