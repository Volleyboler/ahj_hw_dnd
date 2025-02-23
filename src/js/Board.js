import Card from './Card';
import showError from './showError';

export default class Board {
  constructor() {
    this.board = null;

    this.tasksTodo = [];
    this.tasksInProgress = [];
    this.tasksDone = [];
    this.tasks = [this.tasksTodo, this.tasksInProgress, this.tasksDone];
    this.draggedEl = null;
    this.ghostEl = null;
    this.newPlace = null;
    this.offsetX = 0;
    this.offsetY = 0;

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
    this.board.innerHTML = `
      <div class="column todo">
        <div class="column__header">To Do</div>
        <ul class="tasks-list"></ul>
        <div class="column__add">+ Add another card</div>
      </div>
      <div class="column in-progress">
        <div class="column__header">In Progress</div>
        <ul class="tasks-list"></ul>
        <div class="column__add">+ Add another card</div>
      </div>
      <div class="column done">
        <div class="column__header">Done</div>
        <ul class="tasks-list"></ul>
        <div class="column__add">+ Add another card</div>
      </div>
    `;
    document.querySelector('body').appendChild(this.board);
  }

  drawSavedTasks() {
    const parents = ['.todo', '.in-progress', '.done'];

    for (let i = 0; i < parents.length; i += 1) {
      const parent = this.board.querySelector(parents[i]);

      this.tasks[i].forEach((item) => {
        new Card(parent.querySelector('.tasks-list'), item).addTask();

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
      <textarea class="add-form__textarea" placeholder="Enter a title for this card..."></textarea>
      <div class="add-form__form-control">
        <button class="add-form__button add-form__submit-button">Add Card</button>
        <button class="add-form__button add-form__close-button">Close</button>
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
    if (e.target.classList.contains('task') && !e.target.querySelector('.close')) {
      const closeEl = document.createElement('div');
      closeEl.classList.add('tasks-list__close');
      closeEl.classList.add('close');
      e.target.appendChild(closeEl);
      closeEl.style.top = `${closeEl.offsetTop - closeEl.offsetHeight / 2}px`;
      closeEl.style.left = `${e.target.offsetWidth - closeEl.offsetWidth - 3}px`;

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

      // Удаляем кнопку удаления ("X") из призрака
      if (this.ghostEl.querySelector('.close')) {
        this.ghostEl.removeChild(this.ghostEl.querySelector('.close'));
      }

      // Добавляем классы для стилей
      this.ghostEl.classList.add('dragged');
      this.ghostEl.classList.add('ghost');

      // Устанавливаем размеры призрака
      this.ghostEl.style.width = `${this.draggedEl.offsetWidth}px`;
      this.ghostEl.style.height = `${this.draggedEl.offsetHeight}px`;

      // Вычисляем смещение относительно точки нажатия
      const rect = this.draggedEl.getBoundingClientRect();
      this.offsetX = e.clientX - rect.left; // Смещение по горизонтали
      this.offsetY = e.clientY - rect.top; // Смещение по вертикали

      // Добавляем призрак в DOM
      document.body.appendChild(this.ghostEl);
      this.ghostEl.style.position = 'absolute';

      // Устанавливаем начальную позицию призрака
      this.ghostEl.style.top = `${e.clientY - this.offsetY}px`;
      this.ghostEl.style.left = `${e.clientX - this.offsetX}px`;

      // Скрываем оригинальную карточку
      this.draggedEl.style.display = 'none';

      // Создаем placeholder для вставки
      if (!this.newPlace) {
        this.newPlace = document.createElement('div');
        this.newPlace.classList.add('task-list__new-place');
        this.newPlace.style.width = `${this.ghostEl.offsetWidth}px`;
        this.newPlace.style.height = `${this.ghostEl.offsetHeight}px`;
      }

      // Показываем возможное место для вставки сразу
      this.showPossiblePlace(e);

      // Начинаем отслеживать движение мыши
      document.addEventListener('mousemove', this.dragMove);
      document.addEventListener('mouseup', this.mouseUp);
    }
  }

  dragMove(e) {
    e.preventDefault();
    if (!this.draggedEl) return;

    // Обновляем позицию призрака с учетом смещений
    this.ghostEl.style.top = `${e.clientY - this.offsetY}px`;
    this.ghostEl.style.left = `${e.clientX - this.offsetX}px`;

    // Обновляем место для вставки
    this.showPossiblePlace(e);
  }

  // eslint-disable-next-line no-unused-vars
  mouseUp(e) {
    if (!this.draggedEl) return;

    // Если есть placeholder, вставляем карточку
    if (this.newPlace) {
      this.newPlace.replaceWith(this.draggedEl);
      this.newPlace.remove(); // Удаляем placeholder
      this.newPlace = null;
    }

    // Восстанавливаем видимость оригинальной карточки
    this.draggedEl.style.display = 'flex';

    // Удаляем призрак
    if (this.ghostEl) {
      document.body.removeChild(this.ghostEl);
      this.ghostEl = null;
    }

    // Очищаем ссылку на draggedEl
    this.draggedEl = null;

    // Убираем слушатели событий
    document.removeEventListener('mousemove', this.dragMove);
    document.removeEventListener('mouseup', this.mouseUp);
  }

  showPossiblePlace(e) {
    const closestColumn = e.target.closest('.tasks-list');
    if (!closestColumn || !this.draggedEl) return;

    // Получаем все задачи в столбце
    const allTasks = Array.from(closestColumn.querySelectorAll('.task'));

    // Собираем позиции всех задач
    const columnRect = closestColumn.getBoundingClientRect();
    const allPos = [columnRect.top + window.scrollY]; // Начальная позиция столбца

    allTasks.forEach((task) => {
      const taskRect = task.getBoundingClientRect();
      allPos.push(taskRect.top + task.offsetHeight / 2 + window.scrollY); // Центр задачи
    });

    // Находим индекс, куда нужно вставить карточку
    const mouseY = e.clientY + window.scrollY;
    const insertIndex = allPos.findIndex((pos) => pos > mouseY);

    // Вставляем placeholder в нужную позицию
    if (insertIndex !== -1) {
      closestColumn.insertBefore(this.newPlace, allTasks[insertIndex - 1] || null);
    } else {
      closestColumn.appendChild(this.newPlace);
    }
  }
}
