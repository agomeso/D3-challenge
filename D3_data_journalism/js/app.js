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
        top: 50,
        bottom: 50,
        right: 50,
        left: 50
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

    /////Start Here
    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity"

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
    function renderAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        return xAxis;
    }
    // function used for updating yAxis var upon click on axis label
    function renderAxes(newYScale, yAxis) {
        var bottomAxis = d3.axisBottom(newYScale);
        yAxis.transition()
            .duration(1000)
            .call(bottomAxis);
        return xAxis;
    }
    // function used for updating circles group with a transition to new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis) {
        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]));
        return circlesGroup;
    }
    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {
        var xlabel;
        if (chosenXAxis === "poverty") {
            xlabel = "Poverty";
        } else if (chosenXAxis === "age") {
            xlabel = "Age";
        } else if (chosenXAxis === "income") {
            xlabel = "Income";
        }

        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function (d) {
                return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function (data) {
            toolTip.show(data);
        })
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

        // Create y scale function
        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(stateData, d => d.num_hits)]) ///Need new Y come back HERE
            .range([height, 0]);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        chartGroup.append("g")
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(stateData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 20)
            .attr("fill", "blue")
            .attr("opacity", ".5");

        // Create group for two x-axis labels
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        var incomeLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median");

        // append y axis
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("axis-text", true)
            .text("Number of Billboard 500 Hits");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // x axis labels event listener
        labelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    // console.log(chosenXAxis)

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(stateData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

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
                    } else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    }).catch(function (error) {
        console.log(error);
    });
    /////Stop HERE

    // Import Data
    d3.csv("data/data.csv").then(function (stateData) {

        // Step 1: Parse Data/Cast as numbers
        //id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,healthcareHigh,
        //obesity, obesityLow, obesityHigh, smokes, smokesLow, smokesHigh, -0.385218228
        // ==============================
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
        });

        // Step 2: Create scale functions
        // ==============================
        var xLinearScale = d3.scaleLinear()
            .domain([20, d3.max(hairData, d => d.hair_length)])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(hairData, d => d.num_hits)])
            .range([height, 0]);

        // Step 3: Create axis functions
        // ==============================
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Step 4: Append Axes to the chart
        // ==============================
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // Step 5: Create Circles
        // ==============================
        var circlesGroup = chartGroup.selectAll("circle")
            .data(hairData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.hair_length))
            .attr("cy", d => yLinearScale(d.num_hits))
            .attr("r", "15")
            .attr("fill", "pink")
            .attr("opacity", ".5");

        // Step 6: Initialize tool tip
        // ==============================
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function (d) {
                return (`${d.rockband}<br>Hair length: ${d.hair_length}<br>Hits: ${d.num_hits}`);
            });

        // Step 7: Create tooltip in the chart
        // ==============================
        chartGroup.call(toolTip);

        // Step 8: Create event listeners to display and hide the tooltip
        // ==============================
        circlesGroup.on("click", function (data) {
            toolTip.show(data, this);
        })
            // onmouseout event
            .on("mouseout", function (data, index) {
                toolTip.hide(data);
            });

        // Create axes labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .text("Number of Billboard 100 Hits");

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .attr("class", "axisText")
            .text("Hair Metal Band Hair Length (inches)");
    }).catch(function (error) {
        console.log(error);
    });

    // When the browser loads, makeResponsive() is called.
    makeResponsive();

    // When the browser window is resized, makeResponsive() is called.
    d3.select(window).on("resize", makeResponsive);

///Hair exercise

// var svgWidth = 960;
// var svgHeight = 500;

// var margin = {
//     top: 20,
//     right: 40,
//     bottom: 60,
//     left: 100
// };

// var width = svgWidth - margin.left - margin.right;
// var height = svgHeight - margin.top - margin.bottom;

// // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
// var svg = d3.select(".chart")
//     .append("svg")
//     .attr("width", svgWidth)
//     .attr("height", svgHeight);

// var chartGroup = svg.append("g")
//     .attr("transform", `translate(${margin.left}, ${margin.top})`);

// // Import Data
// d3.csv("hairData.csv").then(function (hairData) {

//     // Step 1: Parse Data/Cast as numbers
//     // ==============================
//     hairData.forEach(function (data) {
//         data.hair_length = +data.hair_length;
//         data.num_hits = +data.num_hits;
//     });

//     // Step 2: Create scale functions
//     // ==============================
//     var xLinearScale = d3.scaleLinear()
//         .domain([20, d3.max(hairData, d => d.hair_length)])
//         .range([0, width]);

//     var yLinearScale = d3.scaleLinear()
//         .domain([0, d3.max(hairData, d => d.num_hits)])
//         .range([height, 0]);

//     // Step 3: Create axis functions
//     // ==============================
//     var bottomAxis = d3.axisBottom(xLinearScale);
//     var leftAxis = d3.axisLeft(yLinearScale);

//     // Step 4: Append Axes to the chart
//     // ==============================
//     chartGroup.append("g")
//         .attr("transform", `translate(0, ${height})`)
//         .call(bottomAxis);

//     chartGroup.append("g")
//         .call(leftAxis);

//     // Step 5: Create Circles
//     // ==============================
//     var circlesGroup = chartGroup.selectAll("circle")
//         .data(hairData)
//         .enter()
//         .append("circle")
//         .attr("cx", d => xLinearScale(d.hair_length))
//         .attr("cy", d => yLinearScale(d.num_hits))
//         .attr("r", "15")
//         .attr("fill", "pink")
//         .attr("opacity", ".5");

//     // Step 6: Initialize tool tip
//     // ==============================
//     var toolTip = d3.tip()
//         .attr("class", "tooltip")
//         .offset([80, -60])
//         .html(function (d) {
//             return (`${d.rockband}<br>Hair length: ${d.hair_length}<br>Hits: ${d.num_hits}`);
//         });

//     // Step 7: Create tooltip in the chart
//     // ==============================
//     chartGroup.call(toolTip);

//     // Step 8: Create event listeners to display and hide the tooltip
//     // ==============================
//     circlesGroup.on("click", function (data) {
//         toolTip.show(data, this);
//     })
//         // onmouseout event
//         .on("mouseout", function (data, index) {
//             toolTip.hide(data);
//         });

//     // Create axes labels
//     chartGroup.append("text")
//         .attr("transform", "rotate(-90)")
//         .attr("y", 0 - margin.left + 40)
//         .attr("x", 0 - (height / 2))
//         .attr("dy", "1em")
//         .attr("class", "axisText")
//         .text("Number of Billboard 100 Hits");

//     chartGroup.append("text")
//         .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
//         .attr("class", "axisText")
//         .text("Hair Metal Band Hair Length (inches)");
// }).catch(function (error) {
//     console.log(error);
// });


// ////Multiple axis selection

// var svgWidth = 960;
// var svgHeight = 500;

// var margin = {
//     top: 20,
//     right: 40,
//     bottom: 60,
//     left: 100
// };

// var width = svgWidth - margin.left - margin.right;
// var height = svgHeight - margin.top - margin.bottom;

// // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
// var svg = d3.select(".chart")
//     .append("svg")
//     .attr("width", svgWidth)
//     .attr("height", svgHeight);

// var chartGroup = svg.append("g")
//     .attr("transform", `translate(${margin.left}, ${margin.top})`);