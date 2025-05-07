const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task-btn');
const newTaskTitleInput = document.getElementById('new-task-title');
const newTaskDescriptionInput = document.getElementById('new-task-description');

const editModal = document.getElementById('edit-modal');
const editTaskIdInput = document.getElementById('edit-task-id');
const editTaskTitleInput = document.getElementById('edit-task-title');
const editTaskDescriptionInput = document.getElementById('edit-task-description');
const editTaskCompletedCheckbox = document.getElementById('edit-task-completed');
const saveTaskBtn = document.getElementById('save-task-btn');
const closeModalBtn = document.querySelector('.close-button');

const API_BASE_URL = 'http://localhost:8080/api/tasks';

// Function to fetch all tasks
async function fetchTasks() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('Failed to fetch tasks.');
    }
}

// Function to render tasks in the UI
function renderTasks(tasks) {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${task.title} - ${task.description} ${task.completed ? '<span class="completed">(Completed)</span>' : ''}</span>
            <div class="task-actions">
                <button class="edit-btn" data-id="${task.id}">Edit</button>
                <button class="delete-btn" data-id="${task.id}">Delete</button>
            </div>
        `;
        taskList.appendChild(listItem);
    });

    // Add event listeners to the new edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', openEditModal);
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteTask);
    });
}

// Function to add a new task
async function addTask() {
    const title = newTaskTitleInput.value.trim();
    const description = newTaskDescriptionInput.value.trim();

    if (!title) {
        alert('Task title cannot be empty.');
        return;
    }

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newTask = await response.json();
        fetchTasks(); // Re-fetch tasks to update the list
        newTaskTitleInput.value = '';
        newTaskDescriptionInput.value = '';
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task.');
    }
}

// Function to open the edit modal
async function openEditModal(event) {
    const taskId = event.target.dataset.id;
    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const task = await response.json();
        editTaskIdInput.value = task.id;
        editTaskTitleInput.value = task.title;
        editTaskDescriptionInput.value = task.description;
        editTaskCompletedCheckbox.checked = task.completed;
        editModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching task for edit:', error);
        alert('Failed to fetch task details.');
    }
}

// Function to save the edited task
async function saveTask() {
    const taskId = editTaskIdInput.value;
    const updatedTask = {
        id: taskId,
        title: editTaskTitleInput.value.trim(),
        description: editTaskDescriptionInput.value.trim(),
        completed: editTaskCompletedCheckbox.checked,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        fetchTasks(); // Re-fetch tasks to update the list
        closeEditModal();
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Failed to update task.');
    }
}

// Function to delete a task
async function deleteTask(event) {
    const taskId = event.target.dataset.id;
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchTasks(); // Re-fetch tasks to update the list
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task.');
        }
    }
}

// Function to close the edit modal
function closeEditModal() {
    editModal.style.display = 'none';
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
closeModalBtn.addEventListener('click', closeEditModal);
saveTaskBtn.addEventListener('click', saveTask);

// Initial fetch of tasks when the page loads
fetchTasks();