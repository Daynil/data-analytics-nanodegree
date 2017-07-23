'use strict';

window.onload = init();

function init() {
  d3.json("../workingLoan.csv", draw)
}

function draw(data) {
  d3.select(".d3anchor")
    .append("h2")
    .text("works!")
}