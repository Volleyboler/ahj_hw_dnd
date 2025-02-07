import Card from './Card';
import showError from './showError';

export default class Board {
  constructor() {
    this.board = null;

    this.tasksTodo = [];
    this.tasksInProgress = [];
    this.tasksDone = [];
    this.tasks = [this.tasksTodo, this.tasksInProgress, this.tasksDone];
    this.addInput = this.addInput.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.addNewTask = this.addNewTask.bind(this);
    this.onTaskEnter = this.onTaskEnter.bind(this);
    this.removeTask = this.removeTask.bind(this);
    this.saveListOfTasks = this.saveListOfTasks.bind(this);
    this.loadListOfTasks = this.loadListOfTasks.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.drawSavedTasks = this.drawSavedTasks.bind(this);
    this.showPossiblePlace = this.showPossiblePlace.bind(this);
  }

  init() {
    this.loadListOfTasks();
    this.drawBoard();
    this.drawSavedTasks();
    const addList = this.board.querySelectorAll('.column__add');
    [...addList].forEach((el) => el.addEventListener('click', this.addInput));
    window.addEventListener('beforeunload', this.saveListOfTasks);
  }

  loadListOfTasks() {
    const previouslySaved = localStorage.getItem('tasks');

    if (previouslySaved !== null) {
      this.tasks = JSON.parse(previouslySaved);
    }
  }

  saveListOfTasks() {
    this.tasksTodo = [];
    this.tasksInProgress = [];
    this.tasksDone = [];

    const todo = this.board.querySelector('.todo');
    const inProgress = this.board.querySelector('.in-progress');
    const done = this.board.querySelector('.done');

    const tasksTodo = [...todo.querySelectorAll('.task')];
    const tasksInProgress = [...inProgress.querySelectorAll('.task')];
    const tasksDone = [...done.querySelectorAll('.task')];

    tasksTodo.forEach((task) => this.tasksTodo.push(task.textContent));
    tasksInProgress.forEach((task) => this.tasksInProgress.push(task.textContent));
    tasksDone.forEach((task) => this.tasksDone.push(task.textContent));

    this.tasks = [this.tasksTodo, this.tasksInProgress, this.tasksDone];

    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  drawBoard() {
    this.board = document.createElement('section');
    this.board.classList.add('board');
    this.board.innerHTML = `<div class="column">
        <h2 class="column__header">todo</h2>
        <ul class="tasks-list todo"></ul>
        <div class="column__add">+ Add another card</div>
      </div>
      <div class="column">
        <h2 class="column__header">in progress</h2>
        <ul class="tasks-list in-progress" id="trew"></ul> 
        <div class="column__add">+ Add another card</div>
      </div>
      <div class="column">
        <h2 class="column__header">done</h2>
        <ul class="tasks-list done"></ul>
        <div class="column__add">+ Add another card</div>
      </div>`;

    document.querySelector('body').appendChild(this.board);
  }

  drawSavedTasks() {
    const parents = ['.todo', '.in-progress', '.done'];

    for (let i = 0; i < parents.length; i += 1) {
      const parent = this.board.querySelector(parents[i]);

      this.tasks[i].forEach((item) => {
        new Card(parent, item).addTask();

        if (i === 0) {
          this.tasksTodo.push(item);
        }
        if (i === 1) {
          this.tasksInProgress.push(item);
        }
        if (i === 2) {
          this.tasksDone.push(item);
        }
      });

      this.addListeners();
    }
  }

  addInput(e) {
    const newCardForm = document.createElement('form');
    newCardForm.classList.add('column__add-form');
    newCardForm.innerHTML = `
          <textarea class="add-form__textarea" type ="text" placeholder="Enter a title for this card"></textarea>
          <div class="add-form__form-control">
            <button class="add-form__submit-button add-form__button">Add Card</button>
            <button class="add-form__close-button add-form__button">Close</button>
          </div>
       `;
    const closestColumn = e.target.closest('.column');

    e.target.replaceWith(newCardForm);

    const add = closestColumn.querySelector('.add-form__submit-button');
    const close = closestColumn.querySelector('.add-form__close-button');

    add.addEventListener('click', this.addNewTask);
    close.addEventListener('click', this.closeForm);
  }

  closeForm(e) {
    e.preventDefault();
    const columnAdd = document.createElement('div');
    columnAdd.classList.add('column__add');
    columnAdd.textContent = '+ Add another card';

    const parent = e.target.closest('.column');
    const child = parent.querySelector('.column__add-form');
    parent.removeChild(child);
    parent.appendChild(columnAdd);
    columnAdd.addEventListener('click', this.addInput);
  }

  addNewTask(e) {
    e.preventDefault();
    const closestColumn = e.target.closest('.column');
    const parent = closestColumn.querySelector('.tasks-list');
    const task = closestColumn.querySelector('.add-form__textarea').value;

    if (/\S.*/.test(task)) {
      new Card(parent, task).addTask();

      const columnAdd = document.createElement('div');
      columnAdd.classList.add('column__add');
      columnAdd.textContent = '+ Add another card';

      closestColumn.removeChild(
        closestColumn.querySelector('.column__add-form'),
      );
      closestColumn.appendChild(columnAdd);
      columnAdd.addEventListener('click', this.addInput);

      this.addListeners();
    } else {
      showError(closestColumn.querySelector('.column__add-form'), 'empty');
    }
  }

  addListeners() {
    const taskList = this.board.querySelectorAll('.task');
    [...taskList].forEach((el) => el.addEventListener('mouseover', this.onTaskEnter));
    [...taskList].forEach((el) => el.addEventListener('mouseleave', this.onTaskLeave));
    [...taskList].forEach((el) => el.addEventListener('mousedown', this.mouseDown));
  }

  // eslint-disable-next-line class-methods-use-this
  removeTask(e) {
    const task = e.target.closest('.task');
    const parent = e.target.closest('.tasks-list');

    parent.removeChild(task);
  }

  onTaskEnter(e) {
    if (
      e.target.classList.contains('task')
          && !e.target.querySelector('.close')
    ) {
      const closeEl = document.createElement('div');
      closeEl.classList.add('tasks-list__close');
      closeEl.classList.add('close');
      e.target.appendChild(closeEl);
      closeEl.style.top = `${closeEl.offsetTop - closeEl.offsetHeight / 2}px`;
      closeEl.style.left = `${
        e.target.offsetWidth - closeEl.offsetWidth - 3
      }px`;

      closeEl.addEventListener('click', this.removeTask);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onTaskLeave(e) {
    e.target.removeChild(e.target.querySelector('.close'));
  }

  mouseDown(e) {
    if (e.target.classList.contains('task')) {
      this.draggedEl = e.target;
      this.ghostEl = e.target.cloneNode(true);
      this.ghostEl.removeChild(this.ghostEl.querySelector('.close'));
      this.ghostEl.classList.add('dragged');
      this.ghostEl.classList.add('ghost');
      this.ghostEl.style.width = `${this.draggedEl.offsetWidth}px`;
      this.ghostEl.style.height = `${this.draggedEl.offsetHeight}px`;
      document.body.appendChild(this.ghostEl);

      const { top, left } = e.target.getBoundingClientRect();
      this.top = e.pageY - top;
      this.left = e.pageX - left;

      this.ghostEl.style.top = `${top - this.draggedEl.offsetHeight}px`;
      this.ghostEl.style.left = `${left - this.board.offsetWidth}px`;

      this.ghostEl.style.width = `${this.draggedEl.offsetWidth}px`;
      this.ghostEl.style.height = `${this.draggedEl.offsetHeight}px`;

      this.draggedEl.style.display = 'none';
      this.board.addEventListener('mousemove', this.dragMove);
      document.addEventListener('mousemove', this.showPossiblePlace);
      document.addEventListener('mouseup', this.mouseUp);
    }
  }

  dragMove(e) {
    e.preventDefault();
    if (!this.draggedEl) {
      return;
    }

    this.ghostEl.style.top = `${e.pageY - this.top}px`;
    this.ghostEl.style.left = `${e.pageX - this.left}px`;
  }

  mouseUp() {
    if (!this.draggedEl) {
      return;
    }

    this.newPlace.replaceWith(this.draggedEl);

    this.draggedEl.style.display = 'flex';
    document.body.removeChild(document.body.querySelector('.dragged'));

    this.ghostEl = null;
    this.draggedEl = null;
  }

  showPossiblePlace(e) {
    e.preventDefault();
    if (!this.draggedEl) {
      return;
    }

    const closestColumn = e.target.closest('.tasks-list');

    if (closestColumn) {
      const allTasks = closestColumn.querySelectorAll('.task');
      const allPos = [closestColumn.getBoundingClientRect().top];

      if (allTasks) {
        for (const item of allTasks) {
          allPos.push(item.getBoundingClientRect().top + item.offsetHeight / 2);
        }
      }

      if (!this.newPlace) {
        this.newPlace = document.createElement('div');
        this.newPlace.classList.add('task-list__new-place');
      }

      this.newPlace.style.width = `${this.ghostEl.offsetWidth}px`;
      this.newPlace.style.height = `${this.ghostEl.offsetHeight}px`;

      const itemIndex = allPos.findIndex((item) => item > e.pageY);
      if (itemIndex !== -1) {
        closestColumn.insertBefore(this.newPlace, allTasks[itemIndex - 1]);
      } else {
        closestColumn.appendChild(this.newPlace);
      }
    }
  }
}
