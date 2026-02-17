# Math Shooting Game Blueprint

## 1. Overview

A fun and educational shooting game for 1st and 2nd graders. The player controls an airplane, shoots at enemies, and defeats bosses by solving math problems.

## 2. Core Gameplay

*   **Player:** Controls an airplane that can move left and right and shoot bullets.
*   **Enemies:** Basic enemy planes that appear and move down the screen. The player can shoot them down for points.
*   **Bosses:** Three bosses appear one by one. To defeat a boss, the player must solve a math problem.
*   **Math Problems:** Simple addition and subtraction problems suitable for 1st and 2nd graders.

## 3. Visual Design

*   **Theme:** A vibrant and colorful cartoon style to appeal to young children.
*   **Player:** A friendly-looking airplane.
*   **Enemies:** Simple, non-threatening enemy planes.
*   **Bosses:** Larger, more detailed boss characters with expressive faces.
*   **UI:** Clean and easy-to-read fonts for math problems and game information (score, lives).

## 4. Game Flow

1.  **Start Screen:** A simple start screen with a "Start Game" button.
2.  **Gameplay Loop:**
    *   The player controls the airplane and shoots at incoming enemies.
    *   After a certain score or time, the first boss appears.
3.  **Boss Battle:**
    *   The boss presents a math problem.
    *   The game pauses, and the player needs to input the correct answer.
    *   If the answer is correct, the boss's HP decreases, and the game resumes.
    *   If the answer is incorrect, the player might lose a life or the boss attacks.
    *   This repeats until the boss's HP is zero.
4.  **Next Stage:** After defeating a boss, the game continues with more enemies, leading to the next boss.
5.  **Game Over:** The game ends when the player loses all their lives. A "Game Over" screen with the final score is shown.
6.  **Win Screen:** After defeating all three bosses, a "You Win!" screen is displayed.

## 5. Technical Implementation

*   **HTML:** A single `index.html` file with a `<canvas>` element for the game and UI elements for the math problems.
*   **CSS:** `style.css` for styling the game and UI.
*   **JavaScript:** `main.js` for all the game logic, including:
    *   Game loop
    *   Player and enemy movement/shooting
    *   Collision detection
    *   Boss mechanics
    *   Math problem generation and validation

## 6. Features for Current Request

*   **Phase 1: Basic Game Setup**
    *   Create the HTML structure with a canvas.
    *   Style the game with a basic background.
    *   Implement the player's airplane and its movement.
*   **Phase 2: Shooting and Enemies**
    *   Implement player shooting.
    *   Create basic enemies that move down the screen.
    *   Implement collision detection between bullets and enemies.
*   **Phase 3: Boss Battles & Math Problems**
    *   Create three unique bosses.
    *   Implement the logic for boss appearance.
    *   Create the UI for displaying math problems and receiving input.
    *   Integrate the math problem logic with the boss battle.
*   **Phase 4: Game State & UI**
    *   Implement game states (start, playing, game over).
    *   Add UI for score, lives, and boss HP.
    *   Polish the visual design and add sound effects (optional).
