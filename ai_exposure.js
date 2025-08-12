if (!window.chartRenderers) {
  window.chartRenderers = {};
}

// Common dialog box show/hide functions
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
        .padding(0.5);

      const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, innerWidth]);

      const stackedData = d3.stack().keys(subgroups)(data);

      const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("display", "none"); // Ensure initial state is hidden

      function resetAllStyles() {
        d3.selectAll(".stack-bar").attr("opacity", 1);
        d3.selectAll(".stack-label").style("opacity", 0); // Reset to hidden
        d3.selectAll(".y-axis-label").style("font-weight", "normal");
      }

      function handleBarHover(labelClass, labelOriginal) {
        d3.selectAll(".stack-bar").attr("opacity", 0.2);
        d3.selectAll(`.bar-${labelClass}`).attr("opacity", 1);
        // Show all value labels for current occupation
        d3.selectAll(`.stack-label`)
          .filter(d => d.data.Occupation === labelOriginal)
          .style("opacity", 1);
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

          // Build tooltip showing all 5 category values
          const occupationData = d.data;
          let tooltipContent = `<strong>${occupation}</strong><br>`;
          
          // Add values for all 5 categories
          subgroups.forEach(subgroup => {
            const value = occupationData[subgroup];
            if (value !== undefined && value !== null) {
              const numValue = parseFloat(value);
              if (!isNaN(numValue)) {
                tooltipContent += `${subgroup}: ${numValue.toFixed(1)}%<br>`;
              }
            }
          });

          tooltip
            .style("display", "block")
            .html(tooltipContent);
          positionTooltip(tooltip, event, 12, 20);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
          resetAllStyles();
        });

      // Add value labels to bars (hidden by default)
      g.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .selectAll("text")
        .data(d => d)
        .join("text")
        .attr("class", "stack-label")
        .attr("x", d => x(d[0]) + (x(d[1]) - x(d[0])) / 2)
        .attr("y", d => y(d.data.Occupation) + y.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(d => {
          const value = d[1] - d[0];
          return value > 5 ? value.toFixed(1) + "%" : ""; // Only show values greater than 5%
        })
        .call(applyChartFont, 'small')
        .style("fill", "#fff")
        .style("font-weight", "normal") // Change to normal, remove bold
        .style("opacity", 0) // Hidden by default
        .style("pointer-events", "none"); // Disable mouse events for value labels to avoid interfering with hover

      const yAxis = g.append("g").call(d3.axisLeft(y));

      yAxis.selectAll("text")
        .attr("class", "y-axis-label")
        .attr("dy", "0.35em")
        .call(applyChartFont, 'small')
        .style("fill", "#000")
        .style("text-anchor", "end")
        .call(wrapText, 240);

      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"))
        .selectAll("text")
        .call(applyAxisLabel);

      const legend = svg.append("g")
        .attr("transform", `translate(${width - 470}, 10)`);

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
          .attr("transform", `translate(${offsetX}, 0)`);

        gL.append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", color(entry.full));

        const text = gL.append("text")
          .attr("x", 18)
          .attr("y", 10)
          .text(entry.label)
          .call(applyChartFont, 'small');

        offsetX += text.node().getBBox().width + 42;
      });

      // Show dialogue2 after 5 seconds
      showDialogueWithDelay("dialogue-box2", 5000);

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
    "Gradient 1": "#5B83A9", // Low Exposure - changed to new blue
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
      .attr("class", "tooltip");

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
            .style("display", "block")
            .html(`<strong>${d.Title}</strong><br>${tooltipMap[d.Exposure]}`);
          positionTooltip(tooltip, event, 10, 20);
        
          d3.select(this)
            .transition()
            .duration(100)
            .attr("d", d3.symbol().type(shapeMap[d.Exposure]).size(150)()); // Enlarge
        })
        .on("mouseout", function(event, d) {
          tooltip.style("display", "none");
        
          d3.select(this)
            .transition()
            .duration(100)
            .attr("d", d3.symbol().type(shapeMap[d.Exposure]).size(60)()); // Restore default size
        });

              // X Axis
        g.append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x).ticks(6))
          .selectAll("text")
          .call(applyAxisLabel);

              // Y Axis
        g.append("g")
          .call(d3.axisLeft(y).ticks(6))
          .selectAll("text")
          .call(applyAxisLabel);

              // Axis labels with hover explanations
        svg.append("text")
          .attr("x", margin.left + innerWidth / 2)
          .attr("y", height - 5)
          .attr("text-anchor", "middle")
          .text("AI Compatibility (mean task score)")
          .call(applyAxisLabel)
        .on("mouseover", function(event) {
          tooltip
            .style("display", "block")
            .html("Jobs further to the right involve tasks AI can easily handle.");
          positionTooltip(tooltip, event, 10, 20);
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
          .call(applyAxisLabel)
        .on("mouseover", function(event) {
          tooltip
            .style("display", "block")
            .html("Jobs higher up are more varied and harder to generalize.");
          positionTooltip(tooltip, event, 10, 20);
        })
        .on("mouseout", function() {
          tooltip.style("display", "none");
        });        

              // Legend with highlight interaction
        const legend = svg.append("g")
          .attr("transform", `translate(${width - 160}, 10)`);

      const exposureTypes = Object.keys(colorMap);
      exposureTypes.forEach((key, i) => {
        const gL = legend.append("g")
          .attr("transform", `translate(0, ${i * 22})`)
          .style("cursor", "pointer")
          .on("mouseover", function(event) {
            tooltip
              .style("display", "block")
              .html(`<strong>${labelMap[key]}</strong><br>${tooltipMap[key]}`);
            positionTooltip(tooltip, event, 12, 20);
          
            // Only affect scatter points, not coordinate axes
            d3.selectAll("path[class*='dot-']").attr("opacity", 0.1);
            d3.selectAll(`.dot-${key.replace(/\s/g, "-")}`).attr("opacity", 1);
          
            // Highlight legend
            d3.select(this).select("text").style("font-weight", "bold");
            d3.select(this).select("path").attr("opacity", 1); // Keep legend color block from fading out
          })
          .on("mouseout", function() {
            tooltip.style("display", "none");
          
            // Only restore scatter points, not coordinate axes
            d3.selectAll("path[class*='dot-']").attr("opacity", 0.9);
          
            // Restore legend
            d3.select(this).select("text").style("font-weight", "normal");
            d3.select(this).select("path").attr("opacity", 1); // Set explicitly again
          });
          

        gL.append("path")
          .attr("d", d3.symbol().type(shapeMap[key]).size(50)())
          .attr("fill", colorMap[key])
          .attr("transform", "translate(0, 6)");

        gL.append("text")
          .attr("x", 15)
          .attr("y", 10)
          .text(labelMap[key])
          .call(applyChartFont, 'small');
      });

      resolve();
    });
  });
};

chartRenderers[7] = function(titleText, dataPath, chartArea, gender = "Total") {
  const width = 680;
  const height = 390;
  const margin = { top: 30, right: 20, bottom: 70, left: 80 }; // Slightly tighten top and bottom margins
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const colorMap = {
    "Gradient1": "#5B83A9", // Low Exposure - changed to new blue
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

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

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
          .padding(0.55); // ✅ Make bars thinner

        const y = d3.scaleLinear()
          .domain([0, 50])
          .range([innerHeight, 0]);

        const stackedData = d3.stack().keys(subgroups)(data);

        // Bar chart
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
            const level = d.data.IncomeLevel;
            const levelClass = `.bar-${level.replace(/\s/g, "-")}`;

            // Build tooltip showing all 4 category values
            const levelData = d.data;
            let tooltipContent = `<strong>${level}</strong><br>`;
            
            // Add values for all 4 categories
            subgroups.forEach(subgroup => {
              const value = levelData[subgroup];
              if (value !== undefined && value !== null) {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                  tooltipContent += `${labelMap[subgroup]}: ${numValue.toFixed(1)}%<br>`;
                }
              }
            });

            tooltip
              .style("display", "block")
              .html(tooltipContent);
            positionTooltip(tooltip, event, 10, 20);

            // Current bar highlighted, others fade out
            g.selectAll(".stack-bar").attr("opacity", 0.2);
            g.selectAll(levelClass).attr("opacity", 1);

            // Show all value labels for current income level
            g.selectAll(".stack-label")
              .filter(d => d.data.IncomeLevel === level)
              .style("opacity", 1);

            // Bold the top cumulative value label
            g.selectAll(".bar-label").style("font-weight", "normal");
            g.selectAll(`.label-${level.replace(/\s/g, "-")}`).style("font-weight", "bold");

            // Bold x-axis
            g.selectAll(".x-axis-label").style("font-weight", "normal");
            g.selectAll(".x-axis-label")
              .filter(function() {
                return d3.select(this).text() === level;
              })
              .style("font-weight", "bold");
          })
          .on("mouseout", () => {
            tooltip.style("display", "none");
            g.selectAll(".stack-bar").attr("opacity", 1);
            g.selectAll(".stack-label").style("opacity", 0); // Hide value labels
            g.selectAll(".bar-label").style("font-weight", "normal"); // Reset top cumulative value label
            g.selectAll(".x-axis-label").style("font-weight", "normal");
          });

        // Add value labels to bars (hidden by default)
        g.append("g")
          .selectAll("g")
          .data(stackedData)
          .join("g")
          .selectAll("text")
          .data(d => d)
          .join("text")
          .attr("class", "stack-label")
          .attr("x", d => x(d.data.IncomeLevel) + x.bandwidth() / 2)
          .attr("y", d => y(d[0]) + (y(d[1]) - y(d[0])) / 2)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .text(d => {
            const value = d[1] - d[0];
            return value > 3 ? value.toFixed(1) + "%" : ""; // Only show values greater than 3%
          })
          .call(applyChartFont, 'small')
          .style("fill", "#fff")
          .style("font-weight", "normal")
          .style("opacity", 0) // Hidden by default
          .style("pointer-events", "none"); // Disable mouse events for value labels to avoid interfering with hover

        // Top cumulative value labels
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
            .style("fill", "#000")
            .call(applyChartFont, 'medium');
        });

        // X axis
        g.append("g")
          .attr("transform", `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("class", "x-axis-label")
          .call(applyAxisLabel)
          .each(function(d) {
            const text = d3.select(this);
            const words = text.text().split(" ");
            if (words.length > 1) {
              text.text("");
              words.forEach((word, i) => {
                text.append("tspan")
                  .attr("x", 0)
                  .attr("dy", i === 0 ? "0.8em" : "1.2em") // First line moves down 0.8em
                  .text(word);
              });
            } else {
              // Single line text also moves down
              text.attr("dy", "0.8em");
            }
          });

        // Y axis
        g.append("g")
          .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"))
          .selectAll("text")
          .call(applyAxisLabel);

        // Y-axis label
        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", 18)
          .attr("text-anchor", "middle")
          .text("Share of employment (%)")
          .call(applyAxisLabel, 'medium');

        // Legend placed in top right corner, in specified order
        const legend = svg.append("g")
          .attr("transform", `translate(${width - margin.right - 160}, 0)`);

        // In required order: Very High -> High -> Moderate -> Low
        const legendOrder = ["Gradient4", "Gradient3", "Gradient2", "Gradient1"];
        
        legendOrder.forEach((key, i) => {
          const gL = legend.append("g")
            .attr("transform", `translate(0, ${i * 25})`);

          gL.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", colorMap[key]);

          gL.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .text(labelMap[key])
            .call(applyChartFont, 'small');
        });
      }

      draw(gender);
      resolve();
    });
  });
};

chartRenderers[8] = function(titleText, dataPath, chartArea) {
  const width = 1280;
  const height = 720;

  // Single image positioning
  const imageX = 0;
  const imageY = 120;
  const imageWidth = 760;
  const imageHeight = 480;

  // Hotspot definitions
  const hotspots = [
    {
      x: imageX + 160,
      y: imageY + 50,
      width: 500,
      height: 120,
      label: "Medium Skill",
      tooltip: "Exposure: High 12.3% + Medium 25.8% = 38.1%<br>Typical jobs: Clerical support, Sales workers, Craft workers, Machine operators"
    },
    {
      x: imageX + 160,
      y: imageY + 190,
      width: 500,
      height: 120,
      label: "High Skill", 
      tooltip: "Exposure: High 13.1% + Medium 22.2% = 35.3%<br>Typical jobs: Managers, Professionals, Technicians"
    },
    {
      x: imageX + 160,
      y: imageY + 330,
      width: 500,
      height: 120,
      label: "Low Skill",
      tooltip: "Exposure: High 0.8% + Medium 0% = 0.8%<br>Typical jobs: Agricultural workers, Fishery workers, Elementary occupations"
    }
  ];

  return new Promise(resolve => {
    const svg = chartArea.append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("pointer-events", "none"); // Let container not block click events
    
    // Show dialogue3 after 5 seconds
    showDialogueWithDelay("dialogue-box3", 5000);

    // ✅ Main image
    svg.append("image")
      .attr("href", "assets/chapter2/AIexposure_skill.png")
      .attr("x", imageX)
      .attr("y", imageY)
      .attr("width", imageWidth)
      .attr("height", imageHeight);

    // tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip");

    // ✅ Hotspot layer
    hotspots.forEach(hotspot => {
      const group = svg.append("g")
        .attr("transform", `translate(${hotspot.x}, ${hotspot.y})`)
        .style("pointer-events", "all"); // Let hotspots receive mouse events

              // Transparent hotspot rectangle (for mouse detection)
      group.append("rect")
        .attr("width", hotspot.width)
        .attr("height", hotspot.height)
        .attr("fill", "transparent")
        .attr("stroke", "none");

      group.on("mouseover", function (event) {
        tooltip
          .style("display", "block")
          .html(`<strong>${hotspot.label}</strong><br>${hotspot.tooltip}`);
        positionTooltip(tooltip, event, 12, 20);

        showChart8DialogueImage();
      });

      group.on("mouseout", function () {
        tooltip.style("display", "none");
      });
    });

    resolve();
  });
};



