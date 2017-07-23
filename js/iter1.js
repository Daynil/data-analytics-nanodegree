'use strict';

const w = 1200;
const h = 600;

window.onload = init();

function init() {
  d3.csv('../workingLoan.csv', data => pivot(data, 'ProsperScore', 'IncomeRange', 'BorrowerAPR'));
}

/**
 * Create a pivot table representation of data and draw
 * 
 * @param {any} data An array of objects with keys being column name
 * @param {any} index The desired index to pivot on.
 * @param {any} column The desired column to pivot on.
 * @param {any} value The field to aggregate via mean (intersection of index and column)
 */
function pivot(data, index, column, value) {
  // Nest data by index and column
 let agg = d3.nest()
          .key(d => d[index])
          .key(d => d[column])
          // Rollup by mean
          .rollup(leaves => d3.mean(leaves, d => d[value]))
          .entries(data);

  // Unroll into pivot table
  let pivotData = []
  agg.forEach(prosperAgg => {
    prosperAgg.values.forEach(incomeAgg => {
      let pivotPoint = {}
      pivotPoint[index] = +prosperAgg.key;
      pivotPoint[column] = incomeAgg.key;
      pivotPoint['value'] = incomeAgg.values;
      pivotData.push(pivotPoint);
    });
  });

  draw(pivotData);
}

function draw(data) {
  
  let valRange = d3.extent(data, d => d['value']);
  
  let xScale = d3.scale.ordinal()
    .domain(d3.range(1, 6))
    .rangeRoundBands([0, w]);
  let yScale = d3.scale.ordinal()
    .domain(d3.range(1, 12))
    .rangeRoundBands([h, 0]);

  let xAxisTicks = ['$1-25k', '$25k-50k', '$50k-75k', '$75k-100k', '$100k+'];
  let xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickFormat(d => xAxisTicks[d - 1]);

  let yAxisTicks = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  let yAxis = d3.svg.axis().scale(yScale).orient('left').tickFormat(d => yAxisTicks[d - 1]);

  let svg = d3.select('.d3anchor')
    .append('svg')
    .attr('width', w + 20)
    .attr('height', h)
    .style('padding', '25px');

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${h - 4})`)
    .call(xAxis);

  svg.append('g')
    .attr('class', 'y axis')
    .attr('transform', 'translate(-1, 0)')
    .call(yAxis);
    
  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => xScale(d['IncomeRange']))
    .attr('y', d => yScale(d['ProsperScore']))
    .attr('width',  w / (data.length / 12) )
    .attr('height', yScale.rangeBand())
    .attr('fill', d => getCellColor(d['value'], valRange) );
}

/**
 * Get cell color based on value using hsl scale
 * 
 * @param {any} value 
 * @param {any} valRange 
 */
function getCellColor(value, valRange) {
  let minColor = 60; // Yellow
  let maxColor = 120; // Green
  let range = maxColor - minColor;

  let scale = (value - valRange[0]) / valRange[1];
  let hue = minColor + (range * scale)
  return `hsl(${hue}, 100%, 50%)`
}