'use strict';

window.onload = init();

function init() {
  d3.json("../prosperLoanData.csv", draw)
}

function draw(data) {
  d3.select(".d3anchor")
    .append("h2")
    .text("works!")
}