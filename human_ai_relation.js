// human_ai_relation.js

if (!window.chartRenderers) {
  window.chartRenderers = {};
}

// 通用对话框显示/隐藏函数
function showDialogueBoxById(id) {
  const box = document.getElementById(id);
  if (!box) return;
  box.style.display = "block";
  void box.offsetWidth;
  box.style.opacity = "1";
}
function hideDialogueBoxById(id) {
  const box = document.getElementById(id);
  if (!box) return;
  box.style.opacity = "0";
  setTimeout(() => {
    box.style.display = "none";
  }, 400);
}

chartRenderers[9] = function(titleText, dataPath, chartArea) {
  const width = 1280;
  const height = 720;

  return new Promise(resolve => {
    const svg = chartArea.append("svg")
      .attr("width", width)
      .attr("height", height);

    // 主图展示（中间HAS图）
    svg.append("image")
      .attr("href", "assets/chapter2/HAS.png")
      .attr("x", 26)
      .attr("y", 150)
      .attr("width", 669)
      .attr("height", 409);

    // 附图展示（HAS_image.png）
    svg.append("image")
    .attr("href", "assets/chapter2/HAS_image.png")
    .attr("x", 46)
    .attr("y", 240)
    .attr("width", 636)
    .attr("height", 81);

    // 添加问号图标
    const iconX = 530;
    const iconY = 152;
    const iconSize = 24;

    svg.append("image")
      .attr("href", "assets/icons/wenhao.png")
      .attr("x", iconX)
      .attr("y", iconY)
      .attr("width", iconSize)
      .attr("height", iconSize)
      .attr("id", "has-tooltip-icon")
      .style("cursor", "pointer");

    // tooltip div 设置
    const tooltip = d3.select("body")
      .append("div")
      .attr("id", "has-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(20,20,20,0.85)")
      .style("color", "#fff")
      .style("padding", "10px 14px")
      .style("border-radius", "8px")
      .style("font-family", "Courier New")
      .style("font-size", "14px")
      .style("line-height", "1.4")
      .style("max-width", "260px")
      .style("display", "none")
      .style("pointer-events", "none")
      .style("z-index", "9999")
      .text("A five-level framework that measures how much human involvement is needed in completing a task with AI.");

    // 绑定悬浮事件
    d3.select("#has-tooltip-icon")
      .on("mouseover", function(event) {
        tooltip.style("display", "block");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 14) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        tooltip.style("display", "none");
      });

    resolve();
  });
};

chartRenderers[10] = function(titleText, dataPath, chartArea) {
  let hasShownDialogue4 = false;

  function showChart10DialogueImage() {
    if (!hasShownDialogue4) {
      showDialogueBoxById("dialogue-box4");
      hasShownDialogue4 = true;
      document.addEventListener("click", () => hideDialogueBoxById("dialogue-box4"), { once: true });
    }
  }

  return new Promise(resolve => {
    const data = [
      { time: "Now", People: 47, Combination: 30, Technology: 22 },
      { time: "By 2030", People: 33, Combination: 33, Technology: 34 }
    ];

    const width = 720;
    const height = 428;
    const margin = { top: 80, right: 40, bottom: 60, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const categories = ["People", "Combination", "Technology"];
    const colors = {
      People: "#374160",      // 深蓝色
      Combination: "#2C789F",  // 蓝色
      Technology: "#5EB6D1"    // 浅蓝色
    };

    const stack = d3.stack().keys(categories);
    const stackedData = stack(data);

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.time))
      .range([0, innerWidth])
      .padding(0.4); // 柱子更细

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    const svg = chartArea.append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw axes
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d + "%"))
      .selectAll("text")
      .style("font-size", "14px")
      .style("font-family", "Courier New");

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "14px")
      .style("font-family", "Courier New");

    // Draw bars
    g.selectAll(".layer")
      .data(stackedData)
      .enter().append("g")
      .attr("fill", d => colors[d.key])
      .selectAll("rect")
      .data(d => d)
      .enter().append("rect")
      .attr("class", "stacked-bar")
      .attr("x", d => xScale(d.data.time))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .on("mouseover", function(event, d) {
        showChart10DialogueImage();
      })

    // Draw labels
    g.selectAll(".label")
      .data(stackedData.flatMap(layer => layer.map(d => ({
        key: layer.key,
        x: xScale(d.data.time),
        y: (yScale(d[0]) + yScale(d[1])) / 2,
        value: d.data[layer.key]
      }))))
      .enter()
      .append("text")
      .attr("class", "stacked-label")
      .attr("x", d => d.x + xScale.bandwidth() / 2)
      .attr("y", d => d.y)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "14px")
      .attr("font-family", "Courier New")
      .text(d => `${d.value}%`);

    // Draw legend - 统一间距
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 400}, 20)`);

    const legendItems = categories;

    // 创建图例组，统一间距
    legend.selectAll("legend-group")
      .data(legendItems)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${i * 130}, 0)`) // 统一间距100px
      .each(function(d) {
        const group = d3.select(this);
        
        // 色块
        group.append("rect")
          .attr("class", "legend-rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 14)
          .attr("height", 14)
          .attr("fill", colors[d]);
        
        // 标签
        group.append("text")
          .attr("class", "legend-text")
          .attr("x", 20)
          .attr("y", 12)
          .text(d)
          .attr("font-size", "14px")
          .attr("fill", "#333")
          .attr("font-family", "Courier New");
      });

    // 添加y轴标签 - 靠近数值轴
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2 + 10) // 调整位置，更靠近数值轴
      .attr("y", 40) // 调整位置
      .attr("text-anchor", "middle")
      .text("Share of tasks (%)")
      .style("font-size", "14px")
      .style("font-family", "Courier New")
      .style("fill", "#333");

    resolve();
  });
};

chartRenderers[11] = function(titleText, dataPath, chartArea) {
  return new Promise(resolve => {
    const width = 720;
    const height = 400;
    const margin = { top: 210, right: 40, bottom: 50, left: 180 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const data = [
      { field: "Arts, Design & Media", value: 17.1 },
      { field: "Finance & Business", value: 48.8 },
      { field: "Management", value: 51.1 },
      { field: "Computer & Math", value: 53.8 }
    ];

    const svg = chartArea.append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand()
      .domain(data.map(d => d.field))
      .range([0, innerHeight])
      .padding(0.4); // 更窄的条形图（原来是0.25）

    const x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    const color = d => d.field.includes("Arts") ? "#c2765a" : "#3b4b68";

    g.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("y", d => y(d.field))
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.value))
      .attr("fill", d => color(d));

    // 左轴（领域名）
    g.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-family", "'Courier New', monospace")
      .style("font-size", "12px");

    // 底部轴（数值刻度）
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"))
      .selectAll("text")
      .style("font-family", "'Courier New', monospace")
      .style("font-size", "12px");

    // 添加 x轴标题
    svg.append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", margin.top + innerHeight + 50)
      .attr("text-anchor", "middle")
      .style("font-family", "'Courier New', monospace")
      .style("font-size", "12px")
      .text("Automation desire (%)");

    // 数值标签
    g.selectAll("text.value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", d => x(d.value) + 6)
      .attr("y", d => y(d.field) + y.bandwidth() / 2 + 4)
      .text(d => `${d.value}%`)
      .style("font-family", "'Courier New', monospace")
      .style("font-size", "12px");

    d3.select("#arts-description").remove(); // ✅ 先移除旧的

    // ✅ 添加下方解释文字（上下结构）
    d3.select("#datavis-container")
      .append("div")
      .attr("id", "arts-description")
      .style("margin-top", "180px")
      .style("margin-left", "204px")
      .style("max-width", "600px")
      .style("font-family", "'Amatica SC', cursive")
      .style("font-size", "18px")
      .style("line-height", "1.5")
      .style("text-align", "left")
      .style("color", "#1e1e1e")
      .html(`
        <b>Arts, Design & Media don’t want automation.</b><br><br>
        🎨 “I want it to make things less tedious… but no content creation.”<br>
        🖌️ “I would never use AI to replace artists.”<br>
        🧠 “AI can support my research, but I create my design by myself.”<br><br>
      `)      

    resolve();
  });
};


