import { Chart } from "./chart";
import { Text } from "./text.en";
import { Target } from "./achart-creator";

const d3 = require("d3");

export class BarChartGrouped extends Chart
{
  readonly CHART_WIDTH = 600
  readonly SVG_HEIGHT = this.CHART_Y + this.CHART_HEIGHT + 2 * this.AXIS_HEIGHT + this.MARGIN
  chart_x = this.MARGIN + this.AXIS_HEIGHT
  
  // Color scale:
  color : any
  
  // Mapping of legend item indices to first applicable data points:
  color_occurances : number[]

  create(data : object[], metadata : any, doc : Document) : string
  {
    this.init(data, metadata, doc);

    // Chart root
    this.root.attr("aria-charttype", "bar-grouped")
        .attr("aria-roledescription", Text.CHART_TYPE.bargroup);
    
    let xScale = d3.scaleBand().range ([0, this.CHART_WIDTH]).padding(0.4),
    yScale = d3.scaleLinear().range ([this.CHART_HEIGHT, 0]);
    
    var y_max = 0;
    var y_min = Infinity;
    for (var row_index = 0; row_index < data.length; row_index++)
    {
      for (var col_index = 0; col_index < this.values_columns.length; col_index++)
      {
        if (data[row_index][this.values_columns[col_index]] >= y_max)
        {
          y_max = data[row_index][this.values_columns[col_index]];
        }
        if (data[row_index][this.values_columns[col_index]] <= y_min)
        {
          y_min = data[row_index][this.values_columns[col_index]];
        }
      }
    }
    y_min = Math.round(y_min - y_min/4);
    y_max = Math.round(y_max + y_max/4);
    
    // map data values to x and y scale
    xScale.domain(data.map( (d: any) =>
    {
      return d[this.names_columns[0]];
    }));
   
    yScale.domain([y_min, y_max]);
    
    // group for x-axis:
    let xAxisGroup = this.root.append("g");
    xAxisGroup.attr("id", "xScale")
        .attr("role", "xaxis")
        .attr("aria-axistype", "category")
        .attr("aria-roledescription", "x-" + Text.AXIS)
        .attr("aria-labelledby", "x-title")
        .attr("tabindex", "0")
        .attr("transform", "translate(0," + this.CHART_HEIGHT + ")");
    
    // add title to x-axis
    xAxisGroup.append("text")
        .attr("y", 2.5 * this.AXIS_HEIGHT)
        .attr("x", this.CHART_WIDTH/2)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", "12")
        .attr("role", "heading")
        .attr("id", "x-title")
        .text(metadata.x_axis_title);
    
    let ticks = xAxisGroup.call(d3.axisBottom(xScale).ticks(10))
        .selectAll(".tick");
    
    this.roundAttributeValue(ticks, "transform");
    
    ticks.select("text")
        .data(data)
        .attr("role", "axislabel")
        .style("text-anchor", (metadata.x_label_rotation_degree != "0") ? "end": "middle")
        .attr("transform", "rotate(" + metadata.x_label_rotation_degree + ")")
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
        .attr("aria-valuemax", y_max)
        .attr("aria-labelledby", "y-title");
    
    // add title to y-axis
    yAxisGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -38)
        .attr("x", -this.CHART_HEIGHT/2)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("role", "heading")
        .attr("id", "y-title")
        .attr("font-size", "12")
        .text(metadata.y_axis_title);
    
    ticks = yAxisGroup.call(d3.axisLeft(yScale).tickFormat( (d: any) =>
        {
          return d;
        })
        .ticks(10))
        .selectAll(".tick");
    
    this.roundAttributeValue(ticks, "transform");
    
    ticks.select("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(" + metadata.y_label_rotation_degree + ")")
        .attr("id", (d : any, i : number) =>
        {
          return "y" + (i+1);
        });
    
    // set the color scale

    // If colors are given and each color maps a colum use all.
    // If colors are given and there are more colors than columns map them by index
    // else use all available colors and fill the rest with d3 schemeSet2
    let colors_per_column = [];
    if (metadata.colors.length == this.values_columns.length){
      colors_per_column = metadata.colors;
    }
    else if (metadata.colors.length > this.values_columns.length){
      for (let i = 0; i < this.values_columns_all.length; i++){
        if (this.values_columns.includes(this.values_columns_all[i])){
          colors_per_column.push(metadata.colors[i]);
        }
      }
    }
    else{
      colors_per_column = metadata.colors;
      for (let color of d3.schemeSet2){
        colors_per_column.push(color);
      }
    }
    this.color = d3.scaleOrdinal()
        .domain(this.values_columns)
        .range(colors_per_column);
    
    this.color_occurances = new Array<number>(this.color.domain().length);
    let dataset = this.root.append("g")
      .attr("id", "dataset")
      .attr("role", "dataset")
      .attr("tabindex", "0")
    let series_title_element = "desc";
      if (metadata.tooltips)
      {
        dataset.attr("tabindex", "0");
        series_title_element = "title";
      }
      
      dataset.attr("aria-labelledby", "dataset-title")
          .append(series_title_element)
              .attr("role", "heading")
              .attr("id", "dataset-title")
              .text(metadata.chart_title);
    
    if (metadata.group_by == "rows"){
      this.create_cahrt_rows(data, metadata, dataset, xScale, yScale);
    }
    else if (metadata.group_by == "columns"){
      this.create_cahrt_columns(data, metadata, dataset, xScale, yScale);
    }
    

    // Add Legend

    if (metadata.legend)
    {
      this.addLegend(metadata.legend_title, this.color, true);
    }

    return doc.documentElement.outerHTML;
  }
  create_cahrt_columns(data: object[], metadata: any, dataset: any, xScale: any, yScale: any){
    for (let current_data_column_index = 0; current_data_column_index < this.values_columns.length; current_data_column_index++) {
      let bar = dataset.append("g")
          .attr("id", "datagroup-" + (current_data_column_index + 1))
          .attr("role", "datagroup");
      
      // If there's a data series title:
      if (metadata.series_titles[current_data_column_index])
      {
        
        let series_title_element = "desc";
        if (metadata.tooltips)
        {
          bar.attr("tabindex", "0");
          series_title_element = "title";
        }
        
        bar.attr("aria-labelledby", "datagroup-title-" + (current_data_column_index + 1))
            .append(series_title_element)
                .attr("role", "heading")
                .attr("id", "datagroup-title-" + (current_data_column_index + 1))
                .text(metadata.series_titles[current_data_column_index]);
      }
      
    
      // add the bars to the chart
      let bandwidth = this.round(xScale.bandwidth()/this.values_columns.length);
      let datapoints = bar.selectAll(".bar")
          .data(data)
          .enter()
          .append("g")
              .attr("tabindex", "0")
              .attr("transform", (d: any) =>
              {
                return "translate(" + this.round((bandwidth * current_data_column_index) + xScale(d[this.names_columns[0]]))
                    + "," + this.round(yScale(d[this.values_columns[current_data_column_index]])) + ")";
              })
              .attr("role", "datapoint");
      
      if (metadata.target === Target.SCREEN_READER)
      {
        datapoints.attr("aria-labelledby", (d : any, i : number) =>
        {
          return "x" + ( xScale.domain().indexOf(d[this.names_columns[0]]) + 1)
              + " value" + (current_data_column_index + 1) + "-" + (i+1);
        });
      }
      else
      {
        datapoints.attr("aria-labelledby", (d : any, i : number) =>
        {
          return "x" + ( xScale.domain().indexOf(d[this.names_columns[0]]) + 1);
        });
      }
      
      // let bandwidth = this.round(xScale.bandwidth());
      
      datapoints.append("rect")
          .attr('fill', this.color(this.values_columns[current_data_column_index]))
          .attr("width", bandwidth)
          .attr("height", (d: any) =>
          {
            return this.round(this.CHART_HEIGHT - yScale(d[this.values_columns[current_data_column_index]]));
          });
      
      // Add values to bars
      let labels = undefined;
      bandwidth = this.round(bandwidth / 2);
      if (metadata.bar_values)
      {
        labels = datapoints.append("text")
            .attr("x", bandwidth)
            .attr("y", "10")
            .attr("text-anchor", "middle")
            .attr("font-size", "5")
            .attr("fill", "black");
      }
      else if (metadata.tooltips)
      {
        labels = datapoints.append("title");
      }
      else
      {
        labels = datapoints.append("desc");
      }
      
      labels.text( (d: any) =>
      {
        return d[this.values_columns[current_data_column_index]];
      })
          .attr("role", "datavalue")
          .attr("id", (d : any, i : number) =>
          {
            return "value" + (current_data_column_index + 1) + "-" + (i+1);
          });
      }
  }

  create_cahrt_rows(data: object[], metadata: any, dataset: any, xScale: any, yScale: any){
    for (let current_data_row_index = 0; current_data_row_index < data.length; current_data_row_index++) {
      let bar = dataset.append("g")
          .attr("id", "datagroup-" + (current_data_row_index + 1))
          .attr("role", "datagroup");
      
      // If there's a data series title:
      let series_title_element = "desc";
        if (metadata.tooltips)
        {
          bar.attr("tabindex", "0");
          series_title_element = "title";
        }
        
        bar.attr("aria-labelledby", "datagroup-title-" + (current_data_row_index + 1))
            .append(series_title_element)
                .attr("role", "heading")
                .attr("id", "datagroup-title-" + (current_data_row_index + 1))
                .text(data[current_data_row_index][this.names_columns[0]]);
      
    
      // add the bars to the chart
      let bandwidth = this.round(xScale.bandwidth()/this.values_columns.length);
      let datapoints = bar.selectAll(".bar")
          .data(this.values_columns)
          .enter()
          .append("g")
              .attr("tabindex", "0")
              .attr("transform", (d: any, i: number) =>
              {
                return "translate(" + this.round((bandwidth * i) + xScale(data[current_data_row_index][this.names_columns[0]]))
                    + "," + this.round(yScale(data[current_data_row_index][d])) + ")";
              })
              .attr("role", "datapoint");
      
      if (metadata.target === Target.SCREEN_READER)
      {
        datapoints.attr("aria-labelledby", (d : any, i : number) =>
        {
          return "legenditem" + (i+1)
              + " value" + (current_data_row_index + 1) + "-" + (i+1);
        });
      }
      else
      {
        datapoints.attr("aria-labelledby", (d : any, i : number) =>
        {
          return "legenditem" + (i+1);
        });
      }
      
      // let bandwidth = this.round(xScale.bandwidth());
      
      datapoints.append("rect")
          .attr('fill', (d: any) =>
          {
            return this.color(d);
          })
          .attr("width", bandwidth)
          .attr("height", (d: any) =>
          {
            return this.round(this.CHART_HEIGHT - yScale(data[current_data_row_index][d]));
          });
      
      // Add values to bars
      let labels = undefined;
      bandwidth = this.round(bandwidth / 2);
      if (metadata.bar_values)
      {
        labels = datapoints.append("text")
            .attr("x", bandwidth)
            .attr("y", "10")
            .attr("text-anchor", "middle")
            .attr("font-size", "5")
            .attr("fill", "black");
      }
      else if (metadata.tooltips)
      {
        labels = datapoints.append("title");
      }
      else
      {
        labels = datapoints.append("desc");
      }
      
      labels.text( (d: any) =>
      {
        return data[current_data_row_index][d];
      })
          .attr("role", "datavalue")
          .attr("id", (d : any, i : number) =>
          {
            return "value" + (current_data_row_index + 1) + "-" + (i+1);
          });
      }
  }
}
