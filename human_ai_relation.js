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
      .attr("height", height)
      .style("pointer-events", "none"); // 让容器不阻挡点击事件

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
      .attr("height", 81)
      .attr("id", "has-image")
      .style("pointer-events", "all"); // 让图片可以接收鼠标事件

    // tooltip div 设置
    const tooltip = d3.select("body")
      .append("div")
      .attr("id", "has-tooltip")
      .attr("class", "tooltip");

    // 绑定悬浮事件到HAS_image
    d3.select("#has-image")
      .on("mouseover", function(event) {
        tooltip
          .style("display", "block")
          .html("<strong>Human Agency Scale (HAS)</strong><br>A five-level framework that measures how much human involvement is needed in completing a task with AI.");
        positionTooltip(tooltip, event, 14, 20);
      })
      .on("mousemove", function(event) {
        positionTooltip(tooltip, event, 14, 20);
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
      const sourceTabs = ["Rated by workers", "Rated by AI experts"];
      let currentSource = "Rated by workers";
      
      // 映射tabs文字到CSV数据中的实际值
      const sourceMapping = {
        "Rated by workers": "Worker",
        "Rated by AI experts": "Expert"
      };
      
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
          
          // 添加数字标签（在Physical Action轴上）
          g.append("text")
            .attr("x", 0)
            .attr("y", -r - 10)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .call(applyChartFont, 'small')
            .attr("fill", "rgba(150, 120, 90, 1)")
            .text(level);
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
            .attr("y", Math.sin(angle) * (radius + 30))
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .call(applyChartFont, 'medium')
            .text(cat);
        });

        // 先绘制面积大的，再绘制面积小的（All Tasks先，H5 Tasks后）
        const filtered = data.filter(d => d.Source === sourceMapping[currentSource]);
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
            .call(applyChartFont, 'medium')
            .attr("fill", "black")
            .call(applyTextWeight, 'normal');
        });

        // 悬浮高亮逻辑
        function highlight(idx) {
          // 面积高亮
          g.selectAll(".radar-area")
            .attr("opacity", (d, i) => i === idx ? highlightOpacity : dimOpacity)
            .attr("fill-opacity", (d, i) => i === idx ? 0.35 : 0.18);
          // 线条高亮
          g.selectAll(".radar-line")
            .attr("stroke-width", (d, i) => i === idx ? 3 : 2)
            .attr("opacity", (d, i) => i === idx ? highlightOpacity : dimOpacity);
          // 图例高亮
          svg.selectAll(".legend-line")
            .attr("opacity", 1)
            .attr("stroke-width", (d, i) => i === idx ? 3 : 2);
          svg.selectAll(".legend-text")
            .style("font-weight", (d, i) => i === idx ? "bold" : "normal")
            .attr("opacity", 1);
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
            .style("font-weight", "normal")
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
      const margin = { top: 20, right: 30, bottom: 140, left: 80 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // 颜色映射 - 增加色相差异，降低明度
      const colorMap = {
        "Cognitive skills": "#1E3A8A",      // 深蓝色
        "Engagement skills": "#8B6914",     // 更深橙色
        "Ethics": "#006400",                // 深绿色
        "Physical abilities": "#B22222",     // 深红色
        "Self-efficacy": "#4B0082",         // 更深紫色
        "Technology skills": "#6B7280",     // 灰色调蓝色
        "Management skills": "#374151",     // 深灰色调绿色
        "Working with others": "#8B008B"    // 更深玫红色
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
        .attr("class", "tooltip");

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
            .style("display", "block")
            .html(`<strong>${d.Skill}</strong><br>
                   Core in 2025: ${d["Core in 2025 (%)"]}%<br>
                   Expected increase: ${d["Expected increase in 2030 (%)"]}%<br>
                   Category: ${d.Category}`);
          positionTooltip(tooltip, event, 12, 20);
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
        .call(applyAxisLabel);

      g.append("g")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + "%"))
        .selectAll("text")
        .call(applyAxisLabel);

      // 轴标签 - 精简文字
      svg.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", height - 90)
        .attr("text-anchor", "middle")
        .text("Employers: Core skill recognition in 2025 (%)")
        .call(applyAxisLabel);

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2 + 60)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Employers expecting more use by 2030 (%)")
        .call(applyAxisLabel);

      // 图例 - 下方，分两行
      const legend = svg.append("g")
        .attr("transform", `translate(${margin.left - 10}, ${height - 50})`);

      const categories = Object.keys(colorMap);
      const firstRow = categories.slice(0, 4);
      const secondRow = categories.slice(4);

      // 第一行
      firstRow.forEach((category, i) => {
        const row = legend.append("g")
          .attr("transform", `translate(${i * 150}, 0)`)
          .call(applyInteractive)
          .on("mouseover", function() {
            // 高亮当前类别
            g.selectAll("circle")
              .attr("opacity", d => d.Category === category ? 1 : 0.1);
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
          .call(applyLegendText);
      });

      // 第二行
      secondRow.forEach((category, i) => {
        const row = legend.append("g")
          .attr("transform", `translate(${i * 150}, 20)`)
          .call(applyInteractive)
          .on("mouseover", function() {
            // 高亮当前类别
            g.selectAll("circle")
              .attr("opacity", d => d.Category === category ? 1 : 0.1);
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
          .call(applyLegendText);
      });

      resolve();
    });
  });
};

chartRenderers[12] = function(titleText, dataPath, chartArea) {
  return new Promise(resolve => {
    const width = 720;
    const height = 600;

    const svg = chartArea.append("svg")
      .attr("width", width)
      .attr("height", height);

    // 添加human-machine切图
    svg.append("image")
      .attr("href", "assets/chapter2/human-machine.png")
      .attr("x", 60)
      .attr("y", 90)
      .attr("width", 580)
      .attr("height", 420);

    // 5秒后显示dialogue4
    showDialogueWithDelay("dialogue-box4", 5000);

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
      .call(applyAxisLabel);

    // 底部轴（数值刻度）
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"))
      .selectAll("text")
      .call(applyAxisLabel);

    // 添加 x轴标题
    svg.append("text")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", margin.top + innerHeight + 50)
      .attr("text-anchor", "middle")
      .call(applyAxisLabel)
      .text("Share of tasks workers want AI to take over (%)");

    // 数值标签
    g.selectAll("text.value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", d => x(d.value) + 6)
      .attr("y", d => y(d.field) + y.bandwidth() / 2 + 4)
      .text(d => `${d.value}%`)
      .call(applyChartFont, 'small');

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
        <b style="font-size: 20px;">Arts, Design & Media don't want automation.</b><br><br>
        🎨 "I want it to make things less tedious… but no content creation."<br>
        🖌️ "I would never use AI to replace artists."<br>
        🧠 "AI can support my research, but I create my design by myself."<br><br>
      `);

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
          // 定义象限解释
          const quadrantExplanations = {
            "Automation 'Green Light' Zone": "Tasks with both high automation desire and high capability. These are prime candidates for AI agent deployment with the potential for broad productivity and societal gains.",
            "Automation 'Red Light' Zone": "Tasks with high capability but low desire. Deployment here warrants caution, as it may face worker resistance or pose broader negative societal implications.",
            "R&D Opportunity Zone": "Tasks with high desire but currently low capability. These represent promising directions for AI research and development.",
            "Low Priority Zone": "Tasks with both low desire and low capability. These are less urgent for AI agent development."
          };
          
          // 添加象限背景矩形（可交互）
          g.append("rect")
            .attr("x", bg.x)
            .attr("y", bg.y)
            .attr("width", bg.width)
            .attr("height", bg.height)
            .attr("fill", bg.fill)
            .style("cursor", "default")
            .on("mouseover", function(event) {
              // 高亮当前象限背景
              d3.select(this).attr("fill", bg.fill.replace("0.1", "0.2"));
              
              // 先移除已存在的tooltip
              d3.selectAll(".tooltip").remove();
              
              // 创建新的tooltip
              const quadrantTooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("max-width", "300px")
                .style("display", "block")
                .html(`<strong>${bg.label}</strong><br><br>${quadrantExplanations[bg.label]}`);
              
              positionTooltip(quadrantTooltip, event, 15, 20);
            })
            .on("mousemove", function(event) {
              positionTooltip(d3.select(".tooltip"), event, 15, 20);
            })
            .on("mouseout", function() {
              // 恢复象限背景颜色
              d3.select(this).attr("fill", bg.fill);
              d3.selectAll(".tooltip").remove();
            });

          // 添加象限标签 - 上两个象限在顶部，下两个象限在底部
          const isTopQuadrant = bg.y < y(yThreshold);
          const labelY = isTopQuadrant ? bg.y + 20 : bg.y + bg.height - 20;
          
          g.append("text")
            .attr("x", bg.x + bg.width / 2)
            .attr("y", labelY)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", isTopQuadrant ? "hanging" : "auto")
            .call(applyChartFont, 'small')
            .call(applyTextWeight, 'bold')
            .style("fill", "#000000")
            .style("cursor", "default")
            .style("pointer-events", "none") // 让文字不阻挡鼠标事件
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
        .call(applyInteractive)
        .on("mouseover", function(event, d) {
          // 先移除已存在的tooltip
          d3.selectAll(".tooltip").remove();
          
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 6)
            .attr("opacity", 1);

          // 创建散点tooltip
          const scatterTooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("display", "block")
            .html(`<strong>${d.Occupation}</strong><br>
                   Task: ${d.Task}<br>
                   AI Capability: ${d.AI_Capability}<br>
                   Automation Desire: ${d.Automation_Desire}<br>
                   Category: ${d.Category}`);
          
          positionTooltip(scatterTooltip, event, 12, 20);
        })
        .on("mousemove", function(event) {
          positionTooltip(d3.select(".tooltip"), event, 12, 20);
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 4)
            .attr("opacity", 0.8);

          d3.selectAll(".tooltip").remove();
        });

      // 坐标轴
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll("text")
        .call(applyAxisLabel);

      g.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .call(applyAxisLabel);

      // 轴标签
      svg.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", height - 80)
        .attr("text-anchor", "middle")
        .text("AI Expert-rated Automation Capability")
        .call(applyAxisLabel);

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2 + 40)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Worker-rated Automation Desire")
        .call(applyAxisLabel);

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
           .call(applyInteractive)
           .on("mouseover", function() {
             // 高亮当前类别
             g.selectAll("circle")
               .attr("opacity", d => d.Category === category ? 1 : 0.1);
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
          .call(applyLegendText);
      });

             // 第二行
       secondRow.forEach((category, i) => {
         const row = legend.append("g")
           .attr("transform", `translate(${i * 300}, 20)`)
           .call(applyInteractive)
           .on("mouseover", function() {
             // 高亮当前类别
             g.selectAll("circle")
               .attr("opacity", d => d.Category === category ? 1 : 0.1);
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
          .call(applyLegendText);
      });

      // 添加出口按钮到datavis-container（仅在chart14时显示）
      // 先移除已存在的出口按钮
      d3.select("#exit-button").remove();
      
      // 添加出口按钮
      const exitButton = d3.select("#datavis-container")
        .append("div")
        .attr("id", "exit-button")
        .style("position", "absolute")
        .style("top", "450px")
        .style("right", "124px")
        .style("width", "184px")
        .style("height", "184px")
        .style("cursor", "pointer")
        .style("z-index", "10")
        .on("click", function(event) {
          event.stopPropagation(); // 阻止事件冒泡
          console.log("Exit button clicked"); // 调试信息
          
          // 检查dialogue5是否已经显示
          const dialogueBox5 = document.getElementById('dialogue-box5');
          if (dialogueBox5 && dialogueBox5.style.display === 'block') {
            // 如果dialogue5已经显示，则隐藏它并进入下一章节
            hideDialogueBoxById("dialogue-box5");
            setTimeout(() => {
              window.startChapter3();
            }, 400); // 等待dialogue5消失动画完成
          } else {
            // 如果dialogue5没有显示，则显示它
            showDialogueBoxById("dialogue-box5");
          }
        });

      // 使用trigger.png切图
      exitButton.append("img")
        .attr("src", "assets/icons/trigger.png")
        .attr("width", "184")
        .attr("height", "184");

      resolve();
    });
  });
};





