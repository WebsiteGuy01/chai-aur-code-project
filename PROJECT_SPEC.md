# Project Specification: Terminal Todo CLI

## Core Goal
Create a robust, fast, and intuitive command-line interface for managing daily tasks directly in the terminal, focusing on local persistence and keyboard-driven efficiency.

## Architecture
A Go-based CLI tool leveraging a local JSON file for data storage, utilizing a layered approach: UI/CLI commands, a task management service layer, and a file-based data repository.

## Tasks
### Task 1
Implement the basic project structure and command-line parsing using `cobra` to allow adding and listing tasks.
