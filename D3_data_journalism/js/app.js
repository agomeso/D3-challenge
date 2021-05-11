// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 100,
        bottom: 100,
        right: 100,
        left: 100
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append SVG element
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append group element
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

    // function used for updating x-scale var upon click on axis label
    function xScale(stateData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.8,
            d3.max(stateData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);
        return xLinearScale;
    }

    // function used for updating y-scale var upon click on axis label
    function yScale(stateData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
            d3.max(stateData, d => d[chosenYAxis]) * 1.2
            ])
            .range([height, 0]);
        return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        return xAxis;
    }
    // function used for updating yAxis var upon click on axis label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
            .duration(1000)
            .call(leftAxis);
        return yAxis;
    }
    // function used for updating circles group with a transition to new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    };

    // function used for updating name tags
    function updateTags(tagGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        tagGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]) - 10)
            .attr("y", d => newYScale(d[chosenYAxis]) + 5);
        return tagGroup
    };

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
        var xlabel;
        if (chosenXAxis === "poverty") {
            xlabel = "Poverty";
        } else if (chosenXAxis === "age") {
            xlabel = "Age";
        } else if (chosenXAxis === "income") {
            xlabel = "Income";
        }
        var ylabel;
        if (chosenYAxis === "obesity") {
            ylabel = "Obesity";
        } else if (chosenYAxis === "smokes") {
            ylabel = "Smokes";
        } else if (chosenYAxis === "healthcare") {
            ylabel = "Healthcare";
        }

        var toolTip = d3.tip()
            .attr("class", "d3.tip")
            .offset([110, 10])
            .html(function (d) {
                return (`<b>${d.state}</b><br><b>${xlabel}:</b> ${d[chosenXAxis]}<br><b>${ylabel}:</b> ${d[chosenYAxis]}`);

            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function (data) {
            toolTip.show(data, this)
        })
            // .on("mouseover", function () {
            //     toolTip.enter()
            //         .append("circle")
            //         .attr("r", "20")
            //         .attr("stroke", "black")
            //         .attr("stroke-width", "5")
            // })
            // onmouseout event
            .on("mouseout", function (data, index) {
                toolTip.hide(data);
            });

        return circlesGroup;
    }

    // Retrieve data from the CSV file and execute everything below
    d3.csv("data/data.csv").then(function (stateData, err) {
        if (err) throw err;

        // parse data
        stateData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.povertyMoe = +data.povertyMoe;
            data.age = +data.age;
            data.ageMoe = +data.ageMoe;
            data.income = +data.income;
            data.incomeMoe = +data.incomeMoe;
            data.healthcare = +data.healthcare;
            data.healthcareLow = +data.healthcareLow;
            data.healthcareHigh = +data.healthcareHigh;
            data.obesity = +data.obesity;
            data.obesityLow = +data.obesityLow;
            data.obesityHigh = +data.obesityHigh;
            data.smokes = +data.smokes;
            data.povertyMoe = +data.povertyMoe;
            data.smokesLow = +data.smokesLow;
            data.smokesHigh = +data.smokesHigh;
        })
        // xLinearScale function above csv import
        var xLinearScale = xScale(stateData, chosenXAxis);

        // yLinearScale function above csv import
        var yLinearScale = yScale(stateData, chosenYAxis);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // Create a new group to correct d3 not appending all the state tags
        var newGroup = chartGroup.append("g")

        // append initial circles
        var circlesGroup = newGroup.selectAll("circle")
            .data(stateData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 20)
            .attr("fill", "blue")
            .attr("opacity", ".6");
        console.log(stateData)
        //append initial tags
        var tagGroup = newGroup.selectAll("text")
            .data(stateData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]) - 10)
            .attr("y", d => yLinearScale(d[chosenYAxis]) + 5)
            .text(d => d.abbr).attr("fill", "white");

        // Create group for three x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("House Hold Income (Median)");

        // Create group for three y-axis labels
        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");

        var obesityLabel = ylabelsGroup.append("text")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "obesity") // value to grab for event listener
            .attr("dy", "1em")
            .classed("active", true)
            .text("Obese (%)")

        var smokesLabel = ylabelsGroup.append("text")
            .attr("y", 20 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "smokes") // value to grab for event listener
            .attr("dy", "1em")
            .classed("inactive", true)
            .text("Smokes (%)");

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("y", 40 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("value", "healthcare") // value to grab for event listener
            .attr("dy", "1em")
            .classed("inactive", true)
            .text("Lacks Healthcare (%)");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // update tags for csv
        // var tagGroup = updateTags(tagGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var xvalue = d3.select(this).attr("value");
                if (xvalue !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = xvalue;

                    // console.log(chosenXAxis)

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(stateData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    //update tags
                    tagGroup = updateTags(tagGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // changes classes to change bold text
                    if (chosenXAxis === "poverty") {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenXAxis === "age") {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });

        // y axis labels event listener
        ylabelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var yvalue = d3.select(this).attr("value");
                if (yvalue !== chosenYAxis) {

                    // replaces chosenXAxis with value
                    chosenYAxis = yvalue;

                    // console.log(chosenXAxis)

                    // functions here found above csv import
                    // updates y scale for new data
                    yLinearScale = yScale(stateData, chosenYAxis);

                    // updates y axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // updates circles with new y values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    //update tags
                    tagGroup = updateTags(tagGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    // changes classes to change bold text
                    if (chosenYAxis === "obesity") {
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenYAxis === "smokes") {
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    }).catch(function (error) {
        console.log(error);
    });
};

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);