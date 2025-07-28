if (!window.chartRenderers) {
  window.chartRenderers = {};
}

chartRenderers[5] = function(titleText, dataPath, chartArea) {
  const width = 700;
  const height = 428;
  const margin = { top: 40, right: 30, bottom: 40, left: 260 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  let hasShownChart5Dialogue = false;

  function showChart5DialogueImage() {
    if (hasShownChart5Dialogue) return;
    hasShownChart5Dialogue = true;

    const img = document.getElementById("dialogue-box2");
    if (img) {
      img.style.display = "block";
      document.addEventListener("click", () => {
        img.style.display = "none";
      }, { once: true });
    }
  }

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
        .padding(0.55);

      const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, innerWidth]);

      const stackedData = d3.stack().keys(subgroups)(data);

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
          .filter(d => d === labelOriginal)
          .style("font-weight", "bold");
      }

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

          // ✅ 触发对话切图
          showChart5DialogueImage();
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
          resetAllStyles();
        });

      const yAxis = g.append("g").call(d3.axisLeft(y));

      yAxis.selectAll("text")
        .attr("class", "y-axis-label")
        .attr("dy", "0.35em")
        .style("font-family", "'Courier New', monospace")
        .style("font-size", "13px")
        .style("fill", "#000")
        .style("text-anchor", "end")
        .call(wrapText, 240);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Courier New', monospace");

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
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const yPos = +text.attr("y") || 0;
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


chartRenderers[6] = function(titleText, dataPath, chartArea) {
  const width = 700;
  const height = 428;
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const colorMap = {
    "Not Exposed": "#d5d4c5",
    "Minimal Exposure": "#7da273",
    "Gradient 1": "#4b89c1",
    "Gradient 2": "#1f4e79",
    "Gradient 3": "#a07b3b",
    "Gradient 4": "#943434"
  };

  const shapeMap = {
    "Not Exposed": d3.symbolCross,
    "Minimal Exposure": d3.symbolCircle,
    "Gradient 1": d3.symbolSquare,
    "Gradient 2": d3.symbolTriangle,
    "Gradient 3": d3.symbolDiamond,
    "Gradient 4": d3.symbolCircle
  };

  const labelMap = {
    "Not Exposed": "Not Exposed",
    "Minimal Exposure": "Minimal Exposure",
    "Gradient 1": "Low Exposure",
    "Gradient 2": "Moderate Exposure",
    "Gradient 3": "High Exposure",
    "Gradient 4": "Very High Exposure"
  };

  const tooltipMap = {
    "Not Exposed": "Very low exposure to AI",
    "Minimal Exposure": "Minor AI involvement in tasks",
    "Gradient 1": "Low exposure: Some tasks can be augmented",
    "Gradient 2": "Moderate exposure to AI",
    "Gradient 3": "High exposure: Tasks may be significantly altered",
    "Gradient 4": "Very high exposure: Tasks are highly automatable"
  };

  return new Promise(resolve => {
    d3.csv(dataPath).then(data => {
      data.forEach(d => {
        d.mean_score_2025 = +d.mean_score_2025;
        d.SD_2025 = +d.SD_2025;
      });

      const svg = chartArea.append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.mean_score_2025) + 0.05])
        .range([0, innerWidth]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.SD_2025) + 0.02])
        .range([innerHeight, 0]);

      const symbol = d3.symbol().size(60);

      // Tooltip
      const tooltip = d3.select("body").append("div")
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

      const dots = g.selectAll("path")
        .data(data)
        .join("path")
        .attr("transform", d => `translate(${x(d.mean_score_2025)},${y(d.SD_2025)})`)
        .attr("d", d => symbol.type(shapeMap[d.Exposure])())
        .attr("fill", d => colorMap[d.Exposure])
        .attr("class", d => `dot-${d.Exposure.replace(/\s/g, "-")}`)
        .attr("opacity", 0.9)
        .on("mouseover", function(event, d) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px")
            .style("display", "block")
            .html(`<strong>${d.Title}</strong><br>${tooltipMap[d.Exposure]}`);
        
          d3.select(this)
            .transition()
            .duration(100)
            .attr("d", d3.symbol().type(shapeMap[d.Exposure]).size(150)()); // 放大
        })
        .on("mouseout", function(event, d) {
          tooltip.style("display", "none");
        
          d3.select(this)
            .transition()
            .duration(100)
            .attr("d", d3.symbol().type(shapeMap[d.Exposure]).size(60)()); // 恢复默认大小
        });

      // X Axis
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(6))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Courier New', monospace");

      // Y Axis
      g.append("g")
        .call(d3.axisLeft(y).ticks(6))
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "'Courier New', monospace");

      // Axis labels with hover explanations
      svg.append("text")
        .attr("x", margin.left + innerWidth / 2)
        .attr("y", height - 5)
        .attr("text-anchor", "middle")
        .text("AI Compatibility (mean task score)")
        .style("font-family", "'Courier New', monospace")
        .style("font-size", "12px")
        .on("mouseover", function(event) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px")
            .style("display", "block")
            .html("Jobs further to the right involve tasks AI can easily handle.");
        })
        .on("mouseout", function() {
          tooltip.style("display", "none");
        });        

      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .text("Task Diversity (standard deviation)")
        .style("font-family", "'Courier New', monospace")
        .style("font-size", "12px")
        .on("mouseover", function(event) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px")
            .style("display", "block")
            .html("Jobs higher up are more varied and harder to generalize.");
        })
        .on("mouseout", function() {
          tooltip.style("display", "none");
        });        

      // Legend with highlight interaction
      const legend = svg.append("g")
        .attr("transform", `translate(${width - 160}, 10)`)
        .style("font-family", "'Courier New', monospace");

      const exposureTypes = Object.keys(colorMap);
      exposureTypes.forEach((key, i) => {
        const gL = legend.append("g")
          .attr("transform", `translate(0, ${i * 22})`)
          .style("cursor", "pointer")
          .on("mouseover", function(event) {
            tooltip
              .style("left", event.pageX + 12 + "px")
              .style("top", event.pageY - 10 + "px")
              .style("display", "block")
              .html(`<strong>${labelMap[key]}</strong><br>${tooltipMap[key]}`);
          
            // 图中其他点暗淡
            d3.selectAll("path").attr("opacity", 0.1);
            d3.selectAll(`.dot-${key.replace(/\s/g, "-")}`).attr("opacity", 1);
          
            // 图例高亮
            d3.select(this).select("text").style("font-weight", "bold");
            d3.select(this).select("path").attr("opacity", 1); // 保持图例色块不淡出
          })
          .on("mouseout", function() {
            tooltip.style("display", "none");
          
            // 恢复所有点
            d3.selectAll("path").attr("opacity", 0.9);
          
            // 图例恢复
            d3.select(this).select("text").style("font-weight", "normal");
            d3.select(this).select("path").attr("opacity", 1); // 再次显式设置
          });
          

        gL.append("path")
          .attr("d", d3.symbol().type(shapeMap[key]).size(50)())
          .attr("fill", colorMap[key])
          .attr("transform", "translate(0, 6)");

        gL.append("text")
          .attr("x", 15)
          .attr("y", 10)
          .text(labelMap[key])
          .style("font-size", "12px");
      });

      resolve();
    });
  });
};

chartRenderers[7] = function(titleText, dataPath, chartArea, gender = "Total") {
  const width = 680;
  const height = 380;
  const margin = { top: 40, right: 20, bottom: 60, left: 80 }; // 上下margin略微收紧
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const colorMap = {
    "Gradient1": "#4b89c1",
    "Gradient2": "#1f4e79",
    "Gradient3": "#a07b3b",
    "Gradient4": "#943434"
  };

  const labelMap = {
    "Gradient1": "Low Exposure",
    "Gradient2": "Moderate Exposure",
    "Gradient3": "High Exposure",
    "Gradient4": "Very High Exposure"
  };

  const incomeLabelShort = {
    "High income": "High",
    "Upper-middle income": "Upper-middle",
    "Lower-middle income": "Lower-middle",
    "Low income": "Low"
  };

  const tooltip = d3.select("body").append("div")
    .attr("class", "bar-tooltip")
    .style("position", "absolute")
    .style("z-index", "9999")
    .style("background", "#2a2a2a")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("font-size", "13px")
    .style("font-family", "'Courier New', monospace")
    .style("border-radius", "6px")
    .style("display", "none");

  return new Promise(resolve => {
    d3.csv(dataPath).then(raw => {
      const allGradients = Object.keys(colorMap);

      const svg = chartArea.append("svg")
        .attr("width", width)
        .attr("height", height);

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      function draw(selectedGender) {
        g.selectAll("*").remove();

        const data = raw.filter(d => d.Gender === selectedGender);
        const subgroups = allGradients;
        const groups = data.map(d => d.IncomeLevel);

        const x = d3.scaleBand()
          .domain(groups)
          .range([0, innerWidth])
          .padding(0.55); // ✅ 柱子更细

        const y = d3.scaleLinear()
          .domain([0, 50])
          .range([innerHeight, 0]);

        const stackedData = d3.stack().keys(subgroups)(data);

        // 柱状图
        g.append("g")
          .selectAll("g")
          .data(stackedData)
          .join("g")
          .attr("fill", d => colorMap[d.key])
          .selectAll("rect")
          .data(d => d)
          .join("rect")
          .attr("class", d => `stack-bar bar-${d.data.IncomeLevel.replace(/\s/g, "-")}`)
          .attr("x", d => x(d.data.IncomeLevel))
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth())
          .on("mouseover", function(event, d) {
            const key = d3.select(this.parentNode).datum().key;
            const level = d.data.IncomeLevel;
            const levelClass = `.bar-${level.replace(/\s/g, "-")}`;

            tooltip
              .html(`<strong>${labelMap[key]}</strong><br>${(d[1] - d[0]).toFixed(1)}%<br><br><em>${d.data.TotalJobsMillions} million jobs</em>`)
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 10 + "px")
              .style("display", "block");

            // ✅ 当前柱高亮，其他淡出
            g.selectAll(".stack-bar").attr("opacity", 0.2);
            g.selectAll(levelClass).attr("opacity", 1);

            // ✅ 顶部总值加粗
            g.selectAll(".bar-label").style("font-weight", "normal");
            g.selectAll(`.label-${level.replace(/\s/g, "-")}`).style("font-weight", "bold");

            // ✅ x轴加粗
            g.selectAll(".x-axis-label").style("font-weight", "normal");
            g.selectAll(".x-axis-label")
              .filter(function() {
                return d3.select(this).text() === (incomeLabelShort[level] || level);
              })
              .style("font-weight", "bold");
          })
          .on("mouseout", () => {
            tooltip.style("display", "none");
            g.selectAll(".stack-bar").attr("opacity", 1);
            g.selectAll(".bar-label").style("font-weight", "normal");
            g.selectAll(".x-axis-label").style("font-weight", "normal");
          });

        // 顶部累计值标签
        data.forEach(d => {
          const total = allGradients.reduce((sum, key) => sum + (+d[key] || 0), 0);
          const xPos = x(d.IncomeLevel) + x.bandwidth() / 2;
          const yPos = y(total) - 6;
          const className = `label-${d.IncomeLevel.replace(/\s/g, "-")}`;

          g.append("text")
            .attr("class", `bar-label ${className}`)
            .attr("x", xPos)
            .attr("y", yPos)
            .attr("text-anchor", "middle")
            .text(`${total.toFixed(1)}%`)
            .style("font-size", "14px")
            .style("fill", "#000")
            .style("font-family", "'Courier New', monospace");
        });

        // x 轴
        g.append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x).tickFormat(d => incomeLabelShort[d] || d))
          .selectAll("text")
          .attr("class", "x-axis-label")
          .style("font-size", "12px")
          .style("font-family", "'Courier New', monospace");

        // x轴标签
        svg.append("text")
          .attr("x", margin.left + innerWidth / 2)
          .attr("y", height - 20)
          .attr("text-anchor", "middle")
          .text("Income Level")
          .style("font-size", "13px")
          .style("font-family", "'Courier New', monospace");

        // y 轴
        g.append("g")
          .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"))
          .selectAll("text")
          .style("font-size", "12px")
          .style("font-family", "'Courier New', monospace");

        // y轴标签
        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", 18)
          .attr("text-anchor", "middle")
          .text("Share of employment (%)")
          .style("font-size", "13px")
          .style("font-family", "'Courier New', monospace");

        // 图例向右靠
        const legend = svg.append("g")
          .attr("transform", `translate(${width - margin.right - 630}, -2)`)
          .style("font-family", "'Courier New', monospace");

        let offsetX = 0;
        Object.entries(labelMap).forEach(([key, label]) => {
          const gL = legend.append("g")
            .attr("transform", `translate(${offsetX}, 0)`);

          gL.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", colorMap[key]);

          gL.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(label)
            .style("font-size", "13px");

          offsetX += gL.node().getBBox().width + 30;
        });
      }

      draw(gender);
      resolve();
    });
  });
};



