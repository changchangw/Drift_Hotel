// datavis.js

const chartConfigs = [
  {
    title: "Word cloud of public sentiment towards AI by UK Adults",
    chartType: 1,
    dataPath: "assets/chapter2/RTA_PADAI_Tracker_-_Q22_Wave_4_-_Word_frequency.csv",
    source: "Source: Public attitudes to data and AI: Tracker survey (Wave 4) report, 2024"
  },
  {
    title: "Public emotions toward AI by country",
    chartType: 2,
    dataPath: "assets/chapter2/fig_8.1.4.csv",
    source: "Source: Artificial Intelligence Index Report 2025"
  },
  {
    title: "Public perceptions of AI's potential to improve work",
    chartType: 2,
    dataPath: "assets/chapter2/fig_8.1.10_wide.csv",
    source: "Source: Artificial Intelligence Index Report 2025"
  },
  {
    title: "How each generation sees AI's impact on jobs, 2023 vs. 2024",
    chartType: 4,
    dataPath: "assets/chapter2/fig_8.1.8_cleaned.csv",
    source: "Source: Artificial Intelligence Index Report 2025"
  },
  {
    title: "How often do different occupations use GenAI tools?",
    chartType: 5,
    dataPath: "assets/chapter2/genai_usage_by_occupation.csv",
    source: "Source: ILO Working Paper – Generative AI and Jobs, 2024"
  },
  {
    title: "Which jobs are most exposed to AI?",
    chartType: 6,
    dataPath: "assets/chapter2/ai_exposure_scatter.csv",
    source: "Source: Generative AI and Jobs, 2025"
  },
  {
    title: "AI Exposure by Income Level and Gender",
    chartType: 7,
    dataPath: "assets/chapter2/fig_20_by_income.csv",
    source: "Source: Generative AI and Jobs, 2025"
  },
  {
    title: "AI Exposure by Skill Level",
    chartType: 8,
    dataPath: "", // 此图无需CSV数据，可设为""
    source: "Source: ILO Harmonized Microdata collection and Gmyrek et al. (2025) occupational AI exposure measure"
  },
  {
    title: "How humans and AI share the work?",
    chartType: 9,
    dataPath: "",
    source: "Source: Future of Work with AI Agents: Auditing Automation and Augmentation Potential across the U.S. Workforce, 2025"
  },
  {
    title: "The shifting human-machine frontier (2025–2030)",
    chartType: 10,
    dataPath: "",  // 无需加载外部数据
    source: "Source: Future of Jobs Report, 2025"
  },
  {
    title: "Automation Appetite by Occupation Field",
    chartType: 11,
    dataPath: "", // 本图数据是内置数组，无需文件
    source: "Source: Future of Work with AI Agents: Auditing Automation and Augmentation Potential across the U.S. Workforce, 2025"
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

  const config = chartConfigs[index];
  if (!config) return console.warn("No chart config found for index", index);

  const potentialTabs = document.getElementById("datavis-tabs");
  const genderTabs = document.getElementById("gender-tabs");

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
  popup.style.display = "block";
});

document.addEventListener("click", (e) => {
  const popup = document.getElementById("source-popup");
  if (!popup.contains(e.target) && e.target.id !== "source-icon") {
    popup.style.display = "none";
  }
});

document.getElementById("dialogue-box").addEventListener("click", hideDialogueBox);
