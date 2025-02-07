export default class Card {
  constructor(parent, task) {
    this.parent = parent;
    this.task = task;
  }

  addTask() {
    const cardEl = document.createElement('li');
    cardEl.classList.add('tasks-list_item');
    cardEl.classList.add('task');
    cardEl.textContent = this.task;

    this.parent.appendChild(cardEl);
  }
}
