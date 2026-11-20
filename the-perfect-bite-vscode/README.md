# The Perfect Bite — Website

A lightweight, responsive restaurant menu and WhatsApp ordering website.

## Features

- Responsive menu for desktop and mobile
- Menu search and category filters
- Shopping cart with quantity controls and subtotal calculation
- Pizza customisation modal with optional extras:
  - Extra cheese: ₹20
  - Olives: ₹20
  - Fries: ₹30
  - Soft drink: shown as price pending confirmation; not selectable or charged
- WhatsApp order handoff to `+91 78295 15859`

> WhatsApp checkout sends an order request, not an automatically confirmed order. The restaurant must confirm availability, pickup/delivery, charges, final amount and timing.

## Open in Visual Studio Code

1. Extract this project folder.
2. Open VS Code.
3. Select **File → Open Folder…** and choose `the-perfect-bite-vscode`.
4. Open `index.html` in a browser. Recommended: install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.

No build step or npm dependencies are required for the current static version.

## Deploy to Netlify

1. Push this project to your Git repository (GitHub, GitLab or Bitbucket).
2. In Netlify, choose **Add new project → Import an existing project**.
3. Connect the repository.
4. Set the build command to blank and publish directory to `.` (the repository root).
5. Deploy.

You can also use Netlify's manual deploy by dragging the project folder into the deploy area.

## Suggested Git commands

Run these commands in the VS Code terminal from this folder:

```bash
git init
git add .
git commit -m "Initial The Perfect Bite website"
```

Then create an empty repository on GitHub and follow GitHub's instructions to add the remote and push the `main` branch.

## Project structure

```text
the-perfect-bite-vscode/
├── .vscode/
│   └── extensions.json
├── index.html
├── styles.css
├── app.js
├── netlify.toml
├── .gitignore
└── README.md
```

## Before publishing

- Verify every menu item and price against the latest menu.
- Confirm delivery area, delivery charges and pickup process.
- Confirm the soft drink add-on price before making it selectable.
- Replace illustrative food graphics with approved restaurant photographs if desired.
- Add/verify the restaurant's Zomato and Swiggy links.
