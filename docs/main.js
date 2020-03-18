var cases;
var minCases;
var maxCases;
var selectedDate = "3-17-2020";
var previousDate = "3-16-2020";
var pop2018 = {"Barnstable": 213413, "Berkshire": 126348, "Bristol": 564022, "Essex": 790638, "Hampden": 470406, "Hampshire":161355, "Middlesex": 1614714, "Norfolk": 705388, "Plymouth": 518132, "Suffolk": 807252, "Worcester": 830839, "Franklin": 70963, "Dukes":17352,"Nantucket":11327};

d3.json("data/cases.json", function(error, data) {
    console.log(data);
    cases=data;
    
    Object.keys(cases).forEach(c=>{
        var btn = document.createElement("BUTTON"); 
        let count = d3.sum(Object.values(cases[c])).toString();
        btn.innerHTML = '<span style="color:black">'+ c.replace("-2020","")+"</span> ("+count+")";    
        btn.id = c;
        btn.classList.add("dateSelectorButton");
        btn.onclick = function(){
            selectedDate = this.id;
            previousDate = Object.keys(cases)[Object.keys(cases).indexOf(this.id)-1] ? Object.keys(cases)[Object.keys(cases).indexOf(this.id)-1] : this.id;
            let currentCases = d3.sum(Object.values(cases[selectedDate]));
            let prevCases = d3.sum(Object.values(cases[previousDate]));
            let summary = "<b>"+currentCases.toString() + " total cases as of "+selectedDate+"</b>";
            if(selectedDate != previousDate)
                summary+="<br>"+(100*(currentCases-prevCases)/prevCases).toFixed(2)+"% increase relative to "+previousDate;
            let pop = d3.sum(Object.values(pop2018));
            summary+= "<br>"+(100*(currentCases)/pop).toFixed(4)+"% population relative to 2018 census"
            minCases = d3.min(Object.values(cases[selectedDate]));
            maxCases = d3.max(Object.values(cases[selectedDate]));
            document.getElementById("summary").innerHTML = summary;
            drawGraphic();
        }
        document.getElementById("dateSelector").appendChild(btn);
    });
    
    document.querySelectorAll(".dateSelectorButton")[Object.keys(cases).length-1].click();
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
                        let c = cases[selectedDate][name] != undefined ? cases[selectedDate][name]: 0;
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
            .text(function(d, i) {
                let name = d.properties.COUNTY.charAt(0).toUpperCase() + d.properties.COUNTY.slice(1).toLowerCase();
                let val = cases[selectedDate][name] != undefined ? cases[selectedDate][name]: 0;
                let extraTextMode = document.querySelector('input[name="percent"]:checked').value;
                if(extraTextMode == "pop")
                {
                    let percent = (100*val/pop2018[name]).toFixed(3)+"%";
                    return val.toString()+" ("+percent+")";
                }
                else if(extraTextMode == "daily")
                {
                    let prevVal = cases[previousDate][name] != undefined ? cases[previousDate][name]: 0;
                    let percent = val==prevVal ? "+0.0%" : "+"+(100*(val-prevVal)/prevVal).toFixed(0)+"%";
                    return val.toString()+" ("+percent+")";
                }
                else if(extraTextMode == "count")
                {
                    let prevVal = cases[previousDate][name] != undefined ? cases[previousDate][name]: 0;
                    return val.toString()+" (+"+(val-prevVal).toFixed(0)+")";
                }
                else{
                    return val;
                }
            })
            .attr("style","text-shadow:  0px 2px 2px rgba(255, 255, 255, 0.8)")
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
        let c = cases[selectedDate][name] != undefined ? cases[selectedDate][name].toString() : "None";
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
        let c = cases[selectedDate][name] != undefined ? cases[selectedDate][name]: 0;
        return c>0 ? d3.interpolateOranges((c-minCases)/maxCases) : "#fff";
      },
      stroke: "#aaa"
    });
    tooltip.transition()
        .duration(300) // ms
        .style("opacity", 0); // don't care about position!
}

function handleMouseClick(d,i){
//    var name = d.properties.COUNTY.charAt(0).toUpperCase() + d.properties.COUNTY.slice(1).toLowerCase()
//    document.getElementById("infoText").innerHTML = name;
}

function getBoundingBoxCenter (selection) {
  var element = selection.node();
  var bbox = element.getBBox();
  return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}

window.addEventListener("resize", drawGraphic);