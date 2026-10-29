# Student Study Planner

## Project overview
Student Study Planner is a browser-based web app that helps students organize tasks, manage deadlines, and plan a weekly study timetable.

## Features
- Add tasks with a title, subject, optional deadline, and priority.
- Mark tasks complete or pending.
- Delete tasks.
- Search tasks by title or subject.
- Filter tasks by all, pending, completed, or overdue.
- Sort tasks by newest, deadline, priority, or title.
- Dashboard counts for total, completed, pending, and overdue tasks.
- Add weekly study sessions with a day, subject, start/end time, and optional description.
- Prevent overlapping study sessions on the same day.
- View the total planned study time for the week.
- Light and dark themes.
- Automatically save tasks, timetable sessions, and theme in browser Local Storage.
- Responsive layout for desktop and mobile screens.

## Technologies
- HTML5
- CSS3
- Vanilla JavaScript
- Browser Local Storage

No login system, online database, backend server, or external API is required.

## How to run
1. Extract the ZIP file.
2. Open the extracted `student-study-planner-submission` folder in Visual Studio Code.
3. Open `public/index.html` in a browser, or use the Live Server extension in VS Code.
4. Add a task or timetable session to try the app.

The website can also be opened by double-clicking `public/index.html`.

## Storage notes
Tasks and timetable sessions are saved locally in the browser. They are not synced between browsers or devices. Clearing browser site data can remove saved information.

## Suggested testing checklist
- Add a task with a subject, deadline, and priority.
- Mark a task completed and then pending again.
- Search, filter, and sort tasks.
- Delete a task.
- Refresh the page and confirm data remains.
- Add a study session and confirm it appears on the selected day.
- Attempt to add an overlapping session on the same day and confirm it is rejected.
- Add a session on another day at the same time and confirm it is allowed.
- Delete a study session.
- Confirm weekly study time updates.
- Toggle the theme and refresh the page.

## Project structure
```text
student-study-planner-submission/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md
```
