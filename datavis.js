// datavis.js

// Unified tooltip utility functions
function createTooltip() {
  return d3.select("body")
    .append("div")
    .attr("class", "tooltip");
}

function showTooltip(tooltip, event, content) {
  tooltip
    .style("display", "block")
    .html(content);
  positionTooltip(tooltip, event, 12, 20);
}

function hideTooltip(tooltip) {
  tooltip.style("display", "none");
}

// Unified tooltip position calculation function
function positionTooltip(tooltip, event, offsetX = 12, offsetY = 20) {
  tooltip
    .style("left", (event.pageX + offsetX) + "px")
    .style("top", (event.pageY + offsetY) + "px");
}

// Common style setting functions
function applyChartFont(element, size = 'medium') {
  const sizes = {
    'small': 'chart-font-small',
    'medium': 'chart-font-medium',
    'large': 'chart-font-large',
    'base': 'chart-font'
  };
  element.classed(sizes[size] || 'chart-font', true);
}

function applyAxisLabel(element, size = 'small') {
  const sizes = {
    'small': 'axis-label',
    'medium': 'axis-label-medium'
  };
  element.classed(sizes[size] || 'axis-label', true);
}

function applyLegendText(element, size = 'small') {
  const sizes = {
    'small': 'legend-text',
    'medium': 'legend-text-medium'
  };
  element.classed(sizes[size] || 'legend-text', true);
}

function applyInteractive(element) {
  element.classed('chart-interactive', true);
}

function applyTextWeight(element, weight = 'normal') {
  const weights = {
    'bold': 'chart-text-bold',
    'normal': 'chart-text-normal'
  };
  element.classed(weights[weight] || 'chart-text-normal', true);
}

const chartConfigs = [
  {
    title: "How UK Adults Feel About AI",
    chartType: 1,
    dataPath: "assets/chapter2/RTA_PADAI_Tracker_-_Q22_Wave_4_-_Word_frequency.csv",
    source: "Department for Science, Innovation & Technology (2024). Public attitudes to data and AI: Tracker survey (Wave 4) report. [online] GOV.UK."
  },
  {
    title: "Public emotions toward AI by country",
    chartType: 2,
    dataPath: "assets/chapter2/fig_8.1.4.csv",
    source: "Stanford University (2025). The 2025 AI Index Report | Stanford HAI. [online] Stanford.edu."
  },
  {
    title: "Public perceptions of AI's potential to improve work",
    chartType: 2,
    dataPath: "assets/chapter2/fig_8.1.10_wide.csv",
    source: "Stanford University (2025). The 2025 AI Index Report | Stanford HAI. [online] Stanford.edu."
  },
  {
    title: "Agreement that AI will change how jobs are done",
    chartType: 4,
    dataPath: "assets/chapter2/fig_8.1.8_cleaned.csv",
    source: "Stanford University (2025). The 2025 AI Index Report | Stanford HAI. [online] Stanford.edu."
  },
  {
    title: "How often do different occupations use GenAI tools?",
    chartType: 5,
    dataPath: "assets/chapter2/genai_usage_by_occupation.csv",
    source: "Gmyrek, et al. (2025). Generative AI and jobs. Geneva: ILO."
  },
  {
    title: "Which jobs are most exposed to AI?",
    chartType: 6,
    dataPath: "assets/chapter2/ai_exposure_scatter.csv",
    source: "Gmyrek, et al. (2025). Generative AI and jobs. Geneva: ILO."
  },
  {
    title: "AI Exposure by Income Level and Gender",
    chartType: 7,
    dataPath: "assets/chapter2/fig_20_by_income.csv",
    source: "Gmyrek, et al. (2025). Generative AI and jobs. Geneva: ILO."
  },
  {
    title: "Layers of Risk, Shades of Work",
    chartType: 8,
    dataPath: "", // This chart doesn't need CSV data, can be set to ""
    source: "International Labour Organization. (2025). World Employment and Social Outlook: May 2025 Update."
  },
  {
    title: "Balancing the Task: Human Agency in the Age of AI",
    chartType: 9,
    dataPath: "",
    source: "Shao, et al. (2025). Future of Work with AI Agents: Auditing Automation and Augmentation Potential across the U.S. Workforce."
  },
  {
    title: "H5 Tasks: What They Ask of Humans",
    chartType: 10,
    dataPath: "assets/chapter2/H5_task_characteristics.csv",
    source: "Shao, et al (2025). Future of Work with AI Agents: Auditing Automation and Augmentation Potential across the U.S. Workforce."
  },
  {
    title: "What Employers See as Core Skills for 2030",
    chartType: 11,
    dataPath: "assets/chapter2/core_skills_2030.csv",
    source: "World Economic Forum (2025). The future of jobs report 2025. [online] World Economic Forum."
  },
  {
    title: "The shifting human-machine frontier (2025–2030)",
    chartType: 12,
    dataPath: "",  // No need to load external data
    source: "World Economic Forum (2025). The future of jobs report 2025. [online] World Economic Forum."
  },
  {
    title: "Is Automation Always the Best Answer—for Every Field?",
    chartType: 13,
    dataPath: "", // This chart data is built-in array, no file needed
    source: "Shao, et al (2025). Future of Work with AI Agents: Auditing Automation and Augmentation Potential across the U.S. Workforce."
  },
  {
    title: "Should We Automate What Workers Don’t Want to Lose?",
    chartType: 14,
    dataPath: "assets/chapter2/desire_capability_four_categories.csv",
    source: "Shao, et al (2025). Future of Work with AI Agents: Auditing Automation and Augmentation Potential across the U.S. Workforce."
  }
  
];

function showDialogueBox() {
  const box = document.getElementById("dialogue-box");
  box.style.display = "block";
  void box.offsetWidth;
  box.style.opacity = "1";
}

function hideDialogueBox() {
  const box = document.getElementById("dialogue-box");
  box.style.opacity = "0";
  setTimeout(() => {
    box.style.display = "none";
  }, 400);
}

function showDialogueBoxById(id) {
  const box = document.getElementById(id);
  box.style.display = "block";
  void box.offsetWidth;
  box.style.opacity = "1";
}

function hideDialogueBoxById(id) {
  const box = document.getElementById(id);
  box.style.opacity = "0";
  setTimeout(() => {
    box.style.display = "none";
  }, 400);
}

// Universal dialogue display function
function showDialogueWithDelay(dialogueId, delayMs = 2000) {
  // Clear any existing timer first
  if (window.currentDialogueTimer) {
    clearTimeout(window.currentDialogueTimer);
  }
  
  window.currentDialogueTimer = setTimeout(() => {
    const box = document.getElementById(dialogueId);
    if (!box) return;
    
    box.style.display = "block";
    void box.offsetWidth; // Trigger reflow
    box.style.opacity = "1";
    
    // Add click screen to disappear event listener
    const hideOnClick = () => {
      hideDialogueBoxById(dialogueId);
      document.removeEventListener("click", hideOnClick);
    };
    document.addEventListener("click", hideOnClick);
  }, delayMs);
}

// Clear current dialogue timer
function clearDialogueTimer() {
  if (window.currentDialogueTimer) {
    clearTimeout(window.currentDialogueTimer);
    window.currentDialogueTimer = null;
  }
}

function renderPotentialWithKey(config, key) {
  const renderer = (titleText, dataPath, chartArea) => {
    return chartRenderers[3](dataPath, key);
  };
  initDataVis(config.title, config.dataPath, renderer);
}

function renderIncomeExposure(config, gender) {
  const renderer = (titleText, dataPath, chartArea) =>
    chartRenderers[7](titleText, dataPath, chartArea, gender);
  initDataVis(config.title, config.dataPath, renderer);
}

function initChart(index) {
  // ✅ Clear arts-description (if exists)
  d3.select("#arts-description").remove();
  
  // ✅ Clear previous dialogue timer
  clearDialogueTimer();

  const config = chartConfigs[index];
  if (!config) return console.warn("No chart config found for index", index);

  const potentialTabs = document.getElementById("datavis-tabs");
  const genderTabs = document.getElementById("gender-tabs");
  
  // ✅ Universal hide all tabs function
  function hideAllTabs() {
    document.getElementById("datavis-tabs").style.display = "none";
    document.getElementById("gender-tabs").style.display = "none";
    document.getElementById("agency-tabs").style.display = "none";
  }
  hideAllTabs(); // Hide all before each initChart

  // Chart 2 tab logic
  if (index === 2) {
    potentialTabs.style.display = "flex";
    genderTabs.style.display = "none";

    const tabs = potentialTabs.querySelectorAll(".datavis-tab");
    let currentKey = "Job market";

    tabs.forEach(t => t.classList.remove("active"));
    tabs[0].classList.add("active");

    renderPotentialWithKey(config, currentKey);

    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const selectedKey = tab.dataset.key;
        renderPotentialWithKey(config, selectedKey);
      };
    });
  }

  // Chart 7 tab logic
  else if (index === 6) {
    genderTabs.style.display = "flex";
    potentialTabs.style.display = "none";

    const tabs = genderTabs.querySelectorAll(".datavis-tab");
    let currentGender = "Total";

    tabs.forEach(t => t.classList.remove("active"));
    tabs[0].classList.add("active");

    // Initial rendering
    renderIncomeExposure(config, currentGender);

    tabs.forEach(tab => {
      tab.onclick = () => {
        const selected = tab.dataset.gender;
        if (selected === currentGender) return;
        currentGender = selected;

        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        // Directly call chart renderer to update data, instead of re-rendering entire chart
        const chartArea = d3.select("#datavis-chart-area");
        chartArea.html(""); // Clear existing content
        
        chartRenderers[7](config.title, config.dataPath, chartArea, currentGender);
      };
    });
  }
  // Chart 10: show agency-tabs for worker/expert switching
  else if (index === 9) {
    document.getElementById("agency-tabs").style.display = "flex";

    const renderer = chartRenderers[10];
    initDataVis(config.title, config.dataPath, renderer);
  }

  // Other charts have no tabs
  else {
    potentialTabs.style.display = "none";
    genderTabs.style.display = "none";

    const renderer = chartRenderers[config.chartType];
    if (!renderer) {
      console.warn("No renderer found for chart type", config.chartType);
      return;
    }

    initDataVis(config.title, config.dataPath, renderer);
  }

  // Arrow display control
  const leftArrow = document.querySelector('.arrow-left');
  const rightArrow = document.querySelector('.arrow-right');

  if (index === 0) {
    leftArrow.style.display = "none";
  } else {
    leftArrow.style.display = "block";
  }

  if (index === chartConfigs.length - 1) {
    rightArrow.style.display = "none";
  } else {
    rightArrow.style.display = "block";
  }

  // Source description
  const sourceText = config.source || "No source available";
  document.getElementById("source-text").innerText = sourceText;
}

function initDataVis(titleText, dataPath, renderer) {
  const overlay = document.getElementById("fade-overlay");
  overlay.style.opacity = 1;

  let bgReady = false;
  let chartReady = false;

  function tryToFadeOut() {
    if (bgReady && chartReady) {
      const container = document.getElementById("datavis-container");
      container.style.display = "block";
      void container.offsetWidth;
      container.style.opacity = "1";

      // Show music button
      const musicControlDatavis = document.getElementById('music-control-datavis');
      musicControlDatavis.style.display = 'block';
      
      // Ensure switch to chapter 2 music
      if (window.switchToChapter2Music && !window.isChapter2Music()) {
        window.switchToChapter2Music();
      }

      setTimeout(() => {
        overlay.style.opacity = 0;
      }, 100);
    }
  }

  setTimeout(() => {
    document.getElementById('scene-container').style.display = 'none';

    const container = document.getElementById("datavis-container");
    container.style.opacity = "0";

    if (!document.getElementById("datavis-bg")) {
      const bg = document.createElement("img");
      bg.id = "datavis-bg";
      bg.src = "assets/chapter2/bg.png";
      bg.alt = "bg";
      Object.assign(bg.style, {
        position: "absolute", top: "0", left: "0", width: "100%", height: "100%",
        objectFit: "cover", zIndex: "0"
      });

      bg.onload = () => {
        bgReady = true;
        tryToFadeOut();
      };

      container.appendChild(bg);
    } else {
      bgReady = true;
    }

    document.getElementById("datavis-title").innerText = titleText;

    const chartArea = d3.select("#datavis-chart-area");
    chartArea.html("");

    renderer(titleText, dataPath, chartArea).then(() => {
      chartReady = true;
      tryToFadeOut();
    });
  }, 10);
}

let currentChartIndex = 0;

document.querySelector('.arrow-left').addEventListener('click', () => {
  currentChartIndex = (currentChartIndex - 1 + chartConfigs.length) % chartConfigs.length;
  initChart(currentChartIndex);
});

document.querySelector('.arrow-right').addEventListener('click', () => {
  currentChartIndex = (currentChartIndex + 1) % chartConfigs.length;
  initChart(currentChartIndex);
});

document.getElementById("source-icon").addEventListener("click", (e) => {
  e.stopPropagation();
  const popup = document.getElementById("source-popup");
  // Toggle display state: if currently shown then hide, if currently hidden then show
  if (popup.style.display === "block") {
    popup.style.display = "none";
  } else {
    popup.style.display = "block";
  }
});

document.addEventListener("click", (e) => {
  const popup = document.getElementById("source-popup");
  if (!popup.contains(e.target) && e.target.id !== "source-icon") {
    popup.style.display = "none";
  }
  
  // If dialogue5 is showing, click anywhere on screen to make it disappear and enter next chapter
  const dialogueBox5 = document.getElementById('dialogue-box5');
  if (dialogueBox5 && dialogueBox5.style.display === 'block') {
    hideDialogueBoxById("dialogue-box5");
    // Wait for dialogue5 disappearance animation to complete before entering next chapter
    setTimeout(() => {
      window.startChapter3();
    }, 400);
  }
});

document.getElementById("dialogue-box").addEventListener("click", hideDialogueBox);
