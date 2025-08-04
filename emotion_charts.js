// emotion_charts.js

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
        data.forEach(d => d.Count = +d.Count);

        // 根据实际CSV数据定义正面和消极词汇列表
        const positiveWords = ["good", "optimistic", "excited", "hopeful", "helpful", "useful", "innovative", "interested", "smart", "positive", "great", "interesting", "intrigued", "curious"];
        const negativeWords = ["scary", "worried", "unsure", "concerned", "cautious", "dangerous", "nervous", "wary", "apprehensive", "sceptical", "indifferent", "confused", "uncertain", "uneasy", "suspicious", "bad", "anxious", "fake", "untrustworthy", "negative"];

        d3.layout.cloud()
          .size([width, height])
          .words(data.map(d => ({
            text: d.Item,
            size: d.Count / 4 + 10,
            count: d.Count,
            isPositive: positiveWords.includes(d.Item.toLowerCase()),
            isNegative: negativeWords.includes(d.Item.toLowerCase())
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

          // 创建tooltip
          const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip");

          g.selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => (d.size + 2) + "px")
            .style("fill", d => {
              if (d.isPositive) return "#000000";
              if (d.isNegative) return "rgb(141, 26, 26)";
              return "#150D04"; // 默认颜色
            })
            .style("font-family", "Anton")
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
            .text(d => d.text)
            .style("cursor", "pointer") // 添加鼠标手型
            .on("mouseover", function(event, d) {
              // 悬浮位移效果
              d3.select(this)
                .transition()
                .duration(200)
                .attr("transform", `translate(${d.x + 2},${d.y - 2}) rotate(${d.rotate})`);
              
              // 显示tooltip
              tooltip
                .style("display", "block")
                .html(`<strong>${d.text}</strong><br>Frequency: ${d.count}`);
              positionTooltip(tooltip, event, 10, 20);
            })
            .on("mouseout", function(event, d) {
              // 恢复原位置
              d3.select(this)
                .transition()
                .duration(200)
                .attr("transform", `translate(${d.x},${d.y}) rotate(${d.rotate})`);
              
              // 隐藏tooltip
              tooltip.style("display", "none");
            });

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
        .attr("class", "tooltip");

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
            d3.rgb(0, 46, 111),
            d3.rgb(252, 67, 15),
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
            .call(applyAxisLabel)
            .style("fill", "#000")
            .text(d.text);
        });
  

        
        // 定义中国的相关地区
        const chinaRegions = ["China", "Taiwan"];
        
        // 高亮中国相关地区的函数
        function highlightChinaRegions(baseColor) {
          d3.selectAll("path")
            .filter(function(d) {
              return chinaRegions.includes(d.properties.name);
            })
            .attr("fill", getHighlightColor(baseColor));
        }
        
        // 恢复中国相关地区颜色的函数
        function resetChinaRegions() {
          d3.selectAll("path")
            .filter(function(d) {
              return chinaRegions.includes(d.properties.name);
            })
            .attr("fill", function(d) {
              // 如果是Taiwan，使用China的数据
              let countryName = d.properties.name;
              if (countryName === "Taiwan") {
                countryName = "China";
              }
              const val = emotionMap.get(countryName);
              return val ? getEmotionColor(val.excited, val.nervous) : "#f2f0e9";
            });
        }
        
        svg.append("g")
          .selectAll("path")
          .data(world.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            // 如果是Taiwan，使用China的数据
            let countryName = d.properties.name;
            if (countryName === "Taiwan") {
              countryName = "China";
            }
            // 处理Great Britain的名称映射
            if (countryName === "United Kingdom") {
              countryName = "Great Britain";
            }
            // 处理United States的名称映射
            if (countryName === "United States of America") {
              countryName = "United States";
            }
            const val = emotionMap.get(countryName);
            return val ? getEmotionColor(val.excited, val.nervous) : "#f2f0e9";
          })
          .attr("stroke", "#999")
          .attr("stroke-width", 0.5)
          .on("mouseover", function (event, d) {
            // 如果是Taiwan，使用China的数据
            let countryName = d.properties.name;
            if (countryName === "Taiwan") {
              countryName = "China";
            }
            // 处理Great Britain的名称映射
            if (countryName === "United Kingdom") {
              countryName = "Great Britain";
            }
            // 处理United States的名称映射
            if (countryName === "United States of America") {
              countryName = "United States";
            }
            const val = emotionMap.get(countryName);
            if (!val) return;
          
            const baseColor = getEmotionColor(val.excited, val.nervous);
            
            // 如果是中国相关地区，同时高亮
            if (chinaRegions.includes(d.properties.name)) {
              highlightChinaRegions(baseColor);
            } else {
              d3.select(this)
                .attr("fill", getHighlightColor(baseColor));
            }
          
            tooltip
              .style("display", "block")
              .html(`<strong>${d.properties.name === "Taiwan" ? "China" : (d.properties.name === "United States of America" ? "United States" : d.properties.name)}</strong><br>
  Excited: ${val.excited}%<br>
  Nervous: ${val.nervous}%`);
            positionTooltip(tooltip, event, 15, 20);
          })
          .on("mousemove", function (event) {
            positionTooltip(tooltip, event, 15, 20);
          })
          .on("mouseout", function (event, d) {
            // 如果是中国相关地区，同时恢复
            if (chinaRegions.includes(d.properties.name)) {
              resetChinaRegions();
            } else {
              // 如果是Taiwan，使用China的数据
              let countryName = d.properties.name;
              if (countryName === "Taiwan") {
                countryName = "China";
              }
              // 处理Great Britain的名称映射
              if (countryName === "United Kingdom") {
                countryName = "Great Britain";
              }
              // 处理United States的名称映射
              if (countryName === "United States of America") {
                countryName = "United States";
              }
              const val = emotionMap.get(countryName);
              d3.select(this)
                .attr("fill", val ? getEmotionColor(val.excited, val.nervous) : "#f2f0e9");
            }
          
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
        .attr("class", "tooltip");

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
  
        // 颜色比例尺（蓝色系）
        const colorScale = d3.scaleLinear()
          .domain([0, 100])
          .range(["#aac9e6", "#0a203e"]);
        
        // 定义中国的相关地区
        const chinaRegions = ["China", "Taiwan"];
        
        // 高亮中国相关地区的函数
        function highlightChinaRegions(baseColor) {
          d3.selectAll("path")
            .filter(function(d) {
              return chinaRegions.includes(d.properties.name);
            })
            .attr("fill", getHighlightColor(baseColor));
        }
        
        // 恢复中国相关地区颜色的函数
        function resetChinaRegions() {
          d3.selectAll("path")
            .filter(function(d) {
              return chinaRegions.includes(d.properties.name);
            })
            .attr("fill", function(d) {
              // 如果是Taiwan，使用China的数据
              let countryName = d.properties.name;
              if (countryName === "Taiwan") {
                countryName = "China";
              }
              // 处理Great Britain的名称映射
              if (countryName === "United Kingdom") {
                countryName = "Great Britain";
              }
              // 处理United States的名称映射
              if (countryName === "United States of America") {
                countryName = "United States";
              }
              const val = valueMap.get(countryName);
              return val !== undefined ? colorScale(val) : "#F2F0E9";
            });
        }
        
        // 添加地图路径
        svg.selectAll("path")
          .data(worldData.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            // 如果是Taiwan，使用China的数据
            let countryName = d.properties.name;
            if (countryName === "Taiwan") {
              countryName = "China";
            }
            // 处理Great Britain的名称映射
            if (countryName === "United Kingdom") {
              countryName = "Great Britain";
            }
            // 处理United States的名称映射
            if (countryName === "United States of America") {
              countryName = "United States";
            }
            const val = valueMap.get(countryName);
            return val !== undefined ? colorScale(val) : "#F2F0E9"; // 无数据的国家颜色
          })
          .attr("stroke", "#888")
          .attr("stroke-width", 0.5)
          .on("mouseover", function (event, d) {
            // 如果是Taiwan，使用China的数据
            let countryName = d.properties.name;
            if (countryName === "Taiwan") {
              countryName = "China";
            }
            // 处理Great Britain的名称映射
            if (countryName === "United Kingdom") {
              countryName = "Great Britain";
            }
            // 处理United States的名称映射
            if (countryName === "United States of America") {
              countryName = "United States";
            }
            const val = valueMap.get(countryName);
            if (val === undefined) return;
          
            const baseColor = colorScale(val);
            
            // 如果是中国相关地区，同时高亮
            if (chinaRegions.includes(d.properties.name)) {
              highlightChinaRegions(baseColor);
            } else {
              d3.select(this)
                .attr("fill", getHighlightColor(baseColor)); // hover 变亮
            }
          
            tooltip
              .style("display", "block")
              .html(`<strong>${d.properties.name === "Taiwan" ? "China" : (d.properties.name === "United States of America" ? "United States" : d.properties.name)}</strong><br>${key}: ${val}%`);
            positionTooltip(tooltip, event, 15, 20);
          })
          .on("mousemove", function (event) {
            positionTooltip(tooltip, event, 15, 20);
          })
          .on("mouseout", function (event, d) {
            // 如果是中国相关地区，同时恢复
            if (chinaRegions.includes(d.properties.name)) {
              resetChinaRegions();
            } else {
              // 如果是Taiwan，使用China的数据
              let countryName = d.properties.name;
              if (countryName === "Taiwan") {
                countryName = "China";
              }
              // 处理Great Britain的名称映射
              if (countryName === "United Kingdom") {
                countryName = "Great Britain";
              }
              // 处理United States的名称映射
              if (countryName === "United States of America") {
                countryName = "United States";
              }
              const val = valueMap.get(countryName);
              d3.select(this)
                .attr("fill", val !== undefined ? colorScale(val) : "#f2f2f2");
            }
  
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
            .call(applyAxisLabel)
            .style("fill", "#000")
            .text(d.text);
        });
  
        resolve();
      });
    });
  },

  4: function(titleText, dataPath, chartArea) {
    return new Promise(resolve => {
      const width = 720, height = 400; // 减少高度从428到380
      const margin = { top: 20, right: 50, bottom: 60, left: 120 }; // 增加底部边距从30到60
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      
  
      d3.csv(dataPath).then(data => {
        // ✅ 生成 tooltip 元素（只执行一次）
        const tooltip = d3.select("body")
        .append("div")
        .attr("id", "generation-tooltip")
        .attr("class", "tooltip");

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
          .range(["#a26d42", "#3e6b6e"]);
  
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

  
        // Y轴（世代标签）
        g.append("g")
          .call(d3.axisLeft(y))
          .selectAll("text")
          .attr("class", "y-axis-label")
          .call(applyChartFont, 'medium')
          .style("fill", "#000");

        // X轴（百分比）
        g.append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x).ticks(7).tickFormat(d => d + "%"))
          .selectAll("text")
          .call(applyAxisLabel, 'medium');

        // X轴标签
        svg.append("text")
          .attr("x", margin.left + innerWidth / 2)
          .attr("y", height - 10) // 从height-20改为height-10，让标签更靠近底部
          .attr("text-anchor", "middle")
          .text("% of respondents agreeing with statement")
          .call(applyAxisLabel, 'medium');

  
        g.selectAll("line.bg-line")
          .data(generations)
          .join("line")
          .attr("x1", 0)
          .attr("x2", innerWidth)
          .attr("y1", d => y(d) + y.bandwidth() / 2)
          .attr("y2", d => y(d) + y.bandwidth() / 2)
          .attr("stroke", "#ddd")
          .attr("stroke-dasharray", "2,2");
  
        // ✅ 2024 条
        g.selectAll("rect.bar-2024")
          .data(data)
          .join("rect")
          .attr("x", 0)
          .attr("y", d => y(d.Generation))
          .attr("height", y.bandwidth() / 2)
          .attr("width", d => x(d["2024"]))
          .attr("fill", color("2024"))
          .attr("class", "bar bar-2024")
          .on("mouseover", function(event, d) {
            resetAllStyles();
            // 所有条条先变暗淡
            d3.selectAll(".bar").attr("opacity", 0.2);
            // 高亮当前generation的两条条
            d3.selectAll(`.bar-2023, .bar-2024`)
              .filter(bar => bar.Generation === d.Generation)
              .attr("opacity", 1);
            // 当前generation的标签加粗
            d3.selectAll(".y-axis-label")
              .filter(label => label === d.Generation)
              .style("font-weight", "bold");
            d3.selectAll(`.label-2023, .label-2024`)
              .filter(label => label.Generation === d.Generation)
              .style("font-weight", "bold");
            const generationBirthYears = {
              "Gen Z": "Born 1997–2012",
              "Millennial": "Born 1981–1996",
              "Gen X": "Born 1965–1980",
              "Baby boomer": "Born 1946–1964"
            };
            const birthYearText = generationBirthYears[d.Generation] || "";

            tooltip
              .style("display", "block")
              .html(`<strong>${d.Generation}</strong><br>${birthYearText}<br>2024: ${d["2024"]}%<br>2023: ${d["2023"]}%`);
            positionTooltip(tooltip, event, 10, 20);
          })
          .on("mousemove", function(event) {
            positionTooltip(tooltip, event, 10, 20);
          })
          .on("mouseout", function() {
            resetAllStyles();
            tooltip.style("display", "none");
          });
          
  
        // ✅ 2023 条
        g.selectAll("rect.bar-2023")
          .data(data)
          .join("rect")
          .attr("x", 0)
          .attr("y", d => y(d.Generation) + y.bandwidth() / 2)
          .attr("height", y.bandwidth() / 2)
          .attr("width", d => x(d["2023"]))
          .attr("fill", color("2023"))
          .attr("class", "bar bar-2023")
          .on("mouseover", function(event, d) {
            resetAllStyles();
            // 所有条条先变暗淡
            d3.selectAll(".bar").attr("opacity", 0.2);
            // 高亮当前generation的两条条
            d3.selectAll(`.bar-2023, .bar-2024`)
              .filter(bar => bar.Generation === d.Generation)
              .attr("opacity", 1);
            // 当前generation的标签加粗
            d3.selectAll(".y-axis-label")
              .filter(label => label === d.Generation)
              .style("font-weight", "bold");
            d3.selectAll(`.label-2023, .label-2024`)
              .filter(label => label.Generation === d.Generation)
              .style("font-weight", "bold");
            const generationBirthYears = {
              "Gen Z": "Born 1997–2012",
              "Millennial": "Born 1981–1996",
              "Gen X": "Born 1965–1980",
              "Baby boomer": "Born 1946–1964"
            };
            const birthYearText = generationBirthYears[d.Generation] || "";

            tooltip
              .style("display", "block")
              .html(`<strong>${d.Generation}</strong><br>${birthYearText}<br>2024: ${d["2024"]}%<br>2023: ${d["2023"]}%`);
            positionTooltip(tooltip, event, 10, 20);
          })
          .on("mousemove", function(event) {
            positionTooltip(tooltip, event, 10, 20);
          })
          .on("mouseout", function() {
            resetAllStyles();
            tooltip.style("display", "none");
          });
          
  
        // ✅ 数值标签（使用对应颜色）
        g.selectAll("text.label-2024")
          .data(data)
          .join("text")
          .attr("x", d => x(d["2024"]) + 6)
          .attr("y", d => y(d.Generation) + y.bandwidth() * 0.3)
          .attr("class", "label label-2024")
          .text(d => `${d["2024"]}%`)
          .call(applyChartFont, 'medium')
          .style("fill", color("2024"));
  
        g.selectAll("text.label-2023")
          .data(data)
          .join("text")
          .attr("x", d => x(d["2023"]) + 6)
          .attr("y", d => y(d.Generation) + y.bandwidth() * 0.8)
          .attr("class", "label label-2023")
          .text(d => `${d["2023"]}%`)
          .call(applyChartFont, 'medium')
          .style("fill", color("2023"));
  
        // ✅ 图例 → 右上角 + 间距24px，悬浮高亮
        const legend = svg.append("g")
          .attr("transform", `translate(${width - 180}, 0)`); //图例位置
  
        ["2024", "2023"].forEach((key, i) => {
          const baseColor = color(key);
          const group = legend.append("g")
            .attr("transform", `translate(${i * 80 }, 0)`) //图例间距
            .call(applyInteractive)
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
                        .call(applyChartFont, 'large');
        });

        // 5秒后显示dialogue1
        showDialogueWithDelay("dialogue-box", 5000);

        resolve();
      });
    });
  }
  
  
};
