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

      // Создаем "призрак" сразу при нажатии
      this.ghostEl = e.target.cloneNode(true);
      if (this.ghostEl.querySelector('.close')) {
        this.ghostEl.removeChild(this.ghostEl.querySelector('.close'));
      }
      // this.ghostEl.removeChild(this.ghostEl.querySelector('.close'));
      this.ghostEl.classList.add('dragged');
      this.ghostEl.classList.add('ghost');
      this.ghostEl.style.width = `${this.draggedEl.offsetWidth}px`;
      this.ghostEl.style.height = `${this.draggedEl.offsetHeight}px`;

      // Вычисляем смещение относительно точки нажатия
      const rect = e.target.getBoundingClientRect();
      this.offsetX = e.clientX - rect.left; // Смещение по оси X
      this.offsetY = e.clientY - rect.top; // Смещение по оси Y

      document.body.appendChild(this.ghostEl);

      // Устанавливаем начальную позицию "призрака"
      this.ghostEl.style.position = 'absolute';
      this.ghostEl.style.top = `${e.clientY - this.offsetY}px`;
      this.ghostEl.style.left = `${e.clientX - this.offsetX}px`;

      this.draggedEl.style.display = 'none';

      // Добавляем обработчик перемещения на document
      // this.board.addEventListener('mousemove', this.dragMove);
      document.addEventListener('mousemove', this.dragMove);
      document.addEventListener('mouseup', this.mouseUp);
    }
  }

  dragMove(e) {
    e.preventDefault();
    if (!this.draggedEl || !this.ghostEl) return;

    // Пересчитываем положение "призрака"
    this.ghostEl.style.top = `${e.clientY - this.offsetY}px`;
    this.ghostEl.style.left = `${e.clientX - this.offsetX}px`;

    // Показываем возможное место для сброса
    this.showPossiblePlace(e);
  }

  mouseUp(e) {
    e.preventDefault();
    if (!this.draggedEl || !this.ghostEl) return;

    // Если есть место для сброса, перемещаем карточку туда
    if (this.newPlace && this.newPlace.parentNode) {
      this.newPlace.replaceWith(this.draggedEl);
    } else {
      // Если место для сброса не найдено, возвращаем карточку на прежнее место
      this.draggedEl.style.display = 'flex';
    }

    // Удаляем "призрак" и место для сброса
    document.body.removeChild(this.ghostEl);
    if (this.newPlace && this.newPlace.parentNode) {
      this.newPlace.remove();
    }

    this.ghostEl = null;
    this.draggedEl = null;
    this.newPlace = null;

    // Удаляем обработчики событий
    document.removeEventListener('mousemove', this.dragMove);
    document.removeEventListener('mouseup', this.mouseUp);
  }

  showPossiblePlace(e) {
    e.preventDefault();
    if (!this.draggedEl || !this.ghostEl) return;

    const closestColumn = e.target.closest('.tasks-list');
    if (!closestColumn) return;

    // Получаем все задачи в колонке
    const allTasks = Array.from(closestColumn.children).filter((child) => child.classList.contains('task'));

    // Рассчитываем позиции всех задач
    const positions = [0]; // Начальная позиция перед первой задачей
    allTasks.forEach((task) => {
      const rect = task.getBoundingClientRect();
      positions.push(rect.top + rect.height / 2); // Середина каждой задачи
    });

    // Находим индекс, куда нужно вставить новое место
    const index = positions.findIndex((pos) => pos > e.clientY);

    // Если элемента .task-list__new-place еще нет, создаем его
    if (!this.newPlace) {
      this.newPlace = document.createElement('div');
      this.newPlace.classList.add('task-list__new-place');
      this.newPlace.style.width = `${this.ghostEl.offsetWidth}px`;
      this.newPlace.style.height = `${this.ghostEl.offsetHeight}px`;
    }

    // Вставляем новое место в нужную позицию
    if (index === 0) {
      closestColumn.prepend(this.newPlace);
    } else if (index === positions.length) {
      closestColumn.appendChild(this.newPlace);
    } else {
      closestColumn.insertBefore(this.newPlace, allTasks[index - 1]);
    }
  }
}
