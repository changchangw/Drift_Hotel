// 图表渲染函数集合
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

  // 可以继续添加更多图表类型
  2: function renderEmotionMap(title, dataPath, chartArea) {
    return new Promise(resolve => {
      const width = 680, height = 428;
  
      const projection = d3.geoMercator()
        .scale(100)
        .translate([width / 2, height / 1.5]);
  
      const path = d3.geoPath().projection(projection);
  
      // 创建 tooltip（固定层级高）
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
  
        // 使用 excited/(excited + nervous) 比例控制混色
        function getEmotionColor(excited, nervous) {
          const diff = excited - nervous;
          const normalized = (diff + 100) / 200; // 转为 0~1 区间
        
          return d3.interpolateRgb(
            d3.rgb(60, 180, 60),   // green
            d3.rgb(180, 40, 40)    // red
          )(normalized);
        }
  
        // 渐变图例（竖直）
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
          .attr("id", "legend-gradient")
          .attr("x1", "0%").attr("y1", "0%")
          .attr("x2", "0%").attr("y2", "100%");
  
        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", getEmotionColor(100, 0)); // Excited
        gradient.append("stop")
          .attr("offset", "50%")
          .attr("stop-color", getEmotionColor(50, 50)); // Balanced
        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", getEmotionColor(0, 100)); // Nervous
  
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
            //.style("font-weight", "bold")
            .text(d.text);
        });
  
        // 地图主体
        svg.append("g")
          .selectAll("path")
          .data(world.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            const val = emotionMap.get(d.properties.name);
            if (!val) return "#fff";
            return getEmotionColor(val.excited, val.nervous);
          })
          .attr("stroke", "#999")
          .attr("stroke-width", 0.5)
          .on("mouseover", function (event, d) {
            const val = emotionMap.get(d.properties.name);
            if (!val) return;
  
            d3.select(this)
              .attr("fill", getEmotionColor(val.excited * 1.05, val.nervous * 1.05)); // 稍微加亮
  
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
              .attr("fill", val ? getEmotionColor(val.excited, val.nervous) : "#fff");
  
            tooltip.style("display", "none");
          });
  
        resolve();
      });
    });
  }
  
  
  
  
  // 2: function(titleText, dataPath, chartArea) { /* 柱状图 */ },
  // 3: function(titleText, dataPath, chartArea) { /* 折线图 */ },
  // 4: function(titleText, dataPath, chartArea) { /* 饼图 */ }
}; 