# Getting Started Guide — Will's Agent Setup

## The Big Picture

You have an AI coding partner that lives in Telegram. You tell it what to build, it writes the code, you review it and steer it. Think of it like pair programming where your partner types really fast and never gets tired.

Your first project: **PIM Lending Mortgage Statement Generator** — an app that automatically creates and emails monthly mortgage statements for your dad's lending business.

---

## Your Toolkit

| Tool | What It Does |
|------|-------------|
| **Telegram** | Where you talk to your agent |
| **VS Code** | View and edit code on your Mac Mini (optional but helpful) |
| **Terminal** | Run the app locally, git commands |
| **Browser** | See the app running at localhost |
| **GitHub** | Where all the code lives |

---

## Day 1: First Conversation

Once your agent is set up and has GitHub access, send this as your first message:

> Read the project spec and all comments at https://github.com/team-elmwood/pim-lending/issues/1 — then give me a summary of what we're building and propose a plan for how to tackle it. Break it into small steps.

Your agent will come back with a plan. Read it. Ask questions. Push back if something doesn't make sense. Then when you're ready:

> Let's start with step 1. Clone the repo and set up the project.

---

## How to Talk to Your Agent

You don't need to know code to direct it. Just describe what you want in plain English.

### Starting a feature
> "Create the database schema for loans. Each loan needs: loan number, borrower name, borrower address, borrower email, property address, principal balance, interest rate, maturity date, monthly payment amount, reserve balance, statement date, and payment due date."

### Fixing something
> "The payment amounts are showing as cents instead of dollars. Fix the formatting."

### When you hit an error
> "I'm getting this error when I run the app: [paste the error]. Fix it."

### When something looks wrong
> "The PDF statement is missing the property address. Look at the original Excel files in data/excel-originals for reference."

### Asking it to explain
> "Why did you use SQLite instead of Postgres? Explain the tradeoff."

### Saving progress
> "This looks good. Commit what we have, push to a branch called 'feature/loan-dashboard', and open a PR."

---

## Running the App Locally

Your agent will set this up for you, but here's what to expect:

```bash
# Navigate to the project
cd ~/pim-lending

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev

# Open in browser
# Go to http://localhost:3000
```

When the dev server is running, every code change shows up automatically in your browser. This is your feedback loop — agent writes code, you refresh the browser, you see the result.

---

## Git Basics (The Important Ones)

Your agent handles most git stuff, but these are good to know:

```bash
# See what's changed
git status

# Pull latest code
git pull

# See all branches
git branch -a

# Switch to a branch
git checkout branch-name
```

If git ever gets confusing, just tell your agent: "Git is messed up, fix it."

---

## The Workflow Loop

```
1. Tell your agent what to build
        ↓
2. Agent writes code + pushes to GitHub
        ↓
3. You check it (browser, VS Code, or just ask the agent to describe it)
        ↓
4. Give feedback: "change X, fix Y, add Z"
        ↓
5. Repeat until it's right
        ↓
6. Agent opens a PR → Dad or Fred reviews → merge
        ↓
7. Move to next feature
```

---

## Pro Tips

1. **Be specific.** "Make it look better" → bad. "Add spacing between the rows, make the headers bold, and use a blue color scheme" → good.

2. **Start small.** Don't try to build everything at once. Get the loan list page working first. Then add payment tracking. Then PDF generation. Then email.

3. **Test as you go.** After every feature, actually click around the app. Try weird inputs. What happens if you enter a negative payment? What if a field is empty?

4. **Copy-paste errors.** When something breaks, copy the full error message and paste it to your agent. It can usually fix it immediately.

5. **Ask "why."** When your agent makes a decision you don't understand, ask why. You'll learn a ton just from the explanations.

6. **Save your progress often.** Tell your agent to commit and push at natural stopping points. Don't go hours without saving.

7. **It's okay to start over on a feature.** If something gets too messy, tell your agent: "This approach isn't working. Let's scrap the [feature] and try a different way." AI is fast — rewriting is cheap.

---

## Your First Project: Suggested Order

### Week 1: Foundation
- [ ] Set up Next.js project
- [ ] Create the database (loans + payments tables)
- [ ] Import the 6 Excel files
- [ ] Build a simple dashboard that lists all loans

### Week 2: Core Features
- [ ] Loan detail page (click a loan → see all its info + payment history)
- [ ] Record a payment form
- [ ] Auto-calculate next due date and balance

### Week 3: PDF + Email
- [ ] Generate a PDF mortgage statement
- [ ] Match the look of the current Excel statements
- [ ] Email sending with PDF attachment

### Week 4: Polish + Automation
- [ ] Monthly trigger (20th of each month)
- [ ] Review/approve screen before sending
- [ ] Dashboard showing paid/unpaid status per borrower

---

## Getting Help

- **Stuck on something?** Ask your agent first. If it can't figure it out, ask your dad.
- **Want a code review?** Open a PR on GitHub. Fred (your dad's agent) can review it.
- **Want to learn more?** Tell your agent: "Explain how [databases/APIs/React/whatever] work. Keep it simple."

---

## Remember

You're not "learning to code" in the traditional sense. You're learning to **direct an AI to build software**. That's a different (and arguably more valuable) skill. The code is a means to an end — the end is a working app that solves a real business problem.

Have fun with it. Break things. Fix them. Ship it. 🚀
