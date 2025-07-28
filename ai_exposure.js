if (!window.chartRenderers) {
  window.chartRenderers = {};
}

chartRenderers[5] = function(titleText, dataPath, chartArea) {
  const width = 700;
  const height = 428;
  const margin = { top: 40, right: 30, bottom: 40, left: 260 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  return new Promise(resolve => {
    d3.csv(dataPath).then(data => {
      const svg = chartArea.append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const subgroups = data.columns.slice(1);
      const groups = data.map(d => d.Occupation);

      const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(["#40222c", "#674c34", "#445546", "#7b7e3f", "#d8b958"]);

      const y = d3.scaleBand()
        .domain(groups)
        .range([0, innerHeight])
        .padding(0.55); // 跟chart4一致

      const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, innerWidth]);

      const stackedData = d3.stack().keys(subgroups)(data);

      // ✅ tooltip 层级提升
      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "bar-tooltip")
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

      function resetAllStyles() {
        d3.selectAll(".stack-bar").attr("opacity", 1);
        d3.selectAll(".y-axis-label").style("font-weight", "normal");
      }

      function handleBarHover(labelClass, labelOriginal) {
        d3.selectAll(".stack-bar").attr("opacity", 0.2);
        d3.selectAll(`.bar-${labelClass}`).attr("opacity", 1);
      
        d3.selectAll(".y-axis-label")
          .filter(d => d === labelOriginal) // ✅ 用原始标签匹配
          .style("font-weight", "bold");
      }
      

      // ✅ 绘制堆叠条形图
      g.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("class", d => `stack-bar bar-${d.data.Occupation.replace(/[^a-zA-Z]/g, "")}`)
        .attr("y", d => y(d.data.Occupation))
        .attr("x", d => x(d[0]))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d[1]) - x(d[0]))
        .on("mouseover", function(event, d) {
          const subgroup = d3.select(this.parentNode).datum().key;
          const occupation = d.data.Occupation;
          handleBarHover(occupation.replace(/[^a-zA-Z]/g, ""), occupation);

          tooltip
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY - 10 + "px")
            .style("display", "block")
            .html(`<strong>${subgroup}</strong>: ${(d[1] - d[0]).toFixed(1)}%`);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
          resetAllStyles();
        });

      // ✅ Y轴：支持换行 & 右对齐
      const yAxis = g.append("g").call(d3.axisLeft(y));

      yAxis.selectAll("text")
        .attr("class", "y-axis-label")
        .attr("dy", "0.35em") // ✅ 1️⃣ 垂直居中
        .style("font-family", "'Courier New', monospace")
        .style("font-size", "13px")
        .style("fill", "#000")
        .style("text-anchor", "end")
        .call(wrapText, 240);

      // X轴
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Courier New', monospace");

      // ✅ 图例：不等宽排列 + tooltip 全称
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 490}, 10)`)
        .style("font-family", "'Courier New', monospace");

      const legendEntries = [
        { label: "Never", full: "Never (not at all)" },
        { label: "Rarely", full: "Rarely (a few times a year)" },
        { label: "Sometimes", full: "Sometimes (a few times a month)" },
        { label: "Often", full: "Often (a few times a week)" },
        { label: "Very often", full: "Very often (daily)" }
      ];

      let offsetX = 0;
      legendEntries.forEach((entry, i) => {
        const gL = legend.append("g")
          .attr("transform", `translate(${offsetX}, 0)`)
          .style("cursor", "default")
          .on("mouseover", function(event) {
            tooltip
              .style("left", event.pageX + 12 + "px")
              .style("top", event.pageY - 10 + "px")
              .style("display", "block")
              .html(entry.full);
          })
          .on("mouseout", () => tooltip.style("display", "none"));

        gL.append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", color(entry.full));

        const text = gL.append("text")
          .attr("x", 18)
          .attr("y", 10)
          .text(entry.label)
          .style("font-size", "13px");

        offsetX += text.node().getBBox().width + 42;
      });

      resolve();
    });

    function wrapText(texts, width) {
      texts.each(function () {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse(); // ✅ 修复这里
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const yPos = +text.attr("y") || 0; // ✅ 使用 text 元素原本的 y 值
        const dy = 0;
    
        let tspan = text.text(null)
          .append("tspan")
          .attr("x", -10)
          .attr("y", yPos)
          .attr("dy", `${dy}em`);
    
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan")
              .attr("x", -10)
              .attr("y", yPos)
              .attr("dy", `${++lineNumber * lineHeight + dy}em`)
              .text(word);
          }
        }
      });
    }
    
  });
};
