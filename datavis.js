const chartConfigs = [
  {
    title: "Word cloud of public sentiment towards AI by UK Adults",
    chartType: 1,
    dataPath: "assets/chapter2/wordcloud.csv",
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
  }
  // 可继续添加更多图表
];

function renderPotentialWithKey(config, key) {
  const renderer = (titleText, dataPath, chartArea) => {
    return chartRenderers[3](dataPath, key);
  };
  initDataVis(config.title, config.dataPath, renderer);
}

function initChart(index) {
  const config = chartConfigs[index];
  if (!config) return console.warn("No chart config found for index", index);

  const potentialTabs = document.getElementById("potential-tabs");

  if (index === 2) {
    potentialTabs.style.display = "flex";
    const tabs = potentialTabs.querySelectorAll(".potential-tab");
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
  } else {
    potentialTabs.style.display = "none";

    const renderer = chartRenderers[config.chartType];
    if (!renderer) {
      console.warn("No renderer found for chart type", config.chartType);
      return;
    }

    initDataVis(config.title, config.dataPath, renderer);
  }

  // ✅ ✅ ✅ 这部分是必须执行的，无论哪种图表
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

  // ✅ 来源说明
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
