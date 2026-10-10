import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const TaskForm = () => {
    const [tasks, setTasks] = useState([{ name: '', status: '', projectId: '', dateTime: '', userId: [] }]);
    const [users, setUsers] = useState([]); // State for users
    const [projects, setProjects] = useState([]); // State for projects

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token'); // Get the token from local storage
            if (!token) {
                console.error("No authentication token found.");
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/get/all`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include the token in the request headers
                        'Content-Type': 'application/json',
                    },
                });
                setUsers(response.data); // Assuming the response is an array of user objects
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        const fetchProjects = async () => {
            const token = localStorage.getItem('token'); // Get the token from local storage
            if (!token) {
                console.error("No authentication token found.");
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/projects/all`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Include the token in the request headers
                        'Content-Type': 'application/json',
                    },
                });
                setProjects(response.data); // Assuming the response is an array of project objects
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        fetchUsers();
        fetchProjects();
    }, []);

    const handleTaskChange = (index, e) => {
        const newTasks = [...tasks];
        newTasks[index][e.target.name] = e.target.value; // Update the specific task
        setTasks(newTasks);
    };

    const handleUserChange = (index, userId) => {
        const newTasks = [...tasks];
        const userIndex = newTasks[index].userId.indexOf(userId);

        // If the user is already selected, remove them; otherwise, add them
        if (userIndex === -1) {
            newTasks[index].userId.push(userId);
        } else {
            newTasks[index].userId.splice(userIndex, 1);
        }

        setTasks(newTasks);
    };

    const addTask = () => {
        setTasks([...tasks, { name: '', status: '', projectId: '', dateTime: '', userId: [] }]); // Add a new empty task
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Filter valid tasks (ensure required fields are filled)
        const validTasks = tasks.filter(task => 
            task.name && task.status && task.projectId && task.dateTime && task.userId.length > 0
        );
    
        // Check if there are valid tasks to submit
        if (validTasks.length === 0) {
            console.error("No valid tasks to submit.");
            alert("No valid tasks to submit. Please ensure all required fields are filled.");
            return; // Prevent empty submission
        }
    
        const token = localStorage.getItem('token'); // Get the token again for clarity
        console.log("Authorization Token:", token); // Log the token for debugging
        console.log("Submitting tasks:", validTasks); // Log the tasks to be submitted
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/tasks`, validTasks, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token in the headers
                    'Content-Type': 'application/json',
                }
            });
    
            console.log("Tasks created:", response.data);
            
            // Reset the form after submission
            setTasks([{ name: '', status: '', projectId: '', dateTime: '', userId: [] }]);
    
            // You can show a success message if needed
            alert("Tasks successfully created!");
    
        } catch (error) {
            // Display more detailed error message on failure
            console.error("Error creating tasks:", error.response ? error.response.data : error);
            
            // Show a user-friendly error message
            alert("Meeting is not created.  It accept alpha numeric only ");
        }
    };
    
    

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-center my-4" style={{ fontSize: '2rem' }}>Create Tasks for Particular Project</h2>
            {tasks.map((task, index) => (
                <div key={index} className="mb-3">
                    {/* Dropdown for Project ID */}
                    <label>Project Name</label>
                    <select
                        name="projectId"
                        value={task.projectId}
                        onChange={(e) => handleTaskChange(index, e)}
                        className="form-control mt-2"
                        required
                    >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.name} {/* Assuming project object has id and name properties */}
                            </option>
                        ))}
                    </select>
                    <label>Task Name</label>
                    <input
                        type="text"
                        name="name"
                        value={task.name}
                        onChange={(e) => handleTaskChange(index, e)}
                        placeholder="Task Name"
                        className="form-control"
                        required
                    />
                    <label>Project Status</label>
                    <input
                        type="text"
                        name="status"
                        value={task.status}
                        onChange={(e) => handleTaskChange(index, e)}
                        placeholder="Task Status"
                        className="form-control mt-2"
                        required
                    />
                    
                    <label>Select Date</label>
                    <input
                        type="datetime-local"
                        name="dateTime"
                        value={task.dateTime}
                        onChange={(e) => handleTaskChange(index, e)}
                        className="form-control mt-2"
                        required
                    />

                    <div className="mt-2">
                        <strong>Select Users:</strong>
                        {users.map(user => (
                            <div key={user.id} className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={task.userId.includes(user.id)}
                                    onChange={() => handleUserChange(index, user.id)}
                                />
                                <label className="form-check-label">
                                    {user.name} {/* Assuming user object has id and name properties */}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="text-center mb-4">
                <button type="button" className="btn btn-secondary" onClick={addTask}>
                    Add Another Task
                </button>
            </div>
            <div className="text-center">
                <button type="submit" className="btn btn-primary" style={{ fontSize: '1.35rem' }}>
                    Create Tasks
                </button>
            </div>
        </form>
    );
};

export default TaskForm;
