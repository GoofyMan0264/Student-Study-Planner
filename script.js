(() => {
  "use strict";

  const TASK_KEY = "studyTasks";
  const SESSION_KEY = "studentStudyTimetable";
  const THEME_KEY = "studyPlannerTheme";
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const priorityRank = { high: 0, medium: 1, low: 2 };

  const $ = (id) => document.getElementById(id);
  const taskForm = $("task-form");
  const taskList = $("task-list");
  const taskMessage = $("task-message");
  const searchInput = $("task-search");
  const filterInput = $("task-filter");
  const sortInput = $("task-sort");
  const timetableForm = $("timetable-form");
  const timetableContainer = $("timetable-container");
  const timetableMessage = $("timetable-message");

  function readStorage(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.warn(`Could not read ${key}:`, error);
      return [];
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Could not save ${key}:`, error);
      return false;
    }
  }

  let tasks = readStorage(TASK_KEY);
  if (!Array.isArray(tasks)) tasks = [];
  tasks = tasks.filter(task => task && typeof task === "object" && task.id != null);
  let sessions = readStorage(SESSION_KEY);
  if (!Array.isArray(sessions)) sessions = [];
  sessions = sessions.filter(session => session && typeof session === "object" && session.id != null);

  function localToday() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
  }

  function isOverdue(task) {
    return Boolean(task.deadline && !task.completed && task.deadline < localToday());
  }

  function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    $("stat-total").textContent = tasks.length;
    $("stat-completed").textContent = completed;
    $("stat-pending").textContent = tasks.length - completed;
    $("stat-overdue").textContent = tasks.filter(isOverdue).length;
  }

  function addText(parent, tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    parent.appendChild(element);
    return element;
  }

  function renderTasks() {
    taskList.replaceChildren();
    const query = searchInput.value.trim().toLowerCase();
    const filter = filterInput.value;
    const sort = sortInput.value;

    let visible = tasks.filter(task => {
      const matchesQuery = `${task.title || ""} ${task.subject || ""}`.toLowerCase().includes(query);
      const matchesFilter =
        filter === "all" ||
        (filter === "completed" && task.completed) ||
        (filter === "pending" && !task.completed) ||
        (filter === "overdue" && isOverdue(task));
      return matchesQuery && matchesFilter;
    });

    visible.sort((a, b) => {
      if (sort === "deadline") return (a.deadline || "9999-12-31").localeCompare(b.deadline || "9999-12-31");
      if (sort === "priority") return (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1);
      if (sort === "alphabetical") return (a.title || "").localeCompare(b.title || "");
      return (Number(b.createdAt) || Number(b.id) || 0) - (Number(a.createdAt) || Number(a.id) || 0);
    });

    if (!visible.length) {
      addText(taskList, "div", tasks.length ? "No tasks match your search or filter." : "No study tasks yet. Add your first task above.", "empty-state");
    }

    visible.forEach(task => {
      const card = document.createElement("article");
      card.className = `task-card${task.completed ? " is-completed" : ""}`;

      const main = document.createElement("div");
      main.className = "task-main";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-check";
      checkbox.checked = Boolean(task.completed);
      checkbox.setAttribute("aria-label", `Mark ${task.title} as ${task.completed ? "pending" : "completed"}`);
      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        if (writeStorage(TASK_KEY, tasks)) {
          taskMessage.textContent = task.completed ? "Task marked as completed." : "Task marked as pending.";
          renderTasks();
        } else {
          task.completed = !checkbox.checked;
          taskMessage.textContent = "Could not save the change. Check browser storage.";
        }
      });

      const details = document.createElement("div");
      details.appendChild(Object.assign(document.createElement("h3"), { className: "task-title", textContent: task.title || "Untitled task" }));
      const meta = document.createElement("div");
      meta.className = "task-meta";
      addText(meta, "span", task.subject || "No subject", "");
      addText(meta, "span", `Priority: ${task.priority || "medium"}`, `badge ${task.priority || "medium"}`);
      if (task.deadline) {
        addText(meta, "span", `Due: ${task.deadline}`, "");
        if (isOverdue(task)) addText(meta, "span", "Overdue", "badge overdue");
      }
      if (task.completed) addText(meta, "span", "Completed", "badge");
      details.appendChild(meta);
      main.append(checkbox, details);

      const actions = document.createElement("div");
      actions.className = "task-actions";
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "button-small button-delete";
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        const previous = tasks;
        tasks = tasks.filter(item => item.id !== task.id);
        if (writeStorage(TASK_KEY, tasks)) {
          taskMessage.textContent = "Task deleted.";
          renderTasks();
        } else {
          tasks = previous;
          taskMessage.textContent = "Could not delete the task. Check browser storage.";
        }
      });
      actions.appendChild(deleteButton);
      card.append(main, actions);
      taskList.appendChild(card);
    });
    updateStats();
  }

  taskForm.addEventListener("submit", event => {
    event.preventDefault();
    const title = $("task-title").value.trim();
    const subject = $("task-subject").value.trim();
    const deadline = $("task-deadline").value;
    const priority = $("task-priority").value;
    if (!title || !subject) {
      taskMessage.textContent = "Please enter both a task title and subject.";
      return;
    }
    const task = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: Date.now(),
      title,
      subject,
      deadline,
      priority,
      completed: false
    };
    tasks.push(task);
    if (!writeStorage(TASK_KEY, tasks)) {
      tasks.pop();
      taskMessage.textContent = "Could not save the task. Check browser storage.";
      return;
    }
    taskForm.reset();
    $("task-priority").value = "medium";
    taskMessage.textContent = "Study task added.";
    renderTasks();
  });

  [searchInput, filterInput, sortInput].forEach(control => control.addEventListener("input", renderTasks));

  function formatTime(time) {
    const [hourString, minuteString] = time.split(":");
    const date = new Date();
    date.setHours(Number(hourString), Number(minuteString), 0, 0);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function durationMinutes(session) {
    const [sh, sm] = session.startTime.split(":").map(Number);
    const [eh, em] = session.endTime.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }

  function renderTimetable() {
    timetableContainer.replaceChildren();
    let totalMinutes = 0;

    days.forEach(day => {
      const daySection = document.createElement("section");
      daySection.className = "timetable-day";
      addText(daySection, "h3", day);
      const daySessions = sessions.filter(session => session.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      if (!daySessions.length) {
        addText(daySection, "p", "No study sessions planned.", "empty-day");
      } else {
        daySessions.forEach(session => {
          totalMinutes += Math.max(0, durationMinutes(session));
          const card = document.createElement("article");
          card.className = "study-session";
          const details = document.createElement("div");
          addText(details, "h4", session.subject || "Untitled session");
          addText(details, "p", `${formatTime(session.startTime)} – ${formatTime(session.endTime)}`, "session-time");
          if (session.description) addText(details, "p", session.description);
          const remove = document.createElement("button");
          remove.type = "button";
          remove.className = "button-small button-delete";
          remove.textContent = "Delete";
          remove.setAttribute("aria-label", `Delete ${session.subject} on ${session.day}`);
          remove.addEventListener("click", () => {
            const previous = sessions;
            sessions = sessions.filter(item => item.id !== session.id);
            if (writeStorage(SESSION_KEY, sessions)) {
              timetableMessage.textContent = "Study session deleted.";
              renderTimetable();
            } else {
              sessions = previous;
              timetableMessage.textContent = "Could not delete the session. Check browser storage.";
            }
          });
          card.append(details, remove);
          daySection.appendChild(card);
        });
      }
      timetableContainer.appendChild(daySection);
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    $("study-hours").textContent = `${hours}h ${minutes}m`;
  }

  timetableForm.addEventListener("submit", event => {
    event.preventDefault();
    const day = $("study-day").value;
    const subject = $("study-subject").value.trim();
    const startTime = $("study-start").value;
    const endTime = $("study-end").value;
    const description = $("study-description").value.trim();

    if (!day || !subject || !startTime || !endTime) {
      timetableMessage.textContent = "Please complete all required timetable fields.";
      return;
    }
    if (endTime <= startTime) {
      timetableMessage.textContent = "The end time must be later than the start time.";
      return;
    }
    const conflict = sessions.some(session =>
      session.day === day && startTime < session.endTime && endTime > session.startTime
    );
    if (conflict) {
      timetableMessage.textContent = "Schedule conflict: choose a time that does not overlap another session on this day.";
      return;
    }

    const session = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      day, subject, startTime, endTime, description
    };
    sessions.push(session);
    if (!writeStorage(SESSION_KEY, sessions)) {
      sessions.pop();
      timetableMessage.textContent = "Could not save the session. Check browser storage.";
      return;
    }
    timetableForm.reset();
    timetableMessage.textContent = `${subject} added to ${day}.`;
    renderTimetable();
  });

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const dark = theme === "dark";
    const button = $("theme-toggle");
    button.textContent = dark ? "☀️ Light mode" : "🌙 Dark mode";
    button.setAttribute("aria-pressed", String(dark));
  }
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme === "dark" ? "dark" : "light");
  $("theme-toggle").addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try { localStorage.setItem(THEME_KEY, nextTheme); } catch (error) { console.warn("Could not save theme.", error); }
  });

  renderTasks();
  renderTimetable();
})();
