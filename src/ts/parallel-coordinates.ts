import { Chart } from "./chart";
import { Text } from "./text.en";
import { Target } from "./achart-creator";


const d3 = require("d3");



export class ParallelCoordinates extends Chart
{
  
  
  readonly CHART_WIDTH = 600
  readonly SVG_HEIGHT = this.CHART_Y + this.CHART_HEIGHT + 2 * this.AXIS_HEIGHT + this.MARGIN
  chart_x = this.MARGIN + this.AXIS_HEIGHT
  

  color : any
  ADD_COLOR = false
  unique_classes = []
  
  create(data : object[], metadata : any, doc : Document) : string
  {
    
    this.init(data, metadata, doc);

    if (metadata.colors.length > 0  && metadata.columns.length > 0){
      this.ADD_COLOR = true;
    }
    else{
      this.ADD_COLOR = false;
    }

    if (metadata.columns.length <= 0){
      this.values_columns_all = this.values_columns;
    }
    if (this.ADD_COLOR == true){
      var color_index = this.values_columns_all.indexOf(this.values_columns[this.values_columns.length-1]);
      this.values_columns.pop(); // remove last item because its only color
    }

    // console.log(this.values_columns_all)
    this.root.attr("aria-charttype", "line")
        .attr("aria-roledescription", Text.CHART_TYPE.parallelcoordinates);
    
    let xScale = undefined;
        
    if (this.numerical_names)
    {
      xScale = d3.scalePoint().range ([0, this.CHART_WIDTH]);
      xScale.domain(this.values_columns.map( (d: any) =>
      {
        return d;
      }));
    }
    else
    {
      xScale = d3.scalePoint().range ([0, this.CHART_WIDTH]);
      xScale.domain(this.values_columns.map( (d: any) =>
      {
        return d;
      }));
  
    }
    
    let yScales = [];
    let ymins = [];
    let ymaxs = [];
    for (let column_index = 0; column_index < this.values_columns.length; column_index++){
      let yScale = d3.scaleLinear().range ([this.CHART_HEIGHT, 0]);
      if (this.numeric_data[this.values_columns[column_index]] == false){
        yScale = d3.scalePoint().range([0, this.CHART_HEIGHT]);
        yScale.domain(data.map( (d: any) =>
        {
          return d[this.values_columns[column_index]];
        }));
      }
      else{
        var current_y_max = 0;
        var current_y_min = Infinity;
        for (var row_index = 0; row_index < data.length; row_index++)
        {
          var current_value = data[row_index][this.values_columns[column_index]];
          if (current_value >= current_y_max){
            current_y_max = current_value;
          }
          if (current_value <= current_y_min){
            current_y_min = current_value;
          }
        }
        current_y_min = Math.round(current_y_min - current_y_max/8);
        current_y_max = Math.round(current_y_max + current_y_max/8);
        // Map data values to y-scale:
        yScale.domain([current_y_min, current_y_max]);
      }

      yScales.push(yScale);
      ymins.push(current_y_min);
      ymaxs.push(current_y_max);
    }
    
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
        // .text(metadata.x_axis_title);
    
    // let ticks = xAxisGroup.call(d3.axisBottom(xScale).tickFormat( (d : any) =>
    //     {
    //       console.log(d);
    //       return d;
    //     })
    //     .ticks(10))
    //         .selectAll(".tick");

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
    
    
    
    // set the color scale
    // Get unique classes for color
    this.unique_classes = this.get_unique_classes(this.values_columns_all[color_index], data);

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
      // this.values_columns_all = this.names_columns.concat(this.values_columns_all);
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
      this.create_pc_grouped(data, metadata, xScale, yScales, color_index, group_to_use);
    }
    else{
      this.create_pc_ungrouped(data, metadata, xScale, yScales, color_index);
    }
    
    
    
    // Add a legend at the right:
    if (metadata.legend && this.ADD_COLOR == true)
    {
      this.addLegend(metadata.legend_title, this.color);
    }
    // group for y-axis
    for (let column_index = 0; column_index < this.values_columns.length; column_index++){
      var space_between_axis = this.CHART_WIDTH/(this.values_columns.length-1);
      let yAxisGroup = this.root.append("g")
          .attr("id", "yScale" + (column_index+1))
          .attr("role", "yaxis")
          .attr("aria-roledescription", "y-" + Text.AXIS)
          .attr("tabindex", "0")
          .attr("aria-valuemin", ymins[column_index])
          .attr("aria-valuemax", ymaxs[column_index])
          .attr("transform", "translate("+ column_index * space_between_axis +"," + 0 + ")");
      yAxisGroup.append("desc")
          .attr("role", "heading")
          .text( this.values_columns[column_index]);
      
      ticks = yAxisGroup.call(d3.axisLeft(yScales[column_index]).tickFormat( (d: any) =>
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
            return "y" + (column_index+1) + "-" + d
          });
    }
    
    return doc.documentElement.outerHTML;
  }
  
  create_pc_grouped(data: object[], metadata: any, xScale: any, yScales: any, color_index: number, group_to_use: any){
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
    let ParallelData = this.root.append("g")
        .attr("id", "dataarea")
        .attr("role", "dataset")
        .attr("aria-roledescription", Text.DATASET);
    
    // Following code could be waaay better...
    for (var group_data_index = 0; group_data_index < unique_classes_to_group.length; group_data_index++){
      let Parallel_group = ParallelData.append("g")
      .attr("id", "datagroup-" + (group_data_index + 1))
      .attr("role", "datagroup");
      
      let series_title_element = "desc";
      if (metadata.tooltips)
      {
        Parallel_group.attr("tabindex", "0");
        series_title_element = "title";
      }
      
      Parallel_group.attr("aria-labelledby",  "datagroup-title-" + (group_data_index + 1))
          .append(series_title_element)
              .attr("role", "heading")
              .attr("id", "datagroup-title-" + (group_data_index + 1))
              .text(unique_classes_to_group[group_data_index]);

      for (let data_index = 0; data_index < group_data[unique_classes_to_group[group_data_index]].length; data_index++){
        var current_line_data = [];
        
        for (let index = 0; index < this.values_columns.length; index++)
        {
          
          let y = group_data[unique_classes_to_group[group_data_index]][data_index][this.values_columns[index]];
          let y_scaled = yScales[index](group_data[unique_classes_to_group[group_data_index]][data_index][this.values_columns[index]]);
          let x = this.values_columns[index];
          current_line_data.push([x,y,y_scaled]);
        }
        let line = d3.line()
            .x( (d : any) =>
            {
              return xScale(d[0]);
            })   // set the x values for the line generator
            .y( (d: any) =>
            {
              return d[2];
            })   // set the y values for the line generator
            // .curve(d3.curveMonotoneX)
        
        
        let datapoints = Parallel_group.append("g")
            .attr("tabindex", "0")
            .attr("role", "datapoint"); //role="datavalue"
            // .selectAll(".dot")
            // .data(current_line_data)
            // .enter()
        if (this.ADD_COLOR == true){
          datapoints.append("path")
              .attr("class", "line")  
              .attr("stroke-width", "1")
              .attr("fill", "None") // Assign a class for styling
              .attr("d", Chart.roundString(line(current_line_data)))   // Calls the line generator
              .attr("stroke", this.color(group_data[unique_classes_to_group[group_data_index]][data_index][this.values_columns_all[color_index]]));
        }
        else{
          datapoints.append("path")
              .attr("class", "line")  
              .attr("stroke-width", "1")
              .attr("fill", "None") // Assign a class for styling
              .attr("d", Chart.roundString(line(current_line_data)))   // Calls the line generator
              .attr("stroke", "blue");
        }
  
        var text = ""
        var labelled_by_text = ""
        for (let datapoint_index = 0; datapoint_index < current_line_data.length; datapoint_index++){
          text += String(this.values_columns[datapoint_index]) + ": " + current_line_data[datapoint_index][1] + " ";
          labelled_by_text += "datavalue" + (group_data_index+1) + "-" + (data_index+1) + "-" + (datapoint_index+1) + " ";
        }
      
        datapoints.attr("aria-labelledby", () =>
        {
          if (this.ADD_COLOR == true){
            return `${labelled_by_text}legenditem${this.unique_classes.indexOf(data[data_index][this.values_columns_all[color_index]])+1}`;
          }
          return `${labelled_by_text}`;
        });

        if (metadata.tooltips)
        {
          datapoints.append("title")
          .text(text);
        }
        for (let datapoint_index = 0; datapoint_index < current_line_data.length; datapoint_index++){
          datapoints.append("desc")
              .attr("role", "datavalue")
              .attr("id", "datavalue" + (group_data_index+1) + "-" + (data_index+1) + "-" + (datapoint_index+1))
              .attr("aria-labelledby", "yScale"+(datapoint_index+1))
              .text(current_line_data[datapoint_index][1]);
        }
      }



    }

  }


  create_pc_ungrouped(data: object[], metadata: any, xScale: any, yScales: any, color_index: number){
    let ParallelData = this.root.append("g")
    .attr("id", "dataarea")
    .attr("role", "dataset")
    .attr("aria-roledescription", Text.DATASET);
    
    // let ParallelData = ParallelData.append("g")
    //       .attr("id", "datagroup-1" )
    //       .attr("role", "datagroup");

    for (let data_index = 0; data_index < data.length; data_index++){
      var current_line_data = [];
      for (let index = 0; index < this.values_columns.length; index++)
      {
        
        let y = data[data_index][this.values_columns[index]];
        let y_scaled = yScales[index](data[data_index][this.values_columns[index]]);
        let x = this.values_columns[index];
        current_line_data.push([x,y,y_scaled]);
      }
      let line = d3.line()
          .x( (d : any) =>
          {
            return xScale(d[0]);
          })   // set the x values for the line generator
          .y( (d: any) =>
          {
            return d[2];
          })   // set the y values for the line generator
          // .curve(d3.curveMonotoneX)
      
      
      let datapoints = ParallelData.append("g")
          .attr("tabindex", "0")
          .attr("role", "datapoint"); //role="datavalue"
          // .selectAll(".dot")
          // .data(current_line_data)
          // .enter()
      if (this.ADD_COLOR == true){
        datapoints.append("path")
            .attr("class", "line")  
            .attr("stroke-width", "1")
            .attr("fill", "None") // Assign a class for styling
            .attr("d", Chart.roundString(line(current_line_data)))   // Calls the line generator
            .attr("stroke", this.color(data[data_index][this.values_columns_all[color_index]]));
      }
      else{
        datapoints.append("path")
            .attr("class", "line")  
            .attr("stroke-width", "1")
            .attr("fill", "None") // Assign a class for styling
            .attr("d", Chart.roundString(line(current_line_data)))   // Calls the line generator
            .attr("stroke", "blue");
      }
      var text = ""
      var labelled_by_text = ""
      for (let datapoint_index = 0; datapoint_index < current_line_data.length; datapoint_index++){
        text += String(this.values_columns[datapoint_index]) + ": " + current_line_data[datapoint_index][1] + " ";
        labelled_by_text += "datavalue" + (data_index+1) + "-" + (datapoint_index+1) + " ";
      }
    
      datapoints.attr("aria-labelledby", () =>
      {
        if (this.ADD_COLOR == true){
          return `${labelled_by_text}legenditem${this.unique_classes.indexOf(data[data_index][this.values_columns_all[color_index]])+1}`;
        }
        return `${labelled_by_text}`;
      });
        
      
      if (metadata.tooltips)
      {
        datapoints.append("title")
        .text(text);
      }
      for (let datapoint_index = 0; datapoint_index < current_line_data.length; datapoint_index++){
        datapoints.append("desc")
            .attr("role", "datavalue")
            .attr("id", "datavalue" + (data_index+1) + "-" + (datapoint_index+1))
            .attr("aria-labelledby", "yScale"+(datapoint_index+1))
            .text(current_line_data[datapoint_index][1]);
      }
    }

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