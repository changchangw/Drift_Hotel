# Drift Hotel  
**Narrative-Driven Data Visualisation: Exploring the Employment and Societal Impact of AI**

## 1. Overview
**Drift Hotel** is an interactive, narrative-driven web application that merges exploratory storytelling with data visualisation.  
Across three chapters, players uncover AI’s societal and employment impacts by navigating illustrated scenes, solving light puzzles, and engaging with immersive, chapter-specific data panels.  

Inspired by the atmospheric style of *Rusty Lake* games, the project combines emotional narrative with factual insights to create an engaging, reflective experience.

---

## 2. Key Features
- **Chapter-based Structure** – Three acts:  
  1. *Memory* – Character-driven interactive storytelling.  
  2. *Facts* – Data visualisations presenting AI-related research.  
  3. *Epilogue* – Reflective epilogue connecting past, present, and future.  
- **Immersive Visual Design** – Fixed 1280×720px stage for theatre-like presentation.  
- **Game-like Interaction** – Clickable hotspots, environmental storytelling, and puzzle elements.  
- **Seamless Transitions** – Smooth fade effects between narrative scenes and visualisation panels.  
- **Custom Data Visualisations** – D3.js-based charts, including word clouds, sentiment maps, scatter plots, grouped bar charts, and experimental layouts.  
- **Thematic Background Music** – Optional ambient soundtrack with toggle controls.

---

## 3. Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6)  
- **Data Visualisation:** D3.js (v7)  
- **Structure:** Single-page application (SPA) with scene management and state persistence  
- **Version Control:** GitHub  
- **Data Format:** CSV files

---

## 4. Project Structure
DriftHotel/
│
├── index.html # Main entry point
├── styles.css # Global styles
├── script.js # Chapter 1 & 3: Narrative logic
├── datavis.js # Chapter 2: Data visualisations
├── emotion_charts.js # Chart[1–4]
├── ai_exposure.js # Chart[5–8]
├── human_ai_relation.js # Chart[9–14]
├── assets/ # Images, audio, data
│ ├── chapter1/
│ ├── chapter2/
│ ├── chapter3/
│ ├── icon/
│ └── audio/
├── README.md

---

## 5. Running the Project
1. The application can be accessed using the following link: 
https://cw333.teaching.cs.st-andrews.ac.uk/
2. Open index.html directly in a modern browser (Chrome, Firefox, Edge).
No build process required.

---

## 6. Data Sources
Primary Data:
- Artificial Intelligence Index Report 2025
- Public Attitudes to Data and AI: Tracker Survey (Wave 4)
- Generative AI and jobs. Geneva: ILO
- World Employment and Social Outlook: May 2025 Update
- Future of Work with AI Agents: Auditing Automation and Augmentation Potential across the U.S. Workforce
- The future of jobs report 2025. [online] World Economic Forum