import Task from './Board';

const container = document.querySelector('.container');

const tasks = container.querySelectorAll('.task');
const task1 = tasks[0];

const containerTasks = document.createElement('div');
containerTasks.classList.add('container-tasks');
task1.appendChild(containerTasks);

const tasksTodo = new Task(containerTasks, 'todo');
const tasksInProgress = new Task(containerTasks, 'in progress');

const tasksDone = new Task(containerTasks, 'done');

['Task 1', 'Task 2', 'Task 3'].forEach((text) => tasksTodo.addCard(text));
['1', '2'].forEach((text) => {
  tasksInProgress.addCard(text);
});
['Target 1', 'Target 2'].forEach((text) => tasksDone.addCard(text));
