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

//-----------------------------DATA-----------------------------//
const timeConv = d3.timeParse("%d-%b-%Y");
const dataset = d3.csv("more_data.csv");
dataset.then(function(data) {
    var slices = data.columns.slice(1).map(function(id) {
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

//----------------------------SCALES----------------------------//
const xScale = d3.scaleTime().range([0,width]);
const yScale = d3.scaleLinear().rangeRound([height, 0]);

xScale.domain(d3.extent(data, function(d){
    return timeConv(d.date)}));

yScale.domain([(0), d3.max(slices, function(c) {
    return d3.max(c.values, function(d) {
        return d.measurement + 4; });
        })
    ]);

//-----------------------------AXES-----------------------------//
const yaxis = d3.axisLeft()
    .ticks((slices[0].values).length)
    .scale(yScale);

const xaxis = d3.axisBottom()
    .ticks(d3.timeDay.every(1))
    .tickFormat(d3.timeFormat('%b %d'))
    .scale(xScale);

//----------------------------LINES-----------------------------//
const line = d3.line()
    .x(function(d) { return xScale(d.date); })
    .y(function(d) { return yScale(d.measurement); });

let id = 0;
const ids = function () {
    return "line-"+id++;
}  

//---------------------------TOOLTIP----------------------------//


//-------------------------2. DRAWING---------------------------//
//-----------------------------AXES-----------------------------//
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

//----------------------------LINES-----------------------------//
const lines = svg.selectAll("lines")
    .data(slices)
    .enter()
    .append("g");

    lines.append("path")
    .attr("class", 'line')
    .attr("d", function(d) { return line(d.values); });

    lines.append("text")
    .attr("class","serie_label")
    .datum(function(d) {
        return {
            id: d.id,
            value: d.values[d.values.length - 1]}; })
    .attr("transform", function(d) {
            return "translate(" + (xScale(d.value.date) + 10)  
            + "," + (yScale(d.value.measurement) + 5 )+ ")"; })
    .attr("x", 5)
    .text(function(d) { return ("Serie ") + d.id; });

    const ghostLines = lines.append('path')
    .attr('class', 'ghost-line')
    .attr('d', function (d) {
        return line(d.values)
    })

//---------------------------POINTS-----------------------------// 

//---------------------------EVENTS-----------------------------// 
svg.selectAll('.ghost-line')
    .on('mouseover', function () {
        const selection = d3.select(this).raise();

        selection
            .transition()
            .delay('100')
            .duration('10')
            .style('stroke', '#ed3700')
            .style('opacity', '1')
            .style('stroke-width', '3')

        const legend = d3.select(this.parentNode)
            .select('.serie_label')
        legend
            .transition()
            .delay('100')
            .duration('10')
            .style('fill', '#2b2929')
    } )

   

    .on('mouseout', function() {
        const selection = d3.select(this);
        selection
            .transition()
            .delay('100')
            .duration('10')
            .style('stroke', '#d2d2d2')
            .style('opacity', '0')
            .style('stroke-width', '10')

        const legend = d3.select(this.parentNode)
            .select('.serie_label')
            
        legend
            .transition()
            .delay('100')
            .duration('10')
            .style('fill', '#d2d2d2')
    })

});