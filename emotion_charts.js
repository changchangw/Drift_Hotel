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
            .style("font-size", "11px")
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
            .style("font-size", "11px")
            .style("fill", "#000")
            .style("font-family", "'Courier New', monospace")
            .text(d.text);
        });
  
        resolve();
      });
    });
  }
  
  
  
};
