// datavis.js

// 统一的tooltip工具函数
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

// 统一的tooltip位置计算函数
function positionTooltip(tooltip, event, offsetX = 12, offsetY = 20) {
  tooltip
    .style("left", (event.pageX + offsetX) + "px")
    .style("top", (event.pageY + offsetY) + "px");
}

// 通用样式设置函数
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
    dataPath: "", // 此图无需CSV数据，可设为""
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
    title: "Core skills in 2030",
    chartType: 11,
    dataPath: "assets/chapter2/core_skills_2030.csv",
    source: "World Economic Forum (2025). The future of jobs report 2025. [online] World Economic Forum."
  },
  {
    title: "The shifting human-machine frontier (2025–2030)",
    chartType: 12,
    dataPath: "",  // 无需加载外部数据
    source: "World Economic Forum (2025). The future of jobs report 2025. [online] World Economic Forum."
  },
  {
    title: "Automation Appetite by Occupation Field",
    chartType: 13,
    dataPath: "", // 本图数据是内置数组，无需文件
    source: "Shao, et al (2025). Future of Work with AI Agents: Auditing Automation and Augmentation Potential across the U.S. Workforce."
  },
  {
    title: "Automation Desire-Capability Landscape",
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

// 通用dialogue显示函数
function showDialogueWithDelay(dialogueId, delayMs = 2000) {
  // 先清除之前可能存在的定时器
  if (window.currentDialogueTimer) {
    clearTimeout(window.currentDialogueTimer);
  }
  
  window.currentDialogueTimer = setTimeout(() => {
    const box = document.getElementById(dialogueId);
    if (!box) return;
    
    box.style.display = "block";
    void box.offsetWidth; // 触发重排
    box.style.opacity = "1";
    
    // 添加点击屏幕消失的事件监听
    const hideOnClick = () => {
      hideDialogueBoxById(dialogueId);
      document.removeEventListener("click", hideOnClick);
    };
    document.addEventListener("click", hideOnClick);
  }, delayMs);
}

// 清除当前dialogue定时器
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
  // ✅ 清除 arts-description（如果有）
  d3.select("#arts-description").remove();
  
  // ✅ 清除之前的dialogue定时器
  clearDialogueTimer();

  const config = chartConfigs[index];
  if (!config) return console.warn("No chart config found for index", index);

  const potentialTabs = document.getElementById("datavis-tabs");
  const genderTabs = document.getElementById("gender-tabs");
  
  // ✅ 通用隐藏所有 tab 函数
  function hideAllTabs() {
    document.getElementById("datavis-tabs").style.display = "none";
    document.getElementById("gender-tabs").style.display = "none";
    document.getElementById("agency-tabs").style.display = "none";
  }
  hideAllTabs(); // 每次 initChart 前先全部隐藏

  // chart 2 tab逻辑
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

  // chart 7 tab逻辑
  else if (index === 6) {
    genderTabs.style.display = "flex";
    potentialTabs.style.display = "none";

    const tabs = genderTabs.querySelectorAll(".datavis-tab");
    let currentGender = "Total";

    tabs.forEach(t => t.classList.remove("active"));
    tabs[0].classList.add("active");

    // 初始渲染
    renderIncomeExposure(config, currentGender);

    tabs.forEach(tab => {
      tab.onclick = () => {
        const selected = tab.dataset.gender;
        if (selected === currentGender) return;
        currentGender = selected;

        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        // 直接调用图表渲染器更新数据，而不是重新渲染整个图表
        const chartArea = d3.select("#datavis-chart-area");
        chartArea.html(""); // 清空现有内容
        
        chartRenderers[7](config.title, config.dataPath, chartArea, currentGender);
      };
    });
  }
  // chart 10: 显示 agency-tabs 切换 worker/expert
  else if (index === 9) {
    document.getElementById("agency-tabs").style.display = "flex";

    const renderer = chartRenderers[10];
    initDataVis(config.title, config.dataPath, renderer);
  }

  // 其他图表无 tab
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

  // 箭头显示控制
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

  // 来源说明
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

      // 显示音乐按钮
      const musicControlDatavis = document.getElementById('music-control-datavis');
      musicControlDatavis.style.display = 'block';
      
      // 确保切换到第二章音乐
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
  // 切换显示状态：如果当前显示则隐藏，如果当前隐藏则显示
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
  
  // 如果dialogue5正在显示，点击屏幕任意地方使其消失
  const dialogueBox5 = document.getElementById('dialogue-box5');
  if (dialogueBox5 && dialogueBox5.style.display === 'block') {
    // 检查点击的不是dialogue5本身
    if (!dialogueBox5.contains(e.target)) {
      hideDialogueBoxById("dialogue-box5");
    }
  }
});

document.getElementById("dialogue-box").addEventListener("click", hideDialogueBox);
