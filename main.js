

var width = 600;
var height = 520;
var margin = { top: 0, left: 20, bottom: 40, right: 10 };
var filteredStorms;

function createDiameterScales(dataset) {
    tsDiameterXScale = d3.scaleLinear(d3.extent(dataset, d => d.ts_diameter), [margin.left, margin.left + width+250]);
    tsDiameterYScale = d3.scaleLinear(d3.extent(dataset, d => d.nameyear), [margin.top, margin.top + height+250]);
}

function createWindSpeedScales(dataset) {
    //windSpeedXScale = d3.scaleLinear(d3.extent(dataset, d => d.windSpeed), [0, 450]);
    windSpeedXScale = d3.scaleLinear([0,110], [0, 450]);
    //windSpeedYScale = d3.scaleLinear(d3.extent(dataset, d => d.length), [30+500, 30]);
    windSpeedYScale = d3.scaleLinear([0,500], [30+500, 30]);
    var nodeTypes = d3.map(dataset, function(d){return d.type;}).keys();
    colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(nodeTypes);
}

function computeLengthOfStorm() {
    // adding the NameYear attribute and computing the length of each storm in hours
    countOfStorms = {};
    speedOfStorms = {};
    storms.forEach(s => {
        s.nameyear = (s.name).concat(",", s.year);
        countOfStorms[s.nameyear] = 0;
        speedOfStorms[s.nameyear] = 0;
    });
    // console.log(storms);

    storms.forEach(s => {
        countOfStorms[s.nameyear] += 1;
        speedOfStorms[s.nameyear] += +s.wind;
    });
    // console.log(countOfStorms);
 
    for (var k in speedOfStorms) {
        speedOfStorms[k] = speedOfStorms[k] / countOfStorms[k] 
    }
    for (var k in countOfStorms) {
        countOfStorms[k] *= 6
    }
    storms.forEach(s => {
        s.length = countOfStorms[s.nameyear];
        s.windSpeed = speedOfStorms[s.nameyear];
    });
    // console.log(countOfStorms);    

}

d3.csv('storms.csv').then(function(dataset) {
    storms = dataset;
    computeLengthOfStorm();

    filteredStorm = filterStorm(storms);
    console.log(filteredStorm);
    //CREATE SCALE
    createWindSpeedScales(filteredStorm);
    //DRAW WIND SPEED
    drawWindSpeed(filteredStorm);
});

function filterStorm(dataset) {
    var nest = d3.nest()
        .key(function(d) { return d.nameyear;})
        .entries(dataset);
    nest.forEach((s,index) => {
        nest[index] = s.values[0];
    });
    return nest;
}

function drawDiameter() {
    
}

function drawWindSpeed(dataset) {
    
    var svg = d3.select('svg');
    var g = svg.selectAll("g")
    .data(dataset)
    .enter()
    .append("g")
    .attr("transform", function(d) {
        return "translate(" + windSpeedXScale(d.windSpeed)+ ", " + windSpeedYScale(d.length) + ")";
    })
    
    g.append("circle")
        .attr("r", 2)
        .style('fill', function(d){
                return colorScale(d.category);
            });

    svg.append('g').attr('class', 'x axis')
        .attr('transform', 'translate(0,500)')
        .call(d3.axisTop(windSpeedXScale).tickFormat(function(d){return d;}));
    svg.append('g').attr('class', 'y axis')
        .attr('transform', 'translate(0,0)')
        .call(d3.axisRight(windSpeedYScale).tickFormat(function(d){return d;}));
        
        /* .attr("class", function(d) {
        return d.rank <=3 ? 'topPlayers': 'normalPlayers';
        }) */
}

