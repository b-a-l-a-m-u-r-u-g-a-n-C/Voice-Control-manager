// Our task list and counter
let tasks = [];
let nextId = 1;

// Get our HTML elements
const micButton = document.getElementById('micButton');
const statusText = document.getElementById('status');
const taskList = document.getElementById('taskList');

// Check if browser supports voice recognition
if (!('webkitSpeechRecognition' in window)) {
  statusText.textContent = "Sorry, your browser doesn't support voice commands. Try Chrome or Edge.";
  micButton.disabled = true;
} else {
  // Setup voice recognition
  const voiceRecognition = new webkitSpeechRecognition();
  voiceRecognition.continuous = false;
  voiceRecognition.interimResults = false;
  voiceRecognition.lang = 'en-US';

  // When microphone button is clicked
  micButton.addEventListener('click', () => {
    voiceRecognition.start();
    statusText.textContent = "I'm listening...";
    micButton.classList.add('listening');
  });

  // When we get voice results
  voiceRecognition.onresult = (event) => {
    const whatYouSaid = event.results[0][0].transcript.toLowerCase().trim();
    statusText.textContent = `I heard: "${whatYouSaid}"`;
    understandCommand(whatYouSaid);
  };

  // Handle errors
  voiceRecognition.onerror = (event) => {
    statusText.textContent = "Oops, I didn't catch that. Can you try again?";
    micButton.classList.remove('listening');
  };

  // When listening stops
  voiceRecognition.onend = () => {
    micButton.classList.remove('listening');
  };
}

// Understand what the user wants to do
function understandCommand(voiceCommand) {
  // Try to match different command patterns
  if (voiceCommand.includes('add') || voiceCommand.includes('create')) {
    const task = voiceCommand.replace(/^(add|create)\s+/i, '').trim();
    if (task) addNewTask(task);
    
  } else if (voiceCommand.includes('delete') || voiceCommand.includes('remove')) {
    const taskNum = findTaskNumber(voiceCommand);
    if (taskNum) removeTask(taskNum);
    
  } else if (voiceCommand.includes('complete') || voiceCommand.includes('done')) {
    const taskNum = findTaskNumber(voiceCommand);
    if (taskNum) toggleTask(taskNum);
    
  } else if (voiceCommand.includes('list') || voiceCommand.includes('show')) {
    showTasks();
    
  } else {
    statusText.textContent = "I'm not sure what you want me to do. Try saying 'add [task]' or 'complete task 1'";
  }
}

// Find task number from voice command
function findTaskNumber(command) {
  const match = command.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// Add a new task
function addNewTask(taskDescription) {
  const newTask = {
    id: nextId++,
    text: taskDescription,
    completed: false
  };
  
  tasks.push(newTask);
  updateTaskDisplay();
  statusText.textContent = `Added: "${taskDescription}"`;
}

// Remove a task
function removeTask(taskNumber) {
  const index = taskNumber - 1;
  if (tasks[index]) {
    const removedTask = tasks.splice(index, 1)[0];
    updateTaskDisplay();
    statusText.textContent = `Removed: "${removedTask.text}"`;
  } else {
    statusText.textContent = `Couldn't find task ${taskNumber}`;
  }
}

// Mark task as complete/incomplete
function toggleTask(taskNumber) {
  const index = taskNumber - 1;
  if (tasks[index]) {
    tasks[index].completed = !tasks[index].completed;
    updateTaskDisplay();
    const action = tasks[index].completed ? 'completed' : 'marked as not done';
    statusText.textContent = `Task ${taskNumber} ${action}`;
  } else {
    statusText.textContent = `Couldn't find task ${taskNumber}`;
  }
}

// Show all tasks
function showTasks() {
  if (tasks.length === 0) {
    statusText.textContent = "Your task list is empty!";
  } else {
    statusText.textContent = `You have ${tasks.length} task(s)`;
  }
}

// Update the task list display
function updateTaskDisplay() {
  taskList.innerHTML = '';
  
  tasks.forEach((task, index) => {
    const taskElement = document.createElement('li');
    taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    taskElement.innerHTML = `
      <span class="task-text">${index + 1}. ${task.text}</span>
      <div class="task-actions">
        <button onclick="toggleTask(${index + 1})">
          ${task.completed ? '↶' : '✓'}
        </button>
        <button onclick="removeTask(${index + 1})">✕</button>
      </div>
    `;
    
    taskList.appendChild(taskElement);
  });
}