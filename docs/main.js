var cases;
var minCases;
var maxCases;

d3.json("data/cases.json", function(error, data) {
    console.log(data);
    cases=data;
    let date = "March_16";
    let summary = d3.sum(Object.values(cases[date])).toString() + " total cases as of "+date.replace("_"," ");
    minCases = d3.min(Object.values(cases[date]));
    maxCases = d3.max(Object.values(cases[date]));
    document.getElementById("summary").innerHTML = summary;
    drawGraphic();
});

var projection;
var viewportWidth = document.documentElement.clientWidth;
var viewportHeight = document.documentElement.clientHeight/2;
var width = viewportWidth*0.9 < 1000 ? viewportWidth*0.9 : 1000 ;
var height = width/2;
var centerX, centerY;
var path;

var svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

let colorScale = d3.scale.category20b();
    
var featureCollection;
function drawGraphic(){
    d3.selectAll("path").remove();
    d3.selectAll("text").remove();
    viewportWidth = document.documentElement.clientWidth;
    viewportHeight = document.documentElement.clientHeight/2;
    width = viewportWidth*0.9 < 1000 ? viewportWidth*0.9 : 1000 ;
    height = width/2;

    path = d3.geo.path();

    svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height);
    
    d3.json("counties-small.topo.json", function(error, topology) {
        featureCollection = topojson.feature(topology, topology.objects["COUNTIES_POLYM"]);
        var bounds = d3.geo.bounds(featureCollection);

        centerX = d3.sum(bounds, function(d) {return d[0];}) / 2;
        centerY = d3.sum(bounds, function(d) {return d[1];}) / 2;

        projection = d3.geo.mercator()
            .scale(width*12)
            .center([centerX, centerY])
            .translate([width/2,height/2]);;

        path.projection(projection);

        svg.selectAll("path")
            .data(featureCollection.features)
            .enter().append("path")
            .attr("d", path)
            .style({
                      fill: function(d, i) {
                        let name = d.properties.COUNTY.charAt(0).toUpperCase() + d.properties.COUNTY.slice(1).toLowerCase()
                        let c = cases["March_16"][name] != undefined ? cases["March_16"][name]: 0;
                        return c>0 ? d3.interpolateOranges((c-minCases)/maxCases) : "#fff";
                      },
                      stroke: "#aaa"
                    })
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleMouseClick)
        
        var text = svg.selectAll("text")
            .data(featureCollection.features)
            .enter()
            .append("text")
            .text(function(d, i) {let name = d.properties.COUNTY.charAt(0).toUpperCase() + d.properties.COUNTY.slice(1).toLowerCase()
                       return cases["March_16"][name] != undefined ? cases["March_16"][name]: 0;})
            .attr("x", function(d,i) { return getBoundingBoxCenter(d3.select(d3.selectAll("path")[0][i]))[0] })
            .attr("y", function(d,i) { return getBoundingBoxCenter(d3.select(d3.selectAll("path")[0][i]))[1] });
    });
}


var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function handleMouseOver(d, i) {  
    var color = "#000"
    var name = d.properties.COUNTY.charAt(0).toUpperCase() + d.properties.COUNTY.slice(1).toLowerCase();
    var html  = "<span style='color:" + color + ";'>" + name + "</span><br/>";
    if(cases || false)
    {
        let c = cases["March_16"][name] != undefined ? cases["March_16"][name].toString() : "None";
        console.log(c);
        html += c
    }
    
    tooltip.html(html)
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
      .transition()
        .duration(200) // ms
        .style("opacity", .9) // started as 0!
}

function handleMouseOut(d, i) {
    d3.select(this).style({
      fill: function(d, i) {
        let name = d.properties.COUNTY.charAt(0).toUpperCase() + d.properties.COUNTY.slice(1).toLowerCase()
        let c = cases["March_16"][name] != undefined ? cases["March_16"][name]: 0;
        return c>0 ? d3.interpolateOranges((c-minCases)/maxCases) : "#fff";
      },
      stroke: "#aaa"
    });
    tooltip.transition()
        .duration(300) // ms
        .style("opacity", 0); // don't care about position!
}

function handleMouseClick(d,i){
    var name = d.properties.COUNTY.charAt(0).toUpperCase() + d.properties.COUNTY.slice(1).toLowerCase()
    document.getElementById("infoText").innerHTML = name;
}

function getBoundingBoxCenter (selection) {
  var element = selection.node();
  var bbox = element.getBBox();
  return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}

window.addEventListener("resize", drawGraphic);