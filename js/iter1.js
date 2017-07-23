'use strict';

const w = 1000;
const h = 500;
let fullData;

window.onload = init();

function init() {
  d3.csv('../workingLoan.csv', csvdata => {
    fullData = csvdata;
    pivot('ProsperScore', 'IncomeRange', 'BorrowerAPR');
  });
}

/**
 * Create a pivot table representation of data and draw
 * 
 * @param {any} index The desired index to pivot on.
 * @param {any} column The desired column to pivot on.
 * @param {any} value The field to aggregate via mean (intersection of index and column)
 */
function pivot(index, column, value) {
  let incomeRanges = ['$1-24,999', '$25,000-49,999', '$50,000-74,999', '$75,000-99,999', '$100,000+']

  let data = fullData;
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
      // Transform axes to integers for scaling
      pivotPoint[index] = +prosperAgg.key;
      pivotPoint[column] = incomeRanges.indexOf(incomeAgg.key) + 1;

      pivotPoint['value'] = incomeAgg.values;
      pivotData.push(pivotPoint);
    });
  });

  draw(pivotData);
}

function draw(data) {

  let colorScale = d3.scale.linear()
    .domain(d3.extent(data, d => d['value']))
    .interpolate(d3.interpolateHcl)
    .range([d3.rgb('#ffff66'), d3.rgb('#028166')]);

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

  let svg = d3.select('#d3anchor')
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
    .attr('width',  w / (data.length / 11) )
    .attr('height', yScale.rangeBand())
    .attr('fill', d => colorScale(d['value']) );

  // Legend
  let valRange = d3.extent(data, d => d['value']);
  let legendSteps = 10;
  let legendData =  d3.range(valRange[0], valRange[1],
                            (valRange[1] - valRange[0]) / legendSteps);
  let legendCellWidth = 30;
  let legendCellHeight = 20;
  d3.select('#legend')
    .append('svg')
    .attr('width', legendCellWidth)
    .attr('height', legendData.length * legendCellHeight)
    .style('margin-left', '15px')
    .selectAll('rect')
    .data(legendData)
    .enter()
    .append('rect')
    .attr('y', (d, i) => i * legendCellHeight + legendCellHeight)
    .attr('height', legendCellHeight)
    .attr('width', legendCellWidth)
    .attr('fill', d => colorScale(d));

  let legendTextSteps = 5;
  let legendText = d3.range(valRange[0], valRange[1],
                            (valRange[1] - valRange[0]) / legendTextSteps);
  d3.select('#legend')
    .append('svg')
    .attr('width', '200px')
    .attr('height', legendData.length * legendCellHeight)
    .style('margin-left', '10px')
    .selectAll('text')
    .data(legendText)
    .enter()
    .append('text')
    .attr('y', (d, i) => i * legendCellHeight * (legendSteps / legendTextSteps) + legendCellHeight * 2 - 4)
    .text(d => {
      return Math.round(d*100) + '%'
    })
}