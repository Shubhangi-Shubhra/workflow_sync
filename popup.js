document.addEventListener('DOMContentLoaded', function () {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const descriptionInput = document.getElementById('description-input');
    const prioritySelect = document.getElementById('priority-select');
    const categorySelect = document.getElementById('category-select');
    const attachmentInput = document.getElementById('attachment-input'); 
    const dueDateInput = document.getElementById('due-date-input');
    const taskList = document.getElementById('task-list');

    function toggleTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(theme);
    }
    function loadTasks() {
        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            tasks.forEach(task => {
                displayTask(task);
            });
        });
    }

    loadTasks(); 

    
    taskForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        const descriptionText = descriptionInput.value.trim();
        const priorityValue = prioritySelect.value;
        const categoryValue = categorySelect.value;
        const attachmentText = attachmentInput.value.trim(); 
        const dueDate = dueDateInput.value.trim(); 

        if (taskText) {
            addTask(taskText, descriptionText, priorityValue, categoryValue, attachmentText, dueDate);
            taskInput.value = '';
            descriptionInput.value = '';
            attachmentInput.value = ''; 
            dueDateInput.value = ''; 
        }
    });

    // Function to add a new task
    function addTask(taskText, descriptionText, priorityValue, categoryValue, attachmentText, dueDate) {
        const newTask = {
            id: Date.now(),
            text: taskText,
            description: descriptionText,
            priority: priorityValue,
            category: categoryValue,
            attachment: attachmentText, 
            completed: false,
            dueDate: dueDate, 
            reminder: null,
            recurring: null
        };

        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            tasks.push(newTask);

            chrome.storage.local.set({ tasks: tasks }, function () {
                displayTask(newTask);
            });
        });
    }

    function displayTask(task) {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', function () {
            updateTaskCompletion(task.id, checkbox.checked);
        });
        taskItem.appendChild(checkbox);

        const taskDetails = document.createElement('div');
        taskDetails.classList.add('task-details');

        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        taskDetails.appendChild(taskText);

        const descriptionText = document.createElement('p');
        descriptionText.textContent = task.description;
        taskDetails.appendChild(descriptionText);

        const attachmentLink = document.createElement('a');
        attachmentLink.textContent = 'Attachment';
        attachmentLink.href = task.attachment;
        attachmentLink.target = '_blank';
        attachmentLink.classList.add('attachment-link');
        taskDetails.appendChild(attachmentLink);

        const dueDateText = document.createElement('span');
        dueDateText.textContent = task.dueDate ? `Due Date: ${task.dueDate}` : '';
        dueDateText.classList.add('due-date');
        taskDetails.appendChild(dueDateText);

        const priorityBadge = document.createElement('span');
        priorityBadge.textContent = getPriorityLabel(task.priority);
        priorityBadge.classList.add('priority-badge', `priority-${task.priority}`);
        taskDetails.appendChild(priorityBadge);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', function () {
            deleteTask(task.id);
            taskItem.remove();
        });
        taskDetails.appendChild(deleteButton);

        taskItem.appendChild(taskDetails);
        taskList.appendChild(taskItem);
    }

    function updateTaskCompletion(taskId, completed) {
        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            const updatedTasks = tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, completed: completed };
                }
                return task;
            });

            chrome.storage.local.set({ tasks: updatedTasks });
        });
    }

    function deleteTask(taskId) {
        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            chrome.storage.local.set({ tasks: updatedTasks });
        });
    }

    function getPriorityLabel(priorityValue) {
        switch (priorityValue) {
            case '1':
                return 'Low Priority';
            case '2':
                return 'Medium Priority';
            case '3':
                return 'High Priority';
            default:
                return '';
        }
    }

    function filterTasks(category, priority) {
        chrome.storage.local.get('tasks', function (data) {
            const tasks = data.tasks || [];
            const filteredTasks = tasks.filter(task => {
                if (category && priority) {
                    return task.category === category && task.priority === priority;
                } else if (category) {
                    return task.category === category;
                } else if (priority) {
                    return task.priority === priority;
                }
                return true; 
            });

            taskList.innerHTML = '';

            filteredTasks.forEach(task => {
                displayTask(task);
            });
        });
    }
    categorySelect.addEventListener('change', function () {
        const selectedCategory = categorySelect.value;
        const selectedPriority = prioritySelect.value;
        filterTasks(selectedCategory, selectedPriority);
    });

    prioritySelect.addEventListener('change', function () {
        const selectedCategory = categorySelect.value;
        const selectedPriority = prioritySelect.value;
        filterTasks(selectedCategory, selectedPriority);
    });

    const themeToggleButton = document.getElementById('theme-toggle-button');
    themeToggleButton.addEventListener('click', function () {
        if (document.body.classList.contains('dark-theme')) {
            toggleTheme('light-theme');
        } else {
            toggleTheme('dark-theme');
        }
    });
});
