import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";

class Child1 extends Component {
  state = {
    company: "Apple",
    selectedMonth: "November",
  };

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate() {
    this.renderChart();
  }

  renderChart = () => {
    const { csv_data } = this.props;
    const { company, selectedMonth } = this.state;

    const monthIndex = new Date(`${selectedMonth} 1`).getMonth();
    const filteredData = csv_data.filter(
      (d) => d.Company === company && new Date(d.Date).getMonth() === monthIndex
    );

    d3.select("#chart").selectAll("*").remove();

    if (!filteredData.length) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 40 },
      width = 800,
      height = 400,
      innerWidth = width - margin.left - margin.right - 100,
      innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(filteredData, (d) => new Date(d.Date)))
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, (d) => Math.min(d.Open, d.Close)),
        d3.max(filteredData, (d) => Math.max(d.Open, d.Close)),
      ])
      .range([innerHeight, 0]);

    svg
      .selectAll(".x.axis")
      .data([null])
      .join("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(d3.timeDay.every(2)))
      .selectAll("text")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");

    svg
      .selectAll(".y.axis")
      .data([null])
      .join("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale));

    const lineGenerator = (key) =>
      d3
        .line()
        .x((d) => xScale(new Date(d.Date)))
        .y((d) => yScale(d[key]))
        .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "var(--open-color)")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator("Open"));

    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "var(--close-color)")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator("Close"));

    svg
      .selectAll(".dot-open")
      .data(filteredData)
      .join("circle")
      .attr("class", "dot-open")
      .attr("cx", (d) => xScale(new Date(d.Date)))
      .attr("cy", (d) => yScale(d.Open))
      .attr("r", 4);

    svg
      .selectAll(".dot-close")
      .data(filteredData)
      .join("circle")
      .attr("class", "dot-close")
      .attr("cx", (d) => xScale(new Date(d.Date)))
      .attr("cy", (d) => yScale(d.Close))
      .attr("r", 4);

    const legend = svg
      .selectAll(".legend")
      .data(["Open", "Close"])
      .join("g")
      .attr("transform", (_, i) => `translate(0,${i * 20})`);

    legend
      .append("rect")
      .attr("x", innerWidth + 10)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", (_, i) =>
        i === 0 ? "var(--open-color)" : "var(--close-color)"
      );

    legend
      .append("text")
      .attr("x", innerWidth + 35)
      .attr("y", 13)
      .text((d) => d);

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "var(--tooltip-bg)")
      .style("color", "var(--tooltip-text)")
      .style("padding", "5px")
      .style("border-radius", "5px");

    const formatDate = d3.timeFormat("%m/%d/%Y");

    function showTooltip(event, d) {
      var diff = (d.Close - d.Open).toFixed(2);
      tooltip
        .html(
          `Date: ${formatDate(new Date(d.Date))}<br>
          Open: ${d.Open}<br>
          Close: ${d.Close}<br>
          Difference: ${diff}`
        )
        .style("visibility", "visible");

      tooltip
        .style("top", event.pageY + 5 + "px")
        .style("left", event.pageX + 5 + "px");
    }

    function hideTooltip() {
      tooltip.style("visibility", "hidden");
    }

    d3.selectAll(".dot-open, .dot-close")
      .on("mouseover", showTooltip)
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY + 5 + "px")
          .style("left", event.pageX + 5 + "px");
      })
      .on("mouseout", hideTooltip);
  };

  handleCompanyChange = (event) => {
    this.setState({ company: event.target.value });
  };

  handleMonthChange = (event) => {
    this.setState({ selectedMonth: event.target.value });
  };

  render() {
    const options = ["Apple", "Microsoft", "Amazon", "Google", "Meta"];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return (
      <div className="child1">
        <div className="filters">
          <div className="companies">
            Company:
            {options.map((c) => (
              <label key={c}>
                <input
                  type="radio"
                  value={c}
                  checked={this.state.company === c}
                  onChange={this.handleCompanyChange}
                />
                {c}
              </label>
            ))}
          </div>
          <div className="months">
            Month:
            <select
              value={this.state.selectedMonth}
              onChange={this.handleMonthChange}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div id="chart"></div>
      </div>
    );
  }
}

export default Child1;
