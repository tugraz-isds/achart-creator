import { Chart } from "./chart";
import { Text } from "./text.en";
import { Target } from "./achart-creator";


const d3 = require("d3");



export class ScatterChart extends Chart
{
  
  
  readonly CHART_WIDTH = 600
  readonly SVG_HEIGHT = this.CHART_Y + this.CHART_HEIGHT + 2 * this.AXIS_HEIGHT + this.MARGIN
  chart_x = this.MARGIN + this.AXIS_HEIGHT
  
  ADD_COLOR = false
  ADD_SIZE = false
  
  color : any
  unique_classes = []
  // css style for points and line
  
  
  create(data : object[], metadata : any, doc : Document) : string
  {
    
    let x1 = 0;
    let x2 = 1;
    let size = 2;
    let color_index = 3;


    this.init(data, metadata, doc);

    if (this.values_columns.length == 3){
      this.ADD_SIZE = true;
    }
    if (this.values_columns.length == 4){
      this.ADD_SIZE = true;
      this.ADD_COLOR = true;
    }

    this.root.attr("aria-charttype", "scatter")
        .attr("aria-roledescription", Text.CHART_TYPE.scatter);
    
    
    let xScale = d3.scaleLinear().range([0, this.CHART_WIDTH]),
        yScale = d3.scaleLinear().range ([this.CHART_HEIGHT, 0]);
    

    var x_max = 0;
    var x_min = Infinity;
    for (var row_index = 0; row_index < data.length; row_index++)
    {
      var current_value = data[row_index][this.values_columns[x1]];
      if (current_value >= x_max){
        x_max = current_value;
      }
      if (current_value <= x_min){
        x_min = current_value;
      }
    }
    x_min = Math.round(x_min - x_max/8);
    x_max = Math.round(x_max + x_max/8);

    
    if (this.numeric_data[this.values_columns[x1]] == false){
      xScale = d3.scalePoint().range ([0, this.CHART_WIDTH]);
      xScale.domain(data.map( (d: any) =>
      {
        return d[this.values_columns[x1]];
      }));
    }
    else{
      xScale = d3.scaleLinear().range([0, this.CHART_WIDTH]);
      xScale.domain([x_min, x_max]);
    }
    
    var y_max = 0;
    var y_min = Infinity;
    for (var row_index = 0; row_index < data.length; row_index++)
    {
      var current_value = data[row_index][this.values_columns[x2]];
      if (current_value >= y_max){
        y_max = current_value;
      }
      if (current_value <= y_min){
        y_min = current_value;
      }
    }
    y_min = Math.round(y_min - y_max/8);
    y_max = Math.round(y_max + y_max/8);

    if (this.numeric_data[this.values_columns[x2]] == false){
      yScale = d3.scalePoint().range([0, this.CHART_HEIGHT]);
      yScale.domain(data.map( (d: any) =>
      {
        return d[this.values_columns[x2]];
      }));
    }
    else{
      yScale = d3.scaleLinear().range([0, this.CHART_HEIGHT]);
      yScale.domain([y_max, y_min]);
    }
    // group for x-axis
    let xAxisGroup = this.root.append("g");
    
    xAxisGroup.attr("id", "xScale")
        .attr("role", "xaxis")
        .attr("aria-roledescription", "x-" + Text.AXIS)
        .attr("aria-axistype", "")
        .attr("aria-labelledby", "x-title")
        .attr("tabindex", "0")
        .attr("aria-valuemin", x_min)
        .attr("aria-valuemax", x_max)
        .attr("transform", "translate("+ 0 +"," + this.CHART_HEIGHT + ")");
    
    // add title to x-axis:
    if (metadata.x_axis_title)
    {
      xAxisGroup.append("text")
          .attr("y", 50)
          .attr("x", this.CHART_WIDTH/2)
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .attr("font-size", "12")
          .attr("role", "heading")
          .attr("id", "x-title")
          .text(metadata.x_axis_title);
    }
    else{
      xAxisGroup.append("text")
          .attr("y", 50)
          .attr("x", this.CHART_WIDTH/2)
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .attr("font-size", "12")
          .attr("role", "heading")
          .attr("id", "x-title")
          .text(this.values_columns[x1]);
    }
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
    else
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
          .text(this.values_columns[x2]);
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
        .style("text-anchor", "end")
        .attr("transform", "rotate(" + metadata.y_label_rotation_degree + ")")
        .attr("id", (d : any, i : number) =>
        {
          return "y" + d
        });
    

    // set the color scale
    // Get unique classes for color
    this.unique_classes = this.get_unique_classes(this.values_columns[color_index], data);
    // If colors are given and each color maps a colum use all.
    // If colors are given and there are more colors than columns map them by index
    // else use all available colors and fill the rest with d3 schemeSet2
    let colors_per_class = [];
    if (metadata.colors.length == this.unique_classes.length){
      colors_per_class = metadata.colors;
    }
    else if (metadata.colors.length > this.unique_classes.length){
      for (let i = 0; i < this.unique_classes.length; i++){
        colors_per_class.push(metadata.colors[i]);
      }
    }
    else{
      colors_per_class = metadata.colors;
      for (let color of d3.schemeSet2){
        colors_per_class.push(color);
      }
    }
    this.color = d3.scaleOrdinal()
        .domain(this.unique_classes)
        .range(colors_per_class);
    
    var group_to_use = "";
    if ((metadata.group_by != "columns") && (metadata.group_by != "rows"))
    {
      this.values_columns_all = this.names_columns.concat(this.values_columns_all);
      var group_by = metadata.group_by.trim();
      if (!Number.isNaN(+(group_by))){
        group_to_use = this.values_columns_all[+(group_by)];
      }
      else if(this.values_columns_all.includes(group_by)) {
        group_to_use = group_by;
      }
      else {
        console.log("No Group found");
      }
    }
    if (group_to_use != ""){
      this.create_scatter_grouped(data, metadata, xScale, yScale, x1, x2, color_index, size, group_to_use);
    }
    else{
      this.create_scatter_ungrouped(data, metadata, xScale, yScale, x1, x2, color_index, size);
    }
    
    // Add a legend at the right:
    if (metadata.legend && this.ADD_COLOR == true)
    {
      this.addLegend(metadata.legend_title, this.color);
    }
    
    
    return doc.documentElement.outerHTML;
  }
  
  create_scatter_grouped(data: object[], metadata: any, xScale: any, yScale: any, x1: number, x2: number, color_index: number, size: number, group_to_use: any){
    var unique_classes_to_group = this.get_unique_classes(group_to_use, data);

    var group_data = {};
    for (var group_data_index = 0; group_data_index < unique_classes_to_group.length; group_data_index++){
      group_data[unique_classes_to_group[group_data_index]] = [];
    }
    for (var group_data_index = 0; group_data_index < unique_classes_to_group.length; group_data_index++){
      for (var row_index = 0; row_index < data.length; row_index++){
        if (data[row_index][group_to_use] == unique_classes_to_group[group_data_index]){
          group_data[unique_classes_to_group[group_data_index]].push(data[row_index]);
        }
      }
    }
    let ScatterData = this.root.append("g")
        .attr("id", "dataarea")
        .attr("role", "dataset")
        .attr("aria-roledescription", Text.DATASET);
    
    for (var group_data_index = 0; group_data_index < unique_classes_to_group.length; group_data_index++){
      let Scatter_group = ScatterData.append("g")
      .attr("id", "datagroup-" + (group_data_index + 1))
      .attr("role", "datagroup");

        
      let series_title_element = "desc";
      if (metadata.tooltips)
      {
        Scatter_group.attr("tabindex", "0");
        series_title_element = "title";
      }
      
      Scatter_group.attr("aria-labelledby",  "datagroup-title-" + (group_data_index + 1))
          .append(series_title_element)
              .attr("role", "heading")
              .attr("id", "datagroup-title-" + (group_data_index + 1))
              .text(unique_classes_to_group[group_data_index]);
      
      
      // Appends a circle for each datapoint:

      let datapoints = Scatter_group.selectAll(".dot")
          .data(group_data[unique_classes_to_group[group_data_index]])
          .enter()
          .append("g")
              .attr("tabindex", "0")
              .attr("role", "datapoint");
      
      if (metadata.target === Target.SCREEN_READER)
      {
        datapoints.attr("aria-labelledby", (d : any, i : number) =>
        {
          return `x1-${group_data_index + 1}-${i+1} x2-${group_data_index + 1}-${i+1}`;
        });
      }
      else
      {
        datapoints.attr("aria-labelledby", (d : any, i : number) =>
        {
          if (this.ADD_COLOR == true){
            return `x1-${group_data_index + 1}-${i+1} x2-${group_data_index + 1}-${i+1} legenditem${this.unique_classes.indexOf(d[this.values_columns[color_index]])+1}`;
          }
          return `x1-${group_data_index + 1}-${i+1} x2-${group_data_index + 1}-${i+1}`;
        });
      }
      
      if (metadata.tooltips)
      {
        datapoints.append("title")
            .text((d : any) =>
            {
              var return_string = "x1: " + d[this.values_columns[x1]] +
              ", x2: " + d[this.values_columns[x2]];
              if (this.ADD_SIZE == true){
                return_string += ", size: " + 
                d[this.values_columns[size]];
              }
              if (this.ADD_COLOR == true){
                return_string += ", class: " + 
                d[this.values_columns[color_index]];
              }
              return return_string
            });
    }
    
    datapoints.append("desc")
        .attr("role", "datavalue")
        .attr("id", (d : any, i : number) =>
        {
          return "x1-" + (group_data_index + 1) + "-" + (i+1);
        })
        .attr("aria-labelledby", "xScale")
        .text((d : any) =>
        {
          return d[this.values_columns[x1]];
        });
    datapoints.append("desc")
        .attr("role", "datavalue")
        .text( (d: any) =>
        {
          return d[this.values_columns[x2]];
        })
        .attr("aria-labelledby", "yScale")
        .attr("id", (d : any, i : number) =>
        {
          return "x2-" + (group_data_index + 1) + "-" + (i+1);
        });
    
    if (this.ADD_SIZE == true){
      var max_size = 0;
      var min_size = Infinity;
      for (var row_index = 0; row_index < data.length; row_index++)
      {
        var current_value = data[row_index][this.values_columns[size]];
        if (current_value >= max_size){
          max_size = current_value;
        }
        if (current_value <= min_size){
          min_size = current_value;
        }
      }
      var size_upper_bound = 7;
      var size_lower_bound = 4;
    }
    datapoints.append("circle")   // Uses the enter().append() method
        .attr("class", "dot")   // Assign a class for styling
        .attr("cx", (d: any) =>
        {
          return this.round(xScale(d[this.values_columns[x1]]))
        })
        .attr("cy", (d: any) =>
        {
          return this.round(yScale(d[this.values_columns[x2]]))
        })
        .attr("r", (d: any) => 
        {
          if (this.ADD_SIZE == true){
            var current_size = d[this.values_columns[size]];
            return (((current_size - min_size)/(max_size - min_size)) * (size_upper_bound - size_lower_bound)) + size_lower_bound;
          }
          return 5;
        }
        
        )
        .attr("fill", (d: any) =>
        {
          if (this.ADD_COLOR == true){
            return this.color((d[this.values_columns[color_index]]))
          }
          return "steelblue"
        });

    }
  }
  create_scatter_ungrouped(data: object[], metadata: any, xScale: any, yScale: any, x1: number, x2: number, color_index: number, size: number){
    let ScatterData = this.root.append("g")
        .attr("id", "dataarea")
        .attr("role", "dataset")
        .attr("aria-roledescription", Text.DATASET);
    
    if (metadata.series_titles[x2])
    {
      
      let series_title_element = "desc";
      if (metadata.tooltips)
      {
        ScatterData.attr("tabindex", "0");
        series_title_element = "title";
      }
      
      ScatterData.attr("aria-labelledby", "dataset-title")
          .append(series_title_element)
              .attr("role", "heading")
              .attr("id", "dataset-title")
              .text(metadata.series_titles[x2]);
    }
    
    // Appends a circle for each datapoint:
    let datapoints = ScatterData.selectAll(".dot")
        .data(data)
        .enter()
        .append("g")
            .attr("tabindex", "0")
            .attr("role", "datapoint");
    
    if (metadata.target === Target.SCREEN_READER)
    {
      datapoints.attr("aria-labelledby", (d : any, i : number) =>
      {
        return `x1-${i+1} x2-${i+1}`;
      });
    }
    else
    {
      datapoints.attr("aria-labelledby", (d : any, i : number) =>
      {
        if (this.ADD_COLOR == true){
          return `x1-${i+1} x2-${i+1} legenditem${this.unique_classes.indexOf(d[this.values_columns[color_index]])+1}`;
        }
        return `x1-${i+1} x2-${i+1}`;
      });
    }
    
    if (metadata.tooltips)
    {
      datapoints.append("title")
          .text((d : any) =>
          {
            var return_string = "x1: " + d[this.values_columns[x1]] +
            ", x2: " + d[this.values_columns[x2]];
            if (this.ADD_SIZE == true){
              return_string += ", size: " + 
              d[this.values_columns[size]];
            }
            if (this.ADD_COLOR == true){
              return_string += ", class: " + 
              d[this.values_columns[color_index]];
            }
            return return_string
          });
    }
    
    datapoints.append("desc")
        .attr("role", "datavalue")
        .attr("id", (d : any, i : number) =>
        {
          return "x1-" + (i+1);
        })
        .attr("aria-labelledby", "xScale")
        .text((d : any) =>
        {
          return d[this.values_columns[x1]];
        });
    datapoints.append("desc")
        .attr("role", "datavalue")
        .text( (d: any) =>
        {
          return d[this.values_columns[x2]];
        })
        .attr("aria-labelledby", "yScale")
        .attr("id", (d : any, i : number) =>
        {
          return "x2-" + (i+1);
        });
    
    if (this.ADD_SIZE == true){
      var max_size = 0;
      var min_size = Infinity;
      for (var row_index = 0; row_index < data.length; row_index++)
      {
        var current_value = data[row_index][this.values_columns[size]];
        if (current_value >= max_size){
          max_size = current_value;
        }
        if (current_value <= min_size){
          min_size = current_value;
        }
      }
      var size_upper_bound = 7;
      var size_lower_bound = 4;
    }
    datapoints.append("circle")   // Uses the enter().append() method
        .attr("class", "dot")   // Assign a class for styling
        .attr("cx", (d: any) =>
        {
          return this.round(xScale(d[this.values_columns[x1]]))
        })
        .attr("cy", (d: any) =>
        {
          return this.round(yScale(d[this.values_columns[x2]]))
        })
        .attr("r", (d: any) => 
        {
          if (this.ADD_SIZE == true){
            var current_size = d[this.values_columns[size]];
            return (((current_size - min_size)/(max_size - min_size)) * (size_upper_bound - size_lower_bound)) + size_lower_bound;
          }
          return 5;
        }
        
        )
        .attr("fill", (d: any) =>
        {
          if (this.ADD_COLOR == true){
            return this.color((d[this.values_columns[color_index]]))
          }
          return "steelblue"
        });
  }

  get_unique_classes(value_header: any, data: any) : any{
    // Get unique classes for color
    var unique_classes = [];
    for (var row_index = 0; row_index < data.length; row_index++){
      var current_class = data[row_index][value_header];
      if (!unique_classes.includes(current_class)){
        unique_classes.push(current_class);
      }
    }
    return unique_classes;
  }
}
