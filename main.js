// Static narrative D3 visualization for the credit card applications homework.
// The chart uses D3 v7 and loads a cleaned CSV made from the uploaded dataset.
// I chose a lollipop chart because it makes the approval-rate gap easy to compare
// without adding interaction or overloading the viewer with anonymized variables.

const margin = { top: 120, right: 270, bottom: 95, left: 120 };
const width = 1080;
const height = 680;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("role", "img")
  .attr("aria-labelledby", "chartTitle chartDesc");

svg.append("title")
  .attr("id", "chartTitle")
  .text("Credit card approval rates by applicant age group");

svg.append("desc")
  .attr("id", "chartDesc")
  .text("A static lollipop chart showing that approval rates increase across older applicant groups in this anonymized credit card application dataset.");

const chart = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Load the cleaned, summarized data rather than using the raw anonymized records directly.
d3.csv("data/credit_approval_by_age_cleaned.csv", d3.autoType).then(data => {
  // Keep the age groups in the order created during cleaning.
  data.sort((a, b) => d3.ascending(a.order, b.order));

  const xScale = d3.scaleLinear()
    .domain([0, 80])
    .range([0, innerWidth]);

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.age_group))
    .range([0, innerHeight])
    .padding(0.42);

  const xAxis = d3.axisBottom(xScale)
    .tickValues([0, 20, 40, 60, 80])
    .tickFormat(d => `${d}%`);

  const yAxis = d3.axisLeft(yScale)
    .tickSize(0);

  const grid = d3.axisBottom(xScale)
    .tickValues([0, 20, 40, 60, 80])
    .tickSize(-innerHeight)
    .tickFormat("");

  // Title and description are drawn inside the SVG to satisfy the narrative requirement.
  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", margin.left)
    .attr("y", 46)
    .text("Approval rates climb across older applicant groups");

  svg.append("text")
    .attr("class", "chart-subtitle")
    .attr("x", margin.left)
    .attr("y", 76)
    .text("Each line starts at 0% and ends at the share of applicants approved within that age group.");

  chart.append("g")
    .attr("class", "gridline")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(grid);

  chart.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis);

  chart.append("g")
    .attr("class", "y-axis")
    .call(yAxis)
    .selectAll("text")
    .attr("dx", "-0.5em");

  chart.append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 55)
    .attr("text-anchor", "middle")
    .text("Approval rate within each age group");

  // Light baseline helps readers see that every lollipop is measured from the same starting point.
  chart.selectAll(".baseline")
    .data(data)
    .join("line")
    .attr("class", "baseline")
    .attr("x1", xScale(0))
    .attr("x2", xScale(80))
    .attr("y1", d => yScale(d.age_group) + yScale.bandwidth() / 2)
    .attr("y2", d => yScale(d.age_group) + yScale.bandwidth() / 2);

  // The main lollipop lines encode the approval rate for each age group.
  chart.selectAll(".lollipop-line")
    .data(data)
    .join("line")
    .attr("class", "lollipop-line")
    .attr("x1", xScale(0))
    .attr("x2", d => xScale(d.approval_percent))
    .attr("y1", d => yScale(d.age_group) + yScale.bandwidth() / 2)
    .attr("y2", d => yScale(d.age_group) + yScale.bandwidth() / 2);

  chart.selectAll(".approval-dot")
    .data(data)
    .join("circle")
    .attr("class", "approval-dot")
    .attr("cx", d => xScale(d.approval_percent))
    .attr("cy", d => yScale(d.age_group) + yScale.bandwidth() / 2)
    .attr("r", 13);

  chart.selectAll(".rate-label")
    .data(data)
    .join("text")
    .attr("class", "rate-label")
    .attr("x", d => xScale(d.approval_percent) + 24)
    .attr("y", d => yScale(d.age_group) + yScale.bandwidth() / 2 + 6)
    .text(d => `${d.approval_percent}%`);

  chart.selectAll(".count-label")
    .data(data)
    .join("text")
    .attr("class", "count-label")
    .attr("x", d => xScale(d.approval_percent) + 24)
    .attr("y", d => yScale(d.age_group) + yScale.bandwidth() / 2 + 25)
    .text(d => `${d.approvals} approved out of ${d.total_applications}`);

  // A small annotation turns the chart from a basic comparison into a narrative.
  const youngest = data[0];
  const oldest = data[data.length - 1];
  const gap = (oldest.approval_percent - youngest.approval_percent).toFixed(1);

  const callout = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 35}, ${margin.top + 92})`);

  callout.append("rect")
    .attr("class", "callout-box")
    .attr("width", 215)
    .attr("height", 132)
    .attr("rx", 16);

  callout.append("text")
    .attr("class", "callout-title")
    .attr("x", 18)
    .attr("y", 31)
    .text("Main takeaway");

  callout.append("text")
    .attr("class", "callout-text")
    .attr("x", 18)
    .attr("y", 58)
    .text(`The 55+ group was approved`);

  callout.append("text")
    .attr("class", "callout-text")
    .attr("x", 18)
    .attr("y", 80)
    .text(`${gap} percentage points more`);

  callout.append("text")
    .attr("class", "callout-text")
    .attr("x", 18)
    .attr("y", 102)
    .text(`often than applicants under 25.`);

  svg.append("text")
    .attr("class", "caption")
    .attr("x", margin.left)
    .attr("y", height - 26)
    .text("Note: The dataset is anonymized, so this chart describes an observed pattern rather than explaining why decisions were made.");
}).catch(error => {
  console.error("Could not load the cleaned credit card CSV:", error);
});
