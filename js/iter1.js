'use strict';

const w = 800;
const h = 500;
let fullData;
let pivotedData;
let infoData = [
  {
    "value": "BorrowerAPR",
    "text": "This data set contains information about loans from the peer to peer lending company Prosper. Each borrower enters various information about themselves, including salary, which is verfied, as well as having a credit record pulled. Based on this data, Prosper calculates a 'Prosper Score', which indicates investment risk on a scale from 1-11, 11 being best, or lowest risk Shown below, we see that the lowest loan APRs go to those with the lowest risk score. Interestingly, salary doesn't play nearly as much a roll as the Prosper Score. Next, let's see how well Prosper Score and salary can paint a picture with respect to other indicators of financial health."
  },
  {
    "value": "RevolvingCreditBalance",
    "text": "Revolving credit balance is the portion of credit card spending that goes unpaid at the end of a billing cycle. Although you would typically think an unpaid credit card balance is a bad thing for loans, loan companies actually don't consider it to be a bad thing on its own. Below, we can see that although higher unpaid balances are much more common as salary increases, the prosper score is unaffected."
  },
  {
    "value": "DelinquenciesLast7Years",
    "text": "Much more concerning to loan companies is delinquency in payment. Below, we can see that a high rate of delinquency over the last 7 years is associated strongly with poorer Proper Scores. Additionally, it appears that higher rates of delinquency are more likely the less you earn, particularly if you are rated with a low Prosper Score, which indicates poorer financial health overall."
  }
];

let currentScreen = 2;

window.onload = init();

function init() {
  
  d3.csv('../workingLoan.csv', csvdata => {
    d3.select('.nextButton').on('click', () => changeScreen()); 
    fullData = csvdata;
    pivot();
    changeScreen(currentScreen);
  });
}

function changeScreen() {
  // Rotate texts and data
  currentScreen = (currentScreen + 1) % 3;
  if (currentScreen === 2) d3.select('.nextButton').text(() => 'Restart');
  else d3.select('.nextButton').text(() => 'Next');
  d3.select('#infoTxt').text(() => infoData[currentScreen]['text']);
  d3.select('#legendtxt').text(() => {
    let curVar = infoData[currentScreen]['value'];
    let displayLegend = "";
    if (curVar === "BorrowerAPR") displayLegend = "Loan APR";
    else if (curVar === "RevolvingCreditBalance") displayLegend = "Revolving Credit Balance";
    else displayLegend = "Delinquencies Last 7 Years";
    return displayLegend;
  });
  d3.selectAll('.graphComponent').remove();

  let filtered = pivotedData.map(loan => {
    let slice = {
      ProsperScore: loan.ProsperScore,
      IncomeRange: loan.IncomeRange,
      value: loan[infoData[currentScreen]['value']]
    };
    return slice;
  });
  draw(filtered, infoData[currentScreen]['value']);
}

/**
 * Create a pivot table representation of data and draw
 */
function pivot() {
  let incomeRanges = ['$1-24,999', '$25,000-49,999', '$50,000-74,999', '$75,000-99,999', '$100,000+']

  let data = fullData;
  // Nest data by index and column
  let agg = d3.nest()
          .key(d => d['ProsperScore'])
          .key(d => d['IncomeRange'])
          // Rollup by mean
          .rollup(leaves => {
            return {
              "BorrowerAPR": d3.mean(leaves, d => d["BorrowerAPR"]),
              "RevolvingCreditBalance": d3.mean(leaves, d => d["RevolvingCreditBalance"]),
              "DelinquenciesLast7Years": d3.mean(leaves, d => d["DelinquenciesLast7Years"])
            }
          })
          .entries(data);

  // Unroll into pivot table
  let pivotData = []
  agg.forEach(prosperAgg => {
    prosperAgg.values.forEach(incomeAgg => {
      let pivotPoint = {}
      // Transform axes to integers for scaling
      pivotPoint['ProsperScore'] = +prosperAgg.key;
      pivotPoint['IncomeRange'] = incomeRanges.indexOf(incomeAgg.key) + 1;
      pivotPoint['BorrowerAPR'] = incomeAgg.values.BorrowerAPR;
      pivotPoint['RevolvingCreditBalance'] = incomeAgg.values.RevolvingCreditBalance;
      pivotPoint['DelinquenciesLast7Years'] = incomeAgg.values.DelinquenciesLast7Years;
      pivotData.push(pivotPoint);
    });
  });
  pivotedData = pivotData;
}

function draw(data, curVar) {

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
    .attr('class', 'graphComponent')
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

  let rects = svg.selectAll('rect')
    .data(data);

  rects.exit().remove();

  rects.enter()
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
  let legend = d3.select('#legend')
    .append('svg')
    .attr('class', 'graphComponent')
    .attr('width', legendCellWidth)
    .attr('height', legendData.length * legendCellHeight)
    .style('margin-left', '15px')
    .selectAll('rect')
    .data(legendData);

  legend.exit().remove()

  legend.enter()
    .append('rect')
    .attr('y', (d, i) => i * legendCellHeight + legendCellHeight)
    .attr('height', legendCellHeight)
    .attr('width', legendCellWidth)
    .attr('fill', d => colorScale(d));

  let legendTextSteps = 5;
  let legendTextData = d3.range(valRange[0], valRange[1],
                            (valRange[1] - valRange[0]) / legendTextSteps);
  let legendText = d3.select('#legend')
    .append('svg')
    .attr('class', 'graphComponent')
    .attr('width', '200px')
    .attr('height', legendData.length * legendCellHeight)
    .style('margin-left', '10px')
    .selectAll('text')
    .data(legendTextData);

  legendText.exit().remove()

  legendText.enter()
    .append('text')
    .attr('y', (d, i) => i * legendCellHeight * (legendSteps / legendTextSteps) + legendCellHeight * 2 - 4)
    .text(d => {
      // Adjust display scale based on current variable
      if (curVar === "BorrowerAPR") {
        return Math.round(d*100) + '%';
      }
      else if (curVar === "RevolvingCreditBalance") {
        return '$' + d.toLocaleString(undefined, {maximumFractionDigits: 0});
      }
      else {
        return Math.round(d);
      }
    });

    
}