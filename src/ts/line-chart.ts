import { Chart } from "./chart";
import { Text } from "./text.en";
import { Target } from "./achart-creator";


const d3 = require("d3");



export class LineChart extends Chart
{
  
  
  readonly CHART_WIDTH = 600
  readonly SVG_HEIGHT = this.CHART_Y + this.CHART_HEIGHT + 2 * this.AXIS_HEIGHT + this.MARGIN
  chart_x = this.MARGIN + this.AXIS_HEIGHT
  
  
  // css style for points and line
  
  readonly STYLE =
    `.line {
        fill: none;
        stroke-width: 3;
    }
    .overlay {
        fill: none;
        pointer-events: all;
    }
    
    /* Style the dots by assigning a fill and stroke */
    .dot {
        stroke: #fff;
    }
    
    .focus circle {
        fill: none;
        stroke: steelblue;
    }`;
  
  
  create(data : object[], metadata : any, doc : Document) : string
  {
    
    this.init(data, metadata, doc);
    
    
    this.root.attr("aria-charttype", "line")
        .attr("aria-roledescription", Text.CHART_TYPE.line);
    
    
    let xScale = undefined,
        yScale = d3.scaleLinear().range ([this.CHART_HEIGHT, 0]);
    
    if (this.numerical_names)
    {
      xScale = d3.scaleLinear().range([0, this.CHART_WIDTH]);
      xScale.domain([data[0][this.names_columns[0]], data[data.length - 1][this.names_columns[0]]]);
    }
    else
    {
      xScale = d3.scalePoint().range ([0, this.CHART_WIDTH]);
      xScale.domain(data.map( (d: any) =>
      {
        return d[this.names_columns[0]];
      }));
    }
    
    
    let y_min_values = <number[]>new Array(this.values_columns.length),
        y_max_values : number[] = new Array(this.values_columns.length);
    for (let value_index in this.values_columns)
    {
      y_min_values[value_index] = d3.min(data, (d: any) =>
      {
        return d[this.values_columns[value_index]];
      });
      y_max_values[value_index] = d3.max(data, (d: any) =>
      {
        return d[this.values_columns[value_index]];
      });
    }
    
    let y_min = Math.min(...y_min_values);
    y_min = Math.round(y_min - y_min/2);
    
    let y_max = Math.max(...y_max_values);
    y_max = Math.round(y_max + y_max/2);
    
    // Map data values to y-scale:
    yScale.domain([y_min, y_max]);
    
    // group for x-axis
    let xAxisGroup = this.root.append("g");
    
    xAxisGroup.attr("id", "xScale")
        .attr("role", "xaxis")
        .attr("aria-roledescription", "x-" + Text.AXIS)
        .attr("aria-axistype", "")
        .attr("aria-labelledby", "x-title")
        .attr("tabindex", "0")
        .attr("aria-valuemin", data[0][this.names_columns[0]])
        .attr("aria-valuemax", data[data.length - 1][this.names_columns[0]])
        .attr("transform", "translate("+ 0 +"," + this.CHART_HEIGHT + ")");
    
    // add title to x-axis:
    xAxisGroup.append("text")
        .attr("y", 50)
        .attr("x", this.CHART_WIDTH/2)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", "12")
        .attr("role", "heading")
        .attr("id", "x-title")
        .text(metadata.x_axis_title);
    
    let ticks = xAxisGroup.call(d3.axisBottom(xScale).tickFormat( (d : any) =>
        {
          return d;
        })
        .ticks(10))
            .selectAll(".tick");
    
    this.roundAttributeValue(ticks, "transform");
    
    ticks.select("text")
        .data(data)
        .attr("role", "axislabel")
        .attr("id", (d : any, i : number) =>
        {
          return "x" + (i+1);
        });
    
    
    // group for y-axis
    
    let yAxisGroup = this.root.append("g")
        .attr("id", "yScale")
        .attr("role", "yaxis")
        .attr("aria-roledescription", "y-" + Text.AXIS)
        .attr("tabindex", "0")
        .attr("aria-valuemin", y_min)
        .attr("aria-valuemax", y_max);
    
    // add title to y-axis:
    if (metadata.y_axis_title)
    {
      yAxisGroup.attr("aria-labelledby", "y-title");
      
      yAxisGroup.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -38)
          .attr("x", -this.CHART_HEIGHT/2)
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .attr("font-size", "12")
          .attr("role", "heading")
          .attr("id", "y-title")
          .text(metadata.y_axis_title);
    }
    else if (metadata.target)
    {
      // Insert a dummy title for Describler and common screen readers:
      yAxisGroup.attr("aria-labelledby", "y-title");
      
      yAxisGroup.append("desc")
          .attr("role", "heading")
          .text(Text.Y_AXIS_TITLE_REPLACEMENT);
    }
    
    ticks = yAxisGroup.call(d3.axisLeft(yScale).tickFormat( (d: any) =>
        {
          return d;
        })
        .ticks(10))
        .selectAll(".tick");
    
    this.roundAttributeValue(ticks, "transform");
    
    ticks.select("text")
        .attr("role", "axislabel")
        .attr("id", (d : any, i : number) =>
        {
          return "y" + d
        });
    
    let color = d3.scaleOrdinal()
        .domain(this.values_columns)
        .range(d3.schemeSet2);
    
    
    for (let index = 0; index < this.values_columns.length; index++)
    {
      
      let line = d3.line()
          .x( (d : any) =>
          {
            return xScale(d[this.names_columns[0]]);
          })   // set the x values for the line generator
          .y( (d: any) =>
          {
            return yScale(d[this.values_columns[index]]);
          })   // set the y values for the line generator
          .curve(d3.curveMonotoneX)   // apply smoothing to the line
      
      
      let lineData = this.root.append("g")
          .attr("id", "dataarea" + (index+1))
          .attr("role", "dataset")
          .attr("aria-roledescription", Text.DATASET);
      
      if (metadata.series_titles[index])
      {
        
        let series_title_element = "desc";
        if (metadata.tooltips)
        {
          lineData.attr("tabindex", "0");
          series_title_element = "title";
        }
        
        lineData.attr("aria-labelledby", "dataset-title" + (index+1))
            .append(series_title_element)
                .attr("role", "heading")
                .attr("id", "dataset-title" + (index+1))
                .text(metadata.series_titles[index]);
      }
      
      lineData.append("path")
          .attr("class", "line")   // Assign a class for styling
          .attr("d", Chart.roundString(line(data)))   // Calls the line generator
          .attr("stroke", color(this.values_columns[index]));
      
      // Appends a circle for each datapoint:
      let datapoints = lineData.selectAll(".dot")
          .data(data)
          .enter()
          .append("g")
              .attr("tabindex", "0")
              .attr("role", "datapoint");
      
      if (metadata.target === Target.SCREEN_READER)
      {
        datapoints.attr("aria-labelledby", (d : any, i : number) =>
        {
          return `name${index+1}-${i+1} value${index+1}-${i+1}`;
        });
      }
      else
      {
        datapoints.attr("aria-labelledby", (d : any, i : number) =>
        {
          return `name${index+1}-${i+1}`;
        });
      }
      
      if (metadata.tooltips)
      {
        datapoints.append("title")
            .text((d : any) =>
            {
              return d[this.names_columns[0]] + ": " +
                  d[this.values_columns[index]];
            });
      }
      
      datapoints.append("desc")
          .attr("role", "heading")
          .attr("id", (d : any, i : number) =>
          {
            return "name" + (index+1) + "-" + (i+1);
          })
          .text((d : any) =>
          {
            return d[this.names_columns[0]];
          });
      
      datapoints.append("circle")   // Uses the enter().append() method
          .attr("class", "dot")   // Assign a class for styling
          .attr("cx", (d: any) =>
          {
            return this.round(xScale(d[this.names_columns[0]]))
          })
          .attr("cy", (d: any) =>
          {
            return this.round(yScale(d[this.values_columns[index]]))
          })
          .attr("r", 5)
          .attr("fill", color(this.values_columns[index]));
      
      let datavalues = datapoints.append("desc")
          .attr("role", "datavalue")
          .text( (d: any) =>
          {
            return d[this.values_columns[index]];
          })
          .attr("id", (d : any, i : number) =>
          {
            return "value" + (index+1) + "-" + (i+1);
          });
      
      if ( (metadata.legend) && (metadata.target === Target.DESCRIBLER) )
      {
        datavalues.attr("aria-labelledby", "legenditem" + (index+1));
      }
    }
    
    // Add a legend at the right:
    if (metadata.legend)
    {
      this.addLegend(metadata.legend_title, color);
    }
    
    
    return doc.documentElement.outerHTML;
  }
  
}