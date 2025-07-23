function initDataVis() {
  const container = d3.select("#datavis-container");
  container.html(""); // 清空旧内容

  // 示例：画标题
  container.append("div")
    .style("position", "absolute")
    .style("top", "30px")
    .style("left", "50%")
    .style("transform", "translateX(-50%)")
    .style("font-size", "36px")
    .style("color", "white")
    .text("Chapter 2: Fact");

  // 示例：插入 SVG 图表
  const svg = container.append("svg")
    .attr("width", 1280)
    .attr("height", 600);

  svg.append("text")
    .attr("x", 100)
    .attr("y", 100)
    .text("This is where data visualization begins.")
    .attr("fill", "white")
    .attr("font-size", "24px");
}
