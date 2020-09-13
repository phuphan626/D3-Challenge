// Credit to this author and the activity in the class. https://github.com/c-l-nguyen/D3-challenge

// Initialize the svg area
var svgWidth = 960;
var svgHeight = 500;
// Initialize the margin dictionary
var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};
// Init the width and height for html tag
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight + 40);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
// Create function to update the x-scale and y-scale upon click on axis labels
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
};

function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) - 1,
            d3.max(data, d => d[chosenYAxis]) + 1
        ])
        .range([height, 0]);
    return yLinearScale;
};
// Function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
};
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
};
// Function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
};

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
};
// Function used for updating circles group with new tooltip
function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {
    // for the xaxis
    var xpercentsign = "";
    var xlabel = "";
    if (chosenXAxis === "poverty") {
        xlabel = "Poverty";
        xpercentsign = "%";
    } else if (chosenXAxis === "age") {
        xlabel = "Age";
    } else {
        xlabel = "Household Income";
    };
    // for the yaxis
    var ypercentsign = "";
    var ylabel = "";
    if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare";
        ypercentsign = "%";
    } else if (chosenYAxis === "smokes") {
        ylabel = "Smokes";
        ypercentsign = "%";
    } else {
        ylabel = "Obesity";
        ypercentsign = "%";
    }
    // create the tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            if (chosenXAxis === "income") {
                var incomelevel = formatter.format(d[chosenXAxis]);
                return (`${d.state}<br>${xlabel}: ${incomelevel.substring(0, incomelevel.length-3)}${xpercentsign}<br>${ylabel}: ${d[chosenYAxis]}${ypercentsign}`)
            } else {
                return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}${xpercentsign}<br>${ylabel}: ${d[chosenYAxis]}${ypercentsign}`)
            };
        });

    circlesGroup.call(toolTip);
    // mouseover event
    circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data, this);
        });

    return circlesGroup;
};
// Functions used for updating circles text with a transition on
// new circles for both X and Y coordinates
function renderXText(circlesGroup, newXScale, chosenXaxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

function renderYText(circlesGroup, newYScale, chosenYaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]) + 5);

    return circlesGroup;
}

// format number to USD currency
var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});
// Set file path
var file_path = './assets/data/data.csv';
// Read in the file
d3.csv(file_path).then(function(item, err) {
    if (err) throw err;
    item.forEach(function(data) {
        // Convert data to number
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
        data.income = +data.income;
    });
    // xLinearScale function above csv import
    var xLinearScale = xScale(item, chosenXAxis);
    let yLinearScale = yScale(item, chosenYAxis);

    // Initialize axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x and y axes to the chart
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);
    // Create scatterplot and append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(item)
        .enter()
        .append("g");
    // Initial circles
    var circlesXY = circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .classed("stateCircle", true);
    // Get the abbreviaton for the state name for circle text
    var circlesText = circlesGroup.append("text")
        .text(d => d.abbr)
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]) + 5)
        .classed("stateText", true);

    // Create group for 3 x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height})`);
    // Xaxis label for poverty
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "poverty") // value to grab for event listener
        .text("In Poverty (%)")
        .classed("active", true);
    // xaxis label for Age
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age") // value to grab for event listener
        .text("Age (Median)")
        .classed("inactive", true);
    // xaxis label for income    
    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 80)
        .attr("value", "income") // value to grab for event listener
        .text("Household Income (Median)")
        .classed("inactive", true);

    // Create group for 3 y-axis labels
    var ylabelsGroup = chartGroup.append("g");
    // Yaxis label for healthcare, so we need to rotate 90 degree
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -40)
        .attr("value", "healthcare") // value to grab for event listener
        .text("Lacks Healthcare (%)")
        .classed("active", true);
    // Yaxis label for smokers, so we need to rotate 90 degree
    var smokesLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -60)
        .attr("value", "smokes") // value to grab for event listener
        .text("Smokes (%)")
        .classed("inactive", true);
    // Yaxis label for obesity, so we need to rotate 90 degree
    var obeseLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -80)
        .attr("value", "obesity") // value to grab for event listener
        .text("Obese (%)")
        .classed("inactive", true);

    // initial tooltips
    circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // updates x scale for new data
                xLinearScale = xScale(item, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesXY = renderXCircles(circlesXY, xLinearScale, chosenXAxis);

                // updates circles text with new x values
                circlesText = renderXText(circlesText, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

                // changes classes to change bold text
                // Because if the input is age, so we need to deactivate other labels.
                // This is same for other labels
                if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "income") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                // updates y scale for new data
                yLinearScale = yScale(item, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesXY = renderYCircles(circlesXY, yLinearScale, chosenYAxis);

                // updates circles text with new y values
                circlesText = renderYText(circlesText, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

                // changes classes to change bold text
                if (chosenYAxis === "smokes") {
                    // Because the user choose the smoke, so we need to deactivate the other labels
                    // This is same for other labels
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "obesity") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                } else {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

});