var weather;
var api="https://api.openweathermap.org/data/2.5/weather?q="
var APIkey="&appid=83c38bb8afdb2cca7fbede06a0a871b5";
var units="&units=imperial";

//customized cursor
let curs = document.querySelector('.cursor');

document.addEventListener('mousemove', (e) => 
{
  let x = e.pageX;
  let y = e.pageY;
  curs.cx = (x-50) + "px";
  curs.cy = (y-50) + "px";

  // console.log(curs);

  // console.log(e);
});

const el = document.activeElement;

var tempScale = d3.scaleLinear()
  .domain([90, 20])
  .range([0,1]);

var margin = { top: 0, right: 0, bottom: 0, left: 0 };

// console.log($("#" + vis.parentElement).width());
var svgWidth = $("#chart-area").width() - margin.left - margin.right;
var svgHeight = $( document ).height() - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var icon;

function setup() 
{
  var search = select('#city');
  var button = select('#submit');

  document.getElementById("city").addEventListener('focus', (event) => {
    document.getElementById("searchBar").style.padding = 0;
    document.getElementById("submit").style.opacity = 0;

    document.getElementById("cloudGroup").style.marginTop = "150px";
  });

  document.getElementById("city").addEventListener('focusout', (event) => {
    document.getElementById("searchBar").style.paddingTop = "10px";
    document.getElementById("submit").style.opacity = 100;

    document.getElementById("cloudGroup").style.marginTop = 0;
  });

  button.mousePressed(weatherAsk);
  search.mousePressed(searchClear);

  $( "#city" ).keypress(function(e) {

    if(e.keyCode ==13)
    {
      weatherAsk();
    }
  });

  var close = select('#close');
  close.mousePressed(closeForm);
  var open = select('#expand');
  open.mousePressed(openForm);

  weatherAsk();
}

function closeForm()
{
  console.log("sidebar closed");

  document.getElementById("info").style.transform = "translateX(-340px)";
  $("#close").hide();
  $("#expand").show();
}

function openForm()
{
  console.log("sidebar opened");

  document.getElementById("info").style.transform = "translateX(0)";
  $("#close").show();
  $("#expand").hide();
}

function weatherAsk()
{
  console.log("search clicked");
  var url=api+select('#city').value()+APIkey+units;
  loadJSON(url, gotData);
}

function searchClear()
{
  console.log("search bar clicked");
  
  var input = document.getElementById("city").value.replace(/\s/g, '');

  if (input == "SearchCity")
  {
    document.getElementById("city").value = "";
  }
}

function gotData(data)
{
  weather=data;
  console.log(data);

  //update weather data on screen
  document.getElementById("cloud").innerText= data.clouds.all+"%";
  document.getElementById("tempRange").innerText= data.main.temp_min+" - "+data.main.temp_max+"°F";
  document.getElementById("visibility").innerText= data.visibility/100+"%";

  // set weather icon to be cursor
  icon = weather.weather[0].icon;
  var iconUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
  $("body").css({'cursor': 'url('+iconUrl+') 50 50, auto'});

  document.getElementById("icon").href = iconUrl;

  // making node data
  var cities = [];
  for(var i =0; i<weather.clouds.all; i++)
  {
    var c = {
      "name": "",
      "coordinates": {},
      "temperature": 0,
      "minTemp": data.main.temp_min,
      "maxTemp": data.main.temp_max,
      "visibility": data.visibility,
      "humidity": data.main.humidity,
      "pressure": data.main.pressure,
      "wind": data.wind
    }

    cities.push(c);
  }

  //extreme case
  if(cities.length == 0)
  {
    console.log("EXTREME CASE: NO Cloud in the Current City");

    document.getElementById("cloud").innerHTML= "0 <span id='extreme'>* no clouds in current city </span>";
  }
  else
  {


  }

  var simulation = d3.forceSimulation(cities)
    .force('charge', d3.forceManyBody().strength(200))
    .force('center', d3.forceCenter(svgWidth/2, svgHeight/2))
    .force('collision', d3.forceCollide().radius(function(d){
      var temp = Math.floor(Math.random()*100)+1;

      if(temp< d.humidity)
      {
        return 40 *(d.humidity/100+1);
      }
      else
      {
        return 40;
      }
    }));

  svg.selectAll("circle").remove();

  var node = svg.selectAll(".node")
    .data(cities)
    .enter()
    .append("circle")
    .attr("r", function(d){

      var temp = Math.floor(Math.random()*100)+1;

      if(temp< d.humidity)
      {
        return 40 *(d.humidity/100+1);
      }
      else
      {
        return 40;
      }
    })
    .attr("class", function(d){

      if(d.index == 1)
      {
        return "cursor node";
      }
      else
      {
        return "node";
      }
    })
    .attr("fill", d3.interpolateGreys(1-weather.visibility/10000))
    .attr("opacity", function(d){

      if(d.index == 1)
      {
        console.log("found");

        return 0;
      }
      else
      {
        return .7;
      }
    })
    .on("mouseover", function(d) 
    {
      d3.select(this)
        .style("opacity", 1);
    })
    .on("mouseout", function(d) 
    {
      d3.select(this).style("opacity", .7);
    })
    .on("click", function(d)
    {
      d3.select(this)
        .style("opacity", 1)
        .attr("class", "distort")
        .attr("stroke", "white")
        .attr("stroke-width", "5px");
    });

  simulation.on("tick", function() 
  {
    // Update node coordinates

    // console.log(node);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  });

  // simulation.on("mouseover", function(e){
  //   let x = e.pageX;
  //   let y = e.pageY;
  //   curs.cx = (x-50) + "px";
  //   curs.cy = (y-50) + "px";

  // });

  node.call(d3.drag()
    .on("start", dragstart)
    .on("drag", drag)
    .on("end", dragend));

  function dragstart(d) 
  {
    if (!d.active) simulation.alphaTarget(0.3).restart();
    d.subject.fx = d.subject.x;
    d.subject.fy = d.subject.y;
  }

  function drag(d) 
  {
    d.subject.fx = d.x;
    d.subject.fy = d.y;
  }

  function dragend(d) 
  {
    if (!d.active) simulation.alphaTarget(0);
    d.subject.fx = null;
    d.subject.fy = null;
  }

  curs = document.querySelector('.cursor');

  if (weather)
  {
    var temp = weather.main.temp;
    var humidity = weather.main.humidity;
    var wind = weather.wind.speed;

    var minTemp =  weather.main.temp_min;
    var maxTemp = weather.main.temp_max;

    var gradient = "linear-gradient(" + d3.interpolateRdBu(tempScale(minTemp-5)) + "," + d3.interpolateRdBu(tempScale(maxTemp+5)) +")";

    svg.style("background-image", gradient);    
  }
}

var tempLegend = Legend(d3.scaleSequential([90, 20], d3.interpolateRdBu), {
  title: "Temperature (°F)"
});

document.getElementById("temp").appendChild(tempLegend);

var visLegend = Legend(d3.scaleSequential([100, 0], d3.interpolateGreys), {
  title: "Visibility (%)"
});

document.getElementById("vis").appendChild(visLegend);


//get user's GEO location
if (navigator.geolocation) 
{
  navigator.geolocation.getCurrentPosition(showPosition);
} 
else 
{ 
  console.log("Geolocation is not supported by this browser.");
}

function showPosition(position) 
{
  console.log(position);
}

function Legend(color, {
  title,
  tickSize = 6,
  width = 320, 
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues
} = {}) {

  function ramp(color, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block");

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length);

    x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
        .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
        {range() { return [marginLeft, width - marginRight]; }});

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds
        = color.thresholds ? color.thresholds() // scaleQuantize
        : color.quantiles ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold

    const thresholdFormat
        = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? d3.format(tickFormat)
        : tickFormat;

    x = d3.scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

    tickValues = d3.range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal
  else {
    x = d3.scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", color);

    tickAdjust = () => {};
  }

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "title")
        .text(title));

  return svg.node();
}