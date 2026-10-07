import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchAdminData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:8080/user/all', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProjects(response.data.projects); // Adjust as per your response structure
                setTasks(response.data.tasks); // Adjust as per your response structure
            } catch (error) {
                console.error(error);
                alert('Error fetching admin data');
            }
        };

        fetchAdminData();
    }, []);

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <h2>Projects</h2>
            <ul>
                {projects.map((project) => (
                    <li key={project.id}>{project.name}</li> // Adjust as per your project object structure
                ))}
            </ul>
            <h2>Tasks</h2>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>{task.title}</li> // Adjust as per your task object structure
                ))}
            </ul>
        </div>
    );
};

export default AdminDashboard;
