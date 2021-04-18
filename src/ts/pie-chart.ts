import { Chart } from "./chart";
import { Text } from "./text.en";
import { Target } from "./achart-creator";


const d3 = require("d3")



export class PieChart extends Chart
{
  
  
  // Dimensions and margins of the chart:
  readonly CHART_WIDTH = this.CHART_HEIGHT
  readonly SVG_HEIGHT = this.CHART_Y + this.CHART_HEIGHT + this.MARGIN
  chart_x = this.MARGIN
  
  
  // Color scale:
  color : any
  
  // Mapping of legend item indices to first applicable data points:
  color_occurances : number[]
  
  
  create(data : object[], metadata : any, doc : Document) : string
  {
    
    // As pie charts only support a single data series,
    // make sure only the first value column is considered:
    if (!metadata.column)
    {
      metadata.column = 1;
    }
    
    
    this.init(data, metadata, doc, true);
    
    // The radius of the pie chart is half the width or half the height
    // (smallest one). I subtract a bit of margin:
    let radius = Math.min(this.CHART_WIDTH, this.CHART_HEIGHT) / 2;
    
    this.root.attr("aria-charttype", "pie")
        .attr("aria-roledescription", Text.CHART_TYPE.pie)
        .attr("font-size", 10);
    
    let dataset = this.root.append("g")
        .attr("id", "pie-chart")
        .attr("transform", "translate(" + (this.CHART_WIDTH / 2) + ","
            + (this.CHART_HEIGHT / 2) + ")")
        .attr("role", "dataset")
        .attr("aria-labelledby", "dataset-title")
        .attr("tabindex", "0");
    dataset.append( (metadata.tooltips) ? "title" : "desc")
            .attr("role", "heading")
            .attr("id", "dataset-title")
            .text(metadata.series_titles[0]);
    
    // set the color scale
    this.color = d3.scaleOrdinal()
        .domain(data.map( (d : any) =>
        {
          return d[this.names_columns[0]];
        }))
        .range(d3.schemeSet2);
    
    this.color_occurances = new Array<number>(this.color.domain().length);
    
    // Compute the position of each group on the pie:
    let pie = d3.pie().sort(null)
        .value( (d: any) =>
        {
          return d[this.values_columns[0]];
        });
    let data_ready = pie(data);
    
    // shape helper to build arcs:
    let arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
    
    // Another arc that won't be drawn. Just for positionning the
    // labels of the pie segments
    let outerArc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 1.3);
    
    let datapoints = dataset.selectAll("g")
        .data(data_ready)
        .enter()
        .append("g")
            .attr("role", "datapoint")
            .attr("tabindex", "0");
    
    if (metadata.target === Target.SCREEN_READER)
    {
      datapoints.attr("aria-labelledby", (d : any, i : number) =>
      {
        return "legenditem" + (this.assignLegendItemIndex(d, i) + 1)
            + " value" + (i+1) + " percentage" + (i+1);
      });
    }
    else
    {
      datapoints.attr("aria-labelledby", (d : any, i : number) =>
      {
        return "legenditem" + (this.assignLegendItemIndex(d, i) + 1);
      });
    }
    
    datapoints.append("path")
                .attr("d", arcGenerator)
                .attr('fill', (d: any) =>
                {
                  return this.color(d.data[this.names_columns[0]]);
                })
                .attr("stroke", "black")
                .style("opacity", 0.7);
    
    this.roundAttributeValue(datapoints.selectAll("path"), "d");
    
    
    // Now add the annotations. Use the centroid method to get the best coordinates
    
    let sum = 0, labels = undefined, percentage_start = "",
        percentage_end = "", label_positions = new Array<string>(data.length);
    
    datapoints.each( (d : any, i : number) =>
    {
      let coordinates = outerArc.centroid(d);
      label_positions[i] = this.round(coordinates[0]) + "," + this.round(coordinates[1]);
    });
    
    let tooltip = "";
    if (metadata.segment_values)
    {
      percentage_start = "(";
      percentage_end = ")";
      labels = datapoints.append("text")
          .attr("transform", (d: any, i : number) =>
          {
            return "translate(" + label_positions[i] + ")";
          })
          .attr("dy", "15")
          .style("text-anchor", "middle");
    }
    else if ( (metadata.tooltips) && (metadata.segment_percentages) )
    {
      labels = datapoints.append("title");
    }
    else
    {
      labels = datapoints.append("desc");
    }
    
    labels.attr("role", "datavalue")
        .attr("id", (d : any, i : number) =>
        {
          return "value" + (i+1);
        })
        .text( (d: any) =>
        {
          sum += d.data[this.values_columns[0]];
          return d.data[this.values_columns[0]];
        });
    
    if (metadata.segment_percentages)
    {
      sum /= 100;
      datapoints.append("text")
          .attr("id", (d : any, i : number) =>
          {
            return "percentage" + (i+1);
          })
          .text( (d: any) =>
          {
            return percentage_start +
                this.calculatePercentage(d, sum, metadata) + percentage_end;
          })
          .attr("transform", (d : any, i : number) =>
          {
            return "translate(" + label_positions[i] + ")";
          })
          .attr("dy", "30")
          .style("text-anchor", "middle");
    }
    
    else if (metadata.tooltips)
    {
      let tooltips = datapoints.append("title");
      
      if (!metadata.segment_values)
      {
        tooltips.text((d : any) =>
        {
          return d.data[this.values_columns[0]] + " (" +
              this.calculatePercentage(d, sum, metadata) + ")";
        });
      }
      else
      {
        tooltips.text((d : any) =>
        {
          return this.calculatePercentage(d, sum, metadata);
        });
      }
      
    }
    
    if (metadata.legend)
    {
      this.addLegend(metadata.legend_title, this.color, true);
    }
    else
    {
      
      let legend = this.root.append("g")
          .attr("role", "legend")
          .attr("aria-roledescription", Text.LEGEND)
          .attr("aria-labelledby", "legend-title")
          .attr("tabindex", "0")
          .attr("transform", "translate(" + (this.CHART_WIDTH / 2) + ","
              + (this.CHART_HEIGHT / 2) + ")");
      
      legend.append("desc")
          .attr("role", "heading")
          .attr("id", "legend-title")
          .text(metadata.legend_title);
      
      legend.selectAll("g")
          .data(this.color.domain())
          .enter()
          .append("g")
              .attr("role", "legenditem")
              .attr("tabindex", "0")
              .attr("id", (d : any, i : number) =>
              {
                return "legenditem" + (i+1);
              })
              .attr("transform", (d: any, i : number) =>
              {
                return "translate(" + label_positions[ this.color_occurances[i] ] + ")";
              })
              .style("text-anchor", "middle")
              .append("text")
                  .text( (d: any) =>
                  {
                    return d;
                  });
              
    }
    
    
    return d3.select(doc).select("body").html();
  }
  
  
  private assignLegendItemIndex(d : any, i : number) : number
  {
    let legend_item_index = this.color.domain().indexOf(d.data[this.names_columns[0]]);
    if (this.color_occurances[legend_item_index] === undefined)
    {
      this.color_occurances[legend_item_index] = i;
    }
    
    return legend_item_index;
  }
  
  
  private calculatePercentage(d : any, sum : number, metadata : any) : string
  {
    return Math.round( d.data[this.values_columns[0]] / sum * 100
        * metadata.label_round_factor ) / metadata.label_round_factor + " %";
  }
  
  
}