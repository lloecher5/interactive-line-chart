//------------------------1. PREPARATION-------------------------//
//-----------------------------SVG-------------------------------//

const width = 960;
const height = 500;
const margin = 5;
const padding = 5;
const adj = 30;
// we are appending SVG first
const svg = d3.select("div#container").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "-"
          + adj + " -"
          + adj + " "
          + (width + adj *3) + " "
          + (height + adj*3))
    .style("padding", padding)
    .style("margin", margin)
    .classed("svg-content", true);

//-----------------------------DATA------------------------------//
const timeConv = d3.timeParse("%d-%b-%Y");
const dataset = d3.csv("data.csv");

dataset.then(function(data) {
    const slices = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d){
                return {
                    date: timeConv(d.date),
                    measurement: +d[id]
                };
            })
        };
    });

console.log("Column headers", data.columns);
console.log("Column headers without date", data.columns.slice(1));
// returns the sliced dataset
console.log("Slices",slices);  
// returns the first slice
console.log("First slice",slices[0]);
// returns the array in the first slice
console.log("A array",slices[0].values);   
// returns the date of the first row in the first slice
console.log("Date element",slices[0].values[0].date);  
// returns the array's length
console.log("Array length",(slices[0].values).length);

//----------------------------SCALES-----------------------------//
const xScale = d3.scaleTime().range([0,width]);
const yScale = d3.scaleLinear().rangeRound([height, 0]);
xScale.domain(d3.extent(data, function(d){
    return timeConv(d.date)}));
yScale.domain([(0), d3.max(slices, function(c) {
    return d3.max(c.values, function(d) {
        return d.measurement + 4; });
        })
    ]);

//-----------------------------AXES------------------------------//
const yaxis = d3.axisLeft()
    .ticks((slices[0].values).length)
    .scale(yScale);

const xaxis = d3.axisBottom()
    .ticks(d3.timeDay.every(1))
    .tickFormat(d3.timeFormat('%b %d'))
    .scale(xScale);

//----------------------------LINES------------------------------//
const line = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.measurement); });

    let id = 0;
    const ids = function () {
        return "line-"+id++;
    }

//---------------------------TOOLTIP----------------------------//
const toolTip = d3.select('body').append('div')
.attr('class', 'tooltip')
.style('opacity', 0)
.style('position', 'absolute');


   
//-------------------------2. DRAWING----------------------------//

//-----------------------------AXES------------------------------//
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xaxis);

svg.append("g")
    .attr("class", "axis")
    .call(yaxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("dy", ".75em")
    .attr("y", 6)
    .style("text-anchor", "end")
    .text("Frequency");
    

//----------------------------LINES------------------------------//
const lines = svg.selectAll("lines")
    .data(slices)
    .enter()
    .append("g");

    lines.append("path")
    .attr('class',ids)
    .attr("d", function(d) { return line(d.values); });

    lines.append("text")
    .attr("class","serie_label")
    .datum(function(d) {
        return {
            id: d.id,
            value: d.values[d.values.length - 1]}; })
    .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) + 10)  
            + "," + (yScale(d.value.measurement) + 5 ) + ")";})
    .attr("x", 5)
    .text(function(d) { return ("Serie ") + d.id; });

    //---------------------------POINTS-----------------------------// 
    lines.selectAll('points')
    .data(d=>d.values)
    .enter()
    .append('circle')
    .attr('cx', d=>{
        return xScale(d.date)
    })
    .attr('cy', d=>{
        return yScale(d.measurement)
    })
    .attr('r', 1)
    .attr('class', 'point')
    .style('opacity', 1);

   //---------------------------EVENTS-----------------------------// 
   lines.selectAll('circles')
   .data(d=>d.values)
   .enter()
   .append('circle')
   .attr('cx', d=>{
        return xScale(d.date)
    })
    .attr('cy', d=>{
        return yScale(d.measurement)
    })
   .attr('r', 10)
   .style('opacity', 0)

   .on('mouseover', function (d) {
    toolTip.transition()
    .delay(30)
    .duration(200)
    .style('opacity', 1)
    

    toolTip.html(d.measurement)
    .style('left', (d3.event.pageX + 25) + 'px')
    .style('top', (d3.event.pageY) + 'px')

    const selection = d3.select(this).raise()
    
    

    selection
        .transition()
        .delay('20')
        .duration('200')
        .attr('r', 6)
        .style('opacity', 1)
        .style('fill', '#ed3700')
   })

   

   .on('mouseout', function(d){
    toolTip.transition()
    .duration(100)
    .style('opacity', 0)

    const selection = d3.select(this)

    selection
        .transition()
        .delay('20')
        .duration('200')
        .attr('r', 10)
        .style('opacity', 0)
   })



});