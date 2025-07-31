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
  return new Promise(resolve => {
    d3.csv(dataPath).then(data => {
      const categories = [
        "Interpersonal Communication",
        "Domain Expertise",
        "Physical Action",
        "Uncertainty"
      ];
      const width = 800;
      const height = 480;
      const radius = Math.min(width, height) / 2 - 100;
      const colorMap = ["#003366", "#8B0000"];
      const font = "Courier New";
      const taskTypes = ["All Tasks", "H5 Tasks"];
      const legendKeys = ["All", "H5"];
      const sourceTabs = ["Worker", "Expert"];
      let currentSource = "Worker";
      const highlightOpacity = 1;
      const dimOpacity = 0.18;

      const tabContainer = d3.select("#agency-tabs").style("display", "flex");
      tabContainer.html("");
      sourceTabs.forEach(source => {
        const btn = tabContainer.append("button")
          .attr("class", "datavis-tab" + (source === currentSource ? " active" : ""))
          .attr("data-source", source)
          .text(source)
          .on("click", function () {
            currentSource = source;
            render();
            tabContainer.selectAll("button")
              .classed("active", function() {
                return d3.select(this).attr("data-source") === currentSource;
              });
          });
      });

      function render() {
        chartArea.selectAll("*").remove();
        const svg = chartArea.append("svg")
          .attr("width", width)
          .attr("height", height);
        const g = svg.append("g")
          .attr("transform", `translate(${width / 2 - 50},${height / 2 -20})`);
        const angleSlice = (2 * Math.PI) / categories.length;
        const levels = 4;
        const maxValue = 4;

        // 圆圈背景网格
        for (let level = 1; level <= levels; level++) {
          const r = radius * level / levels;
          g.append("circle")
            .attr("r", r)
            .attr("fill", "rgba(150, 120, 90, 0.1)")
            .attr("stroke", "rgba(150, 120, 90, 1)")
            .attr("stroke-dasharray", "2,2");
        }

        // 轴线与标签
        categories.forEach((cat, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          g.append("line")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", x).attr("y2", y)
            .attr("stroke", "#999");
          g.append("text")
            .attr("x", Math.cos(angle) * (radius + 80))
            .attr("y", Math.sin(angle) * (radius + 20))
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("font-family", font)
            .style("font-size", "14px")
            .text(cat);
        });

        // 先绘制面积大的，再绘制面积小的（All Tasks先，H5 Tasks后）
        const filtered = data.filter(d => d.Source === currentSource);
        const order = [0, 1]; // 先All，再H5
        order.forEach(idx => {
          const taskType = taskTypes[idx];
          const points = categories.map((cat, i) => {
            const val = +filtered.find(d => d.TaskType === taskType)[cat];
            return [
              Math.cos(angleSlice * i - Math.PI / 2) * radius * val / maxValue,
              Math.sin(angleSlice * i - Math.PI / 2) * radius * val / maxValue,
              val
            ];
          });
          points.push(points[0]); // 闭合路径

          // 面积
          g.append("path")
            .attr("class", `radar-area radar-area-${legendKeys[idx]}`)
            .attr("d", d3.line()(points.map(p => [p[0], p[1]])))
            .attr("fill", colorMap[idx])
            .attr("stroke", "none")
            .attr("fill-opacity", 0.18)
            .attr("opacity", 1)
            .style("cursor", "pointer")
            .on("mouseover", function() { highlight(idx); })
            .on("mouseout", resetHighlight);
        });
        order.forEach(idx => {
          const taskType = taskTypes[idx];
          const points = categories.map((cat, i) => {
            const val = +filtered.find(d => d.TaskType === taskType)[cat];
            return [
              Math.cos(angleSlice * i - Math.PI / 2) * radius * val / maxValue,
              Math.sin(angleSlice * i - Math.PI / 2) * radius * val / maxValue,
              val
            ];
          });
          points.push(points[0]); // 闭合路径

          // 线
          g.append("path")
            .attr("class", `radar-line radar-line-${legendKeys[idx]}`)
            .attr("d", d3.line()(points.map(p => [p[0], p[1]])))
            .attr("fill", "none")
            .attr("stroke", colorMap[idx])
            .attr("stroke-width", 2)
            .attr("opacity", 1)
            .style("cursor", "pointer")
            .on("mouseover", function() { highlight(idx); })
            .on("mouseout", resetHighlight);

          // 四角数值（默认隐藏）
          points.slice(0, 4).forEach((p, i) => {
            g.append("text")
              .attr("class", `radar-corner radar-corner-${legendKeys[idx]}`)
              .attr("x", p[0])
              .attr("y", p[1] + (p[1] > 0 ? 18 : -8))
              .attr("text-anchor", "middle")
              .attr("font-size", "14px")
              .attr("font-family", font)
              .attr("font-weight", "bold")
              .attr("fill", colorMap[idx])
              .attr("opacity", 0)
              .text(points[i][2]);
          });
        });

        // 图例右上角
        const legend = svg.append("g")
          .attr("transform", `translate(${width - 220},${50})`);
        taskTypes.forEach((label, i) => {
          const row = legend.append("g")
            .attr("class", `legend-row legend-${legendKeys[i]}`)
            .attr("transform", `translate(0,${i * 28})`)
            .style("cursor", "pointer")
            .on("mouseover", function() { highlight(i); })
            .on("mouseout", resetHighlight);
          row.append("line")
            .attr("x1", 0).attr("y1", 0).attr("x2", 24).attr("y2", 0)
            .attr("stroke", colorMap[i])
            .attr("stroke-width", 2)
            .attr("opacity", 1)
            .attr("class", `legend-line legend-line-${legendKeys[i]}`);
          row.append("text")
            .attr("x", 30).attr("y", 4)
            .text(label)
            .attr("class", `legend-text legend-text-${legendKeys[i]}`)
            .style("font-family", font)
            .style("font-size", "14px")
            .attr("fill", "black")
            .attr("font-weight", "normal");
        });

        // 悬浮高亮逻辑
        function highlight(idx) {
          // 面积高亮
          g.selectAll(".radar-area")
            .attr("opacity", (d, i) => i === idx ? highlightOpacity : dimOpacity)
            .attr("fill-opacity", (d, i) => i === idx ? 0.35 : 0.18);
          // 线条高亮
          g.selectAll(".radar-line")
            .attr("stroke-width", (d, i) => i === idx ? 4 : 2)
            .attr("opacity", (d, i) => i === idx ? highlightOpacity : dimOpacity);
          // 图例高亮
          svg.selectAll(".legend-line")
            .attr("opacity", (d, i) => i === idx ? highlightOpacity : dimOpacity)
            .attr("stroke-width", (d, i) => i === idx ? 4 : 2);
          svg.selectAll(".legend-text")
            .attr("font-weight", (d, i) => i === idx ? "bold" : "normal")
            .attr("opacity", (d, i) => i === idx ? highlightOpacity : dimOpacity);
          // 四角数值显示
          g.selectAll(`.radar-corner`).attr("opacity", 0);
          g.selectAll(`.radar-corner-${legendKeys[idx]}`).attr("opacity", 1);
        }
        function resetHighlight() {
          g.selectAll(".radar-area")
            .attr("opacity", 1)
            .attr("fill-opacity", 0.18);
          g.selectAll(".radar-line")
            .attr("stroke-width", 2)
            .attr("opacity", 1);
          svg.selectAll(".legend-line")
            .attr("opacity", 1)
            .attr("stroke-width", 2);
          svg.selectAll(".legend-text")
            .attr("font-weight", "normal")
            .attr("opacity", 1);
          g.selectAll(`.radar-corner`).attr("opacity", 0);
        }
      }
      render();
      resolve();
    });
  });
};

chartRenderers[11] = function(titleText, dataPath, chartArea) {
  return new Promise(resolve => {
    d3.csv(dataPath).then(data => {
      const width = 720;
      const height = 428;
      const margin = { top: 20, right: 30, bottom: 140, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // 颜色映射 - 保持合适饱和度，拉开色阶
      const colorMap = {
        "Cognitive skills": "#2E5A88",
        "Engagement skills": "#8B4513", 
        "Ethics": "#1B4D3E",
        "Physical abilities": "#8B0000",
        "Self-efficacy": "#5D4E75",
        "Technology skills": "#2E2A5A",
        "Management skills": "#B8860B",
        "Working with others": "#8B5A8B"
      };

      // 象限标签 - 黑色文字
      const quadrants = [
        { x: 0.75, y: 0.25, text: "Core skills\nin 2030", color: "#000000" },
        { x: 0.25, y: 0.25, text: "Emerging\nskills", color: "#000000" },
        { x: 0.75, y: 0.75, text: "Steady\nskills", color: "#000000" },
        { x: 0.25, y: 0.75, text: "Out of focus\nskills", color: "#000000" }
      ];

      const svg = chartArea.append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // 数据预处理
      data.forEach(d => {
        d["Core in 2025 (%)"] = +d["Core in 2025 (%)"];
        d["Expected increase in 2030 (%)"] = +d["Expected increase in 2030 (%)"];
      });

      // 比例尺
      const x = d3.scaleLinear()
        .domain([0, 80])
        .range([0, innerWidth]);

      const y = d3.scaleLinear()
        .domain([0, 100])
        .range([innerHeight, 0]);

      // 分割线
      const xThreshold = 38.5;
      const yThreshold = 50;

      // 象限背景块
      const quadrantBackgrounds = [
        { x: 0, y: 0, width: x(xThreshold), height: y(yThreshold), fill: "rgba(255, 140, 0, 0.1)" }, // 左下
        { x: x(xThreshold), y: 0, width: innerWidth - x(xThreshold), height: y(yThreshold), fill: "rgba(34, 139, 34, 0.1)" }, // 右下
        { x: 0, y: y(yThreshold), width: x(xThreshold), height: innerHeight - y(yThreshold), fill: "rgba(220, 20, 60, 0.1)" }, // 左上
        { x: x(xThreshold), y: y(yThreshold), width: innerWidth - x(xThreshold), height: innerHeight - y(yThreshold), fill: "rgba(65, 105, 225, 0.1)" } // 右上
      ];

      // 添加象限背景
      quadrantBackgrounds.forEach(bg => {
        g.append("rect")
          .attr("x", bg.x)
          .attr("y", bg.y)
          .attr("width", bg.width)
          .attr("height", bg.height)
          .attr("fill", bg.fill);
      });

      // 垂直分割线
      g.append("line")
        .attr("x1", x(xThreshold))
        .attr("y1", 0)
        .attr("x2", x(xThreshold))
        .attr("y2", innerHeight)
        .attr("stroke", "#999")
        .attr("stroke-dasharray", "5,5")
        .attr("stroke-width", 1);

      // 水平分割线
      g.append("line")
        .attr("x1", 0)
        .attr("y1", y(yThreshold))
        .attr("x2", innerWidth)
        .attr("y2", y(yThreshold))
        .attr("stroke", "#999")
        .attr("stroke-dasharray", "5,5")
        .attr("stroke-width", 1);

      // 象限标签
      quadrants.forEach(q => {
        g.append("text")
          .attr("x", innerWidth * q.x)
          .attr("y", innerHeight * q.y)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-family", "Courier New")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("fill", q.color)
          .text(q.text.split("\n")[0]);

        g.append("text")
          .attr("x", innerWidth * q.x)
          .attr("y", innerHeight * q.y + 15)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-family", "Courier New")
          .style("font-size", "12px")
          .style("font-weight", "bold")
          .style("fill", q.color)
          .text(q.text.split("\n")[1]);
      });

      // Tooltip
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "scatter-tooltip")
        .style("position", "absolute")
        .style("z-index", "9999")
        .style("background", "#2a2a2a")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("font-size", "13px")
        .style("font-family", "'Courier New', monospace")
        .style("border-radius", "6px")
        .style("display", "none")
        .style("pointer-events", "none");

      // 散点
      g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d["Core in 2025 (%)"]))
        .attr("cy", d => y(d["Expected increase in 2030 (%)"]))
        .attr("r", 6)
        .attr("fill", d => colorMap[d.Category])
        //.attr("stroke", "#fff")
        //.attr("stroke-width", 1)
        .attr("opacity", 0.8)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 8)
            .attr("opacity", 1);

          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px")
            .style("display", "block")
            .html(`<strong>${d.Skill}</strong><br>
                   Core in 2025: ${d["Core in 2025 (%)"]}%<br>
                   Expected increase: ${d["Expected increase in 2030 (%)"]}%<br>
                   Category: ${d.Category}`);
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 6)
            .attr("opacity", 0.8);

          tooltip.style("display", "none");
        });

      // 坐标轴
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(8).tickFormat(d => d + "%"))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Courier New', monospace");

      g.append("g")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Courier New', monospace");

      // 轴标签 - 精简文字
      svg.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", height - 90)
        .attr("text-anchor", "middle")
        .text("Core skill in 2025 (%)")
        .style("font-family", "'Courier New', monospace")
        .style("font-size", "12px");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2 + 40)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Expected increase by 2030 (%)")
        .style("font-family", "'Courier New', monospace")
        .style("font-size", "12px");

      // 图例 - 下方，分两行
      const legend = svg.append("g")
        .attr("transform", `translate(${margin.left + 20}, ${height - 50})`);

      const categories = Object.keys(colorMap);
      const firstRow = categories.slice(0, 4);
      const secondRow = categories.slice(4);

      // 第一行
      firstRow.forEach((category, i) => {
        const row = legend.append("g")
          .attr("transform", `translate(${i * 150}, 0)`)
          .style("cursor", "pointer")
          .on("mouseover", function() {
            // 高亮当前类别
            g.selectAll("circle")
              .attr("opacity", d => d.Category === category ? 1 : 0.2);
            d3.select(this).select("text").style("font-weight", "bold");
          })
          .on("mouseout", function() {
            // 恢复所有点
            g.selectAll("circle").attr("opacity", 0.8);
            d3.select(this).select("text").style("font-weight", "normal");
          });

        row.append("circle")
          .attr("r", 4)
          .attr("fill", colorMap[category]);

        row.append("text")
          .attr("x", 8)
          .attr("y", 4)
          .text(category)
          .style("font-size", "12px")
          .style("font-family", "'Courier New', monospace");
      });

      // 第二行
      secondRow.forEach((category, i) => {
        const row = legend.append("g")
          .attr("transform", `translate(${i * 150}, 20)`)
          .style("cursor", "pointer")
          .on("mouseover", function() {
            // 高亮当前类别
            g.selectAll("circle")
              .attr("opacity", d => d.Category === category ? 1 : 0.2);
            d3.select(this).select("text").style("font-weight", "bold");
          })
          .on("mouseout", function() {
            // 恢复所有点
            g.selectAll("circle").attr("opacity", 0.8);
            d3.select(this).select("text").style("font-weight", "normal");
          });

        row.append("circle")
          .attr("r", 4)
          .attr("fill", colorMap[category]);

        row.append("text")
          .attr("x", 8)
          .attr("y", 4)
          .text(category)
          .style("font-size", "12px")
          .style("font-family", "'Courier New', monospace");
      });

      resolve();
    });
  });
};

chartRenderers[12] = function(titleText, dataPath, chartArea) {
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

chartRenderers[13] = function(titleText, dataPath, chartArea) {
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

chartRenderers[14] = function(titleText, dataPath, chartArea) {
  return new Promise(resolve => {
    d3.csv(dataPath).then(data => {
      const width = 720;
      const height = 480;
      const margin = { top: 30, right: 30, bottom: 120, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // 颜色映射
      const colorMap = {
        "Computer and Mathematical": "#2E5A88",
        "Management": "#956800",
        "Business and Financial Operations": "#1B4D3E",
        "Arts, Designs, and Media": "#8B0000"
      };

      // 数据预处理
      data.forEach(d => {
        d.AI_Capability = +d.AI_Capability;
        d.Automation_Desire = +d.Automation_Desire;
        
        // 添加轻微打散效果
        d.jitterX = (Math.random() - 0.5) * 0.1; // ±0.05的随机偏移
        d.jitterY = (Math.random() - 0.5) * 0.1;
      });

      const svg = chartArea.append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // 比例尺
      const x = d3.scaleLinear()
        .domain([1, 5])
        .range([0, innerWidth]);

      const y = d3.scaleLinear()
        .domain([1, 5])
        .range([innerHeight, 0]);

      // 分割线
      const xThreshold = 3;
      const yThreshold = 3;

      // 象限背景块
      const quadrantBackgrounds = [
        { x: 0, y: 0, width: x(xThreshold), height: y(yThreshold), fill: "rgba(255, 140, 0, 0.1)", label: "R&D Opportunity Zone" }, // 左上
        { x: x(xThreshold), y: 0, width: innerWidth - x(xThreshold), height: y(yThreshold), fill: "rgba(34, 139, 34, 0.1)", label: "Automation 'Green Light' Zone" }, // 右上
        { x: 0, y: y(yThreshold), width: x(xThreshold), height: innerHeight - y(yThreshold), fill: "rgba(172, 183, 214, 0.1)", label: "Low Priority Zone" }, // 左下
        { x: x(xThreshold), y: y(yThreshold), width: innerWidth - x(xThreshold), height: innerHeight - y(yThreshold), fill: "rgba(220, 20, 60, 0.1)", label: "Automation 'Red Light' Zone" } // 右下
      ];

              // 添加象限背景
        quadrantBackgrounds.forEach(bg => {
          g.append("rect")
            .attr("x", bg.x)
            .attr("y", bg.y)
            .attr("width", bg.width)
            .attr("height", bg.height)
            .attr("fill", bg.fill);

          // 添加象限标签 - 上两个象限在顶部，下两个象限在底部
          const isTopQuadrant = bg.y < y(yThreshold);
          const labelY = isTopQuadrant ? bg.y + 20 : bg.y + bg.height - 20;
          
          g.append("text")
            .attr("x", bg.x + bg.width / 2)
            .attr("y", labelY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", isTopQuadrant ? "hanging" : "auto")
            .style("font-family", "Courier New")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#000000")
            .text(bg.label);
        });

      // 垂直分割线
      g.append("line")
        .attr("x1", x(xThreshold))
        .attr("y1", 0)
        .attr("x2", x(xThreshold))
        .attr("y2", innerHeight)
        .attr("stroke", "#999")
        .attr("stroke-dasharray", "5,5")
        .attr("stroke-width", 1);

      // 水平分割线
      g.append("line")
        .attr("x1", 0)
        .attr("y1", y(yThreshold))
        .attr("x2", innerWidth)
        .attr("y2", y(yThreshold))
        .attr("stroke", "#999")
        .attr("stroke-dasharray", "5,5")
        .attr("stroke-width", 1);

      // Tooltip
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "scatter-tooltip")
        .style("position", "absolute")
        .style("z-index", "9999")
        .style("background", "#2a2a2a")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("font-size", "13px")
        .style("font-family", "'Courier New', monospace")
        .style("border-radius", "6px")
        .style("display", "none")
        .style("pointer-events", "none");

      // 散点
      g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.AI_Capability + d.jitterX))
        .attr("cy", d => y(d.Automation_Desire + d.jitterY))
        .attr("r", 4)
        .attr("fill", d => colorMap[d.Category] || "#999")
        //.attr("stroke", "#fff")
        //.attr("stroke-width", 1)
        .attr("opacity", 0.8)
        .attr("class", d => `scatter-point scatter-${d.Category.replace(/\s+/g, "-")}`)
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 6)
            .attr("opacity", 1);

          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px")
            .style("display", "block")
            .html(`<strong>${d.Occupation}</strong><br>
                   Task: ${d.Task}<br>
                   AI Capability: ${d.AI_Capability}<br>
                   Automation Desire: ${d.Automation_Desire}<br>
                   Category: ${d.Category}`);
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 4)
            .attr("opacity", 0.8);

          tooltip.style("display", "none");
        });

      // 坐标轴
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Courier New', monospace");

      g.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Courier New', monospace");

      // 轴标签
      svg.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", height - 80)
        .attr("text-anchor", "middle")
        .text("AI Expert-rated Automation Capability")
        .style("font-family", "'Courier New', monospace")
        .style("font-size", "12px");

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2 + 40)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Worker-rated Automation Desire")
        .style("font-family", "'Courier New', monospace")
        .style("font-size", "12px");

      // 图例 - 下方，分两行
      const legend = svg.append("g")
        .attr("transform", `translate(${margin.left + 80}, ${height - 50})`);

      const categories = Object.keys(colorMap);
      const firstRow = categories.slice(0, 2);
      const secondRow = categories.slice(2);

             // 第一行
       firstRow.forEach((category, i) => {
         const row = legend.append("g")
           .attr("transform", `translate(${i * 300}, 0)`)
           .style("cursor", "pointer")
           .on("mouseover", function() {
             // 高亮当前类别
             g.selectAll("circle")
               .attr("opacity", d => d.Category === category ? 1 : 0.2);
             d3.select(this).select("text").style("font-weight", "bold");
           })
           .on("mouseout", function() {
             // 恢复所有点
             g.selectAll("circle").attr("opacity", 0.8);
             d3.select(this).select("text").style("font-weight", "normal");
           });

        row.append("circle")
          .attr("r", 4)
          .attr("fill", colorMap[category]);

        row.append("text")
          .attr("x", 8)
          .attr("y", 4)
          .text(category)
          .style("font-size", "12px")
          .style("font-family", "'Courier New', monospace");
      });

             // 第二行
       secondRow.forEach((category, i) => {
         const row = legend.append("g")
           .attr("transform", `translate(${i * 300}, 20)`)
           .style("cursor", "pointer")
           .on("mouseover", function() {
             // 高亮当前类别
             g.selectAll("circle")
               .attr("opacity", d => d.Category === category ? 1 : 0.2);
             d3.select(this).select("text").style("font-weight", "bold");
           })
           .on("mouseout", function() {
             // 恢复所有点
             g.selectAll("circle").attr("opacity", 0.8);
             d3.select(this).select("text").style("font-weight", "normal");
           });

        row.append("circle")
          .attr("r", 4)
          .attr("fill", colorMap[category]);

        row.append("text")
          .attr("x", 8)
          .attr("y", 4)
          .text(category)
          .style("font-size", "12px")
          .style("font-family", "'Courier New', monospace");
      });

      resolve();
    });
  });
};





