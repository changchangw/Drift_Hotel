const chartConfigs = [
  {
    title: "Word cloud of public sentiment towards AI",
    type: "wordcloud",
    dataPath: "assets/chapter2/wordcloud.csv",
    source: "Source: Public attitudes to data and AI: Tracker survey (Wave 4) report, 2024"
  },
  {
    title: "Another chart title here",
    type: "wordcloud",
    dataPath: "assets/chapter2/another_wordcloud.csv",
    source: "Source: Pew Research, 2022"
  }
  // 可继续添加更多图表
];

function initChart(index) {
  const config = chartConfigs[index];
  if (!config) return console.warn("No chart config found for index", index);

  if (config.type === "wordcloud") {
    initDataVis(config.title, config.dataPath);
  }

  // ✅ 控制箭头显示隐藏
  const leftArrow = document.querySelector('.arrow-left');
  const rightArrow = document.querySelector('.arrow-right');

  // 如果是第一个图表，隐藏左箭头；否则显示
  if (index === 0) {
    leftArrow.style.display = "none";
  } else {
    leftArrow.style.display = "block";
  }

  // 如果是最后一个图表，隐藏右箭头；否则显示
  if (index === chartConfigs.length - 1) {
    rightArrow.style.display = "none";
  } else {
    rightArrow.style.display = "block";
  }

  // ✅ 设置信息按钮对应的来源文本
  const sourceText = config.source || "No source available";
  document.getElementById("source-text").innerText = sourceText;
   
  // 未来支持柱状图等，可继续扩展
}

function initDataVis(titleText, csvPath) {
  const overlay = document.getElementById("fade-overlay");
  overlay.style.opacity = 1;

  let bgReady = false;
  let wordCloudReady = false;

  function tryToFadeOut() {
    if (bgReady && wordCloudReady) {
      const container = document.getElementById("datavis-container");
      container.style.display = "block";
      void container.offsetWidth;
      // container.style.transition = "opacity 0.3s ease";
      container.style.opacity = "1";

      setTimeout(() => {
        overlay.style.opacity = 0;
      }, 100);
    }
  }

  setTimeout(() => {
    document.getElementById('scene-container').style.display = 'none';

    const container = document.getElementById("datavis-container");
    container.style.display = "none";
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

      // ✅ 等背景图加载完后，标记 bgReady
      bg.onload = () => {
        bgReady = true;
        tryToFadeOut();
      };

      container.appendChild(bg);
    } else {
      // 如果背景图已经存在，立即标记为 ready
      bgReady = true;
    }

    // 设置标题
    const titleDiv = document.getElementById("datavis-title");
    titleDiv.innerText = titleText;

    const chartArea = d3.select("#datavis-chart-area");
    chartArea.html("");

    const width = 680, height = 428;

    d3.csv(csvPath).then(data => {
      data.forEach(d => d.estimated_frequency = +d.estimated_frequency);

      d3.layout.cloud()
        .size([width, height])
        .words(data.map(d => ({
          text: d.word,
          size: d.estimated_frequency / 4 + 10
        })))
        .padding(6)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .font("Impact")
        .fontSize(d => d.size)
        .on("end", draw)
        .start();

      function draw(words) {
        const svg = chartArea.append("svg")
          .attr("width", width)
          .attr("height", height);

        const g = svg.append("g")
          .attr("transform", `translate(${width / 2}, ${height / 2})`);

        g.selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", d => d.size + "px")
          .style("fill", "#150D04")
          .style("font-family", "Arial")
          .attr("text-anchor", "middle")
          .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
          .text(d => d.text);

        // ✅ 词云渲染完成
        wordCloudReady = true;
        tryToFadeOut();
      }
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

// 点击 info 图标显示来源弹窗
document.getElementById("source-icon").addEventListener("click", (e) => {
  e.stopPropagation(); // 防止冒泡
  const popup = document.getElementById("source-popup");
  popup.style.display = "block";
});

// 点击空白区域隐藏来源弹窗
document.addEventListener("click", (e) => {
  const popup = document.getElementById("source-popup");
  if (!popup.contains(e.target) && e.target.id !== "source-icon") {
    popup.style.display = "none";
  }
});
//initChart(0); // 进入数据章节时加载第一张图表