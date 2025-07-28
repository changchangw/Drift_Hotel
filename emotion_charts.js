function getHighlightColor(hex, factor = 1.2) {
  const c = d3.color(hex);
  if (!c) return hex;
  c.r = Math.min(255, c.r * factor);
  c.g = Math.min(255, c.g * factor);
  c.b = Math.min(255, c.b * factor);
  return c.formatHex();
}

const chartRenderers = {
  // 词云图表渲染器
  1: function(titleText, csvPath, chartArea) {
    const width = 680;
    const height = 428;

    return new Promise((resolve) => {
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

          resolve(); // 词云渲染完成
        }
      });
    });
  },

  // 情绪地图渲染器
  2: function(title, dataPath, chartArea) {
    return new Promise(resolve => {
      const width = 680, height = 428;
  
      const projection = d3.geoMercator()
        .scale(100)
        .translate([width / 2, height / 1.5]);
  
      const path = d3.geoPath().projection(projection);
  
      const tooltip = d3.select("body")
        .append("div")
        .attr("id", "map-tooltip")
        .style("position", "absolute")
        .style("z-index", "10000")
        .style("background", "rgba(0,0,0,0.75)")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "6px")
        .style("font-size", "13px")
        .style("font-family", "'Courier New', monospace")
        .style("pointer-events", "none")
        .style("display", "none");
  
      Promise.all([
        d3.json("assets/chapter2/world.geo.json"),
        d3.csv(dataPath)
      ]).then(([world, data]) => {
        const cleanData = {};
        data.forEach(d => {
          const country = d.Country || d.country;
          const statement = d.Statement.toLowerCase();
          const value = +d['% of respondents that "Agree"'].replace("%", "");
          if (!cleanData[country]) cleanData[country] = {};
          if (statement.includes("excited")) cleanData[country].excited = value;
          if (statement.includes("nervous")) cleanData[country].nervous = value;
        });
  
        const emotionMap = new Map();
        for (const country in cleanData) {
          const v = cleanData[country];
          if (v.excited !== undefined && v.nervous !== undefined) {
            emotionMap.set(country, v);
          }
        }
  
        const svg = chartArea.append("svg")
          .attr("width", width)
          .attr("height", height);
  
        function getEmotionColor(excited, nervous) {
          const diff = excited - nervous;
          const normalized = (diff + 100) / 200;
        
          return d3.interpolateRgb(
            d3.rgb(60, 180, 60),
            d3.rgb(180, 40, 40)
          )(normalized);
        }
  
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
          .attr("id", "legend-gradient")
          .attr("x1", "0%").attr("y1", "0%")
          .attr("x2", "0%").attr("y2", "100%");
  
        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", getEmotionColor(100, 0));
        gradient.append("stop")
          .attr("offset", "50%")
          .attr("stop-color", getEmotionColor(50, 50));
        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", getEmotionColor(0, 100));
  
        const legendHeight = 120;
        const legendWidth = 14;
  
        const legend = svg.append("g")
          .attr("transform", `translate(20, ${height - 150})`);
  
        legend.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#legend-gradient)");
  
        const labels = [
          { text: "Excited", offset: 0.05 },
          { text: "Balanced", offset: 0.5 },
          { text: "Nervous", offset: 0.95 }
        ];

        labels.forEach(d => {
          legend.append("text")
            .attr("x", legendWidth + 6)
            .attr("y", legendHeight * d.offset)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("fill", "#000")
            .style("font-family", "'Courier New', monospace")
            .text(d.text);
        });
  
        svg.append("g")
          .selectAll("path")
          .data(world.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            const val = emotionMap.get(d.properties.name);
            return val ? getEmotionColor(val.excited, val.nervous) : "#f2f0e9";
          })
          .attr("stroke", "#999")
          .attr("stroke-width", 0.5)
          .on("mouseover", function (event, d) {
            const val = emotionMap.get(d.properties.name);
            if (!val) return;
          
            const baseColor = getEmotionColor(val.excited, val.nervous);
            d3.select(this)
              .attr("fill", getHighlightColor(baseColor));          
  
            tooltip
              .style("left", event.pageX + 15 + "px")
              .style("top", event.pageY - 10 + "px")
              .style("display", "block")
              .html(`<strong>${d.properties.name}</strong><br>
  Excited: ${val.excited}%<br>
  Nervous: ${val.nervous}%`);
          })
          .on("mousemove", function (event) {
            tooltip
              .style("left", event.pageX + 15 + "px")
              .style("top", event.pageY - 10 + "px");
          })
          .on("mouseout", function (event, d) {
            const val = emotionMap.get(d.properties.name);
            d3.select(this)
              .attr("fill", val ? getEmotionColor(val.excited, val.nervous) : "#f2f0e9");
          
            tooltip.style("display", "none");
          });
          
        resolve();
      });
    });
  },

  // 就业潜力地图（带 key 参数）
  3: function(csvPath, key) {
    return new Promise(resolve => {
      const width = 680, height = 428;
  
      const svg = d3.select("#datavis-chart-area")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
  
      const projection = d3.geoMercator()
        .scale(100)
        .translate([width / 2, height / 1.5]);
  
      const path = d3.geoPath().projection(projection);
  
      // Tooltip 样式同 chartRenderers[2]
      const tooltip = d3.select("body")
        .append("div")
        .attr("id", "map-tooltip")
        .style("position", "absolute")
        .style("z-index", "10000")
        .style("background", "rgba(0,0,0,0.75)")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "6px")
        .style("font-size", "13px")
        .style("font-family", "'Courier New', monospace")
        .style("pointer-events", "none")
        .style("display", "none");
  
      Promise.all([
        d3.json("assets/chapter2/world.geo.json"),
        d3.csv(csvPath)
      ]).then(([worldData, data]) => {
        // 构建 Country → Value 映射
        const valueMap = new Map();
        data.forEach(d => {
          const value = parseFloat(d[key]);
          if (!isNaN(value)) {
            valueMap.set(d.Country, value);
          }
        });
  
        // 颜色比例尺（咖色系）
        const colorScale = d3.scaleLinear()
          .domain([0, 100])
          .range(["#9ebbdc", "#1d3557"]);

        // 添加地图路径
        svg.selectAll("path")
          .data(worldData.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            const val = valueMap.get(d.properties.name);
            return val !== undefined ? colorScale(val) : "#F2F0E9"; // 无数据的国家颜色
          })
          .attr("stroke", "#888")
          .attr("stroke-width", 0.5)
          .on("mouseover", function (event, d) {
            const val = valueMap.get(d.properties.name);
            if (val === undefined) return;
          
            const baseColor = colorScale(val);
            d3.select(this)
              .attr("fill", getHighlightColor(baseColor)); // hover 变亮          
  
            tooltip
              .style("left", event.pageX + 15 + "px")
              .style("top", event.pageY - 10 + "px")
              .style("display", "block")
              .html(`<strong>${d.properties.name}</strong><br>${val}%`);
          })
          .on("mousemove", function (event) {
            tooltip
              .style("left", event.pageX + 15 + "px")
              .style("top", event.pageY - 10 + "px");
          })
          .on("mouseout", function (event, d) {
            const val = valueMap.get(d.properties.name);
            d3.select(this)
              .attr("fill", val !== undefined ? colorScale(val) : "#f2f2f2");
  
            tooltip.style("display", "none");
          });
  
        // ✅ 添加图例
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
          .attr("id", "legend-gradient")
          .attr("x1", "0%").attr("y1", "0%")
          .attr("x2", "0%").attr("y2", "100%");
  
        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colorScale(100));
        gradient.append("stop")
          .attr("offset", "50%")
          .attr("stop-color", colorScale(50));
        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", colorScale(0));
  
        const legendHeight = 120;
        const legendWidth = 14;
  
        const legend = svg.append("g")
          .attr("transform", `translate(20, ${height - 150})`);
  
        legend.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#legend-gradient)");
  
        const labels = [
          { text: "High", offset: 0.05 },
          { text: "Medium", offset: 0.5 },
          { text: "Low", offset: 0.95 }
        ];
  
        labels.forEach(d => {
          legend.append("text")
            .attr("x", legendWidth + 6)
            .attr("y", legendHeight * d.offset)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("fill", "#000")
            .style("font-family", "'Courier New', monospace")
            .text(d.text);
        });
  
        resolve();
      });
    });
  },

  4: function(titleText, dataPath, chartArea) {
    let hasShownDialogue = false;

    return new Promise(resolve => {
      const width = 720, height = 428;
      const margin = { top: 20, right: 50, bottom: 30, left: 120 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      function showDialogue() {
        if (!hasShownDialogue) {
          showDialogueBox();
          hasShownDialogue = true;
          // ✅ 添加点击监听，只触发一次
          document.addEventListener("click", hideDialogueBox, { once: true });
        }
      }      
  
      d3.csv(dataPath).then(data => {
        // ✅ 生成 tooltip 元素（只执行一次）
        const tooltip = d3.select("body")
        .append("div")
        .attr("id", "generation-tooltip")
        .style("position", "absolute")
        .style("z-index", "10000")
        .style("background", "rgba(0, 0, 0, 0.75)")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "6px")
        .style("font-size", "13px")
        .style("font-family", "'Courier New', monospace")
        .style("pointer-events", "none")
        .style("display", "none");

        data.forEach(d => {
          d["2023"] = +d["2023"];
          d["2024"] = +d["2024"];
        });
  
        const generations = ["Gen Z", "Millennial", "Gen X", "Baby boomer"];
        const svg = chartArea.append("svg")
          .attr("width", width)
          .attr("height", height);
  
        const g = svg.append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
  
        const y = d3.scaleBand()
          .domain(generations)
          .range([0, innerHeight])
          .padding(0.55);
  
        const x = d3.scaleLinear()
          .domain([0, 100])
          .range([0, innerWidth]);
  
        // ✅ 颜色定义（正确顺序：2023 橙色，2024 绿色）
        const color = d3.scaleOrdinal()
          .domain(["2023", "2024"])
          .range(["#a26d42", "#5e8b7e"]);
  
          function resetAllStyles() {
            d3.selectAll(".bar-2023")
              .attr("fill", color("2023"))
              .attr("opacity", 1);
            d3.selectAll(".bar-2024")
              .attr("fill", color("2024"))
              .attr("opacity", 1);
            d3.selectAll(".label").style("font-weight", "normal");
            d3.selectAll(".y-axis-label").style("font-weight", "normal");
            d3.selectAll(".legend-text").style("font-weight", "normal");
          
            // ✅ 恢复图例色块为原色（关键修复）
            d3.selectAll(".legend-rect")
              .attr("fill", d => color(d));
          }
          
  
        function handleBarHover(thisBar, year, generation) {
          d3.selectAll(".bar").attr("opacity", 0.2);
          d3.select(thisBar)
            .attr("opacity", 1)
  
          d3.selectAll(".y-axis-label")
            .filter(label => label === generation)
            .style("font-weight", "bold");
  
          d3.selectAll(`.label-${year}`)
            .filter(t => t.Generation === generation)
            .style("font-weight", "bold");
        }
  
        g.append("g")
          .call(d3.axisLeft(y))
          .selectAll("text")
          .attr("class", "y-axis-label")
          .style("font-family", "'Courier New', monospace")
          .style("font-size", "14px")
          .style("fill", "#000")
          .on("mouseover", function(event, label) {
            const generationBirthYears = {
              "Gen Z": "Born 1997–2012",
              "Millennial": "Born 1981–1996",
              "Gen X": "Born 1965–1980",
              "Baby boomer": "Born 1946–1964"
            };

            const tooltipText = generationBirthYears[label] || "";

            tooltip
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 20) + "px")
              .style("display", "block")
              .html(`<strong>${label}</strong><br>${tooltipText}`);
          })
          .on("mousemove", function(event) {
            tooltip
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 20) + "px");
          })
          .on("mouseout", function() {
            tooltip.style("display", "none");
          });

  
        g.selectAll("line.bg-line")
          .data(generations)
          .join("line")
          .attr("x1", 0)
          .attr("x2", innerWidth)
          .attr("y1", d => y(d) + y.bandwidth() / 2)
          .attr("y2", d => y(d) + y.bandwidth() / 2)
          .attr("stroke", "#ddd")
          .attr("stroke-dasharray", "2,2");
  
        // ✅ 2023 条
        g.selectAll("rect.bar-2023")
          .data(data)
          .join("rect")
          .attr("x", 0)
          .attr("y", d => y(d.Generation))
          .attr("height", y.bandwidth() / 2)
          .attr("width", d => x(d["2023"]))
          .attr("fill", color("2023"))
          .attr("class", "bar bar-2023")
          .on("mouseover", function(event, d) {
            resetAllStyles();
            handleBarHover(this, "2023", d.Generation);
            showDialogue();
          
            tooltip
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 20) + "px")
              .style("display", "block")
              .html(`<strong>${d.Generation}</strong><br>2023: ${d["2023"]}%`);
          })
          .on("mousemove", function(event) {
            tooltip
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 20) + "px");
          })
          .on("mouseout", function() {
            resetAllStyles();
            tooltip.style("display", "none");
          });
          
  
        // ✅ 2024 条
        g.selectAll("rect.bar-2024")
          .data(data)
          .join("rect")
          .attr("x", 0)
          .attr("y", d => y(d.Generation) + y.bandwidth() / 2)
          .attr("height", y.bandwidth() / 2)
          .attr("width", d => x(d["2024"]))
          .attr("fill", color("2024"))
          .attr("class", "bar bar-2024")
          .on("mouseover", function(event, d) {
            resetAllStyles();
            handleBarHover(this, "2024", d.Generation);
            showDialogue();
          
            tooltip
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 20) + "px")
              .style("display", "block")
              .html(`<strong>${d.Generation}</strong><br>2024: ${d["2024"]}%`);
          })
          .on("mousemove", function(event) {
            tooltip
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 20) + "px");
          })
          .on("mouseout", function() {
            resetAllStyles();
            tooltip.style("display", "none");
          });
          
  
        // ✅ 数值标签（使用对应颜色）
        g.selectAll("text.label-2023")
          .data(data)
          .join("text")
          .attr("x", d => x(d["2023"]) + 6)
          .attr("y", d => y(d.Generation) + y.bandwidth() * 0.3)
          .attr("class", "label label-2023")
          .text(d => `${d["2023"]}%`)
          .style("font-size", "14px")
          .style("fill", color("2023"))
          .style("font-family", "'Courier New', monospace");
  
        g.selectAll("text.label-2024")
          .data(data)
          .join("text")
          .attr("x", d => x(d["2024"]) + 6)
          .attr("y", d => y(d.Generation) + y.bandwidth() * 0.8)
          .attr("class", "label label-2024")
          .text(d => `${d["2024"]}%`)
          .style("font-size", "14px")
          .style("fill", color("2024"))
          .style("font-family", "'Courier New', monospace");
  
        // ✅ 图例 → 右上角 + 间距24px，悬浮高亮
        const legend = svg.append("g")
          .attr("transform", `translate(${width - 180}, 12)`); //图例位置
  
        ["2023", "2024"].forEach((key, i) => {
          const baseColor = color(key);
          const group = legend.append("g")
            .attr("transform", `translate(${i * 80 }, 0)`) //图例间距
            .style("cursor", "pointer")
            .on("mouseover", () => {
              d3.selectAll(".bar").attr("opacity", 0.2);
              d3.selectAll(`.bar-${key}`)
                .attr("opacity", 1);
              d3.selectAll(`.label-${key}`).style("font-weight", "bold");
              d3.select(`#legend-text-${key}`)
                .style("font-weight", "bold");
            })
            .on("mouseout", resetAllStyles);
  
          group.append("rect")
            .datum(key)
            .attr("id", `legend-rect-${key}`)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 12)
            .attr("height", 12)
            .attr("class", "legend-rect")
            .attr("fill", baseColor);
  
          group.append("text")
            .attr("id", `legend-text-${key}`)
            .attr("x", 18)
            .attr("y", 10)
            .attr("class", "legend-text")
            .text(key)
            .style("font-size", "14px")
            .style("font-family", "'Courier New', monospace");
        });
  
        resolve();
      });
    });
  }
  
  
};
