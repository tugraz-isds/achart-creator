import { Target } from "./achart-creator";
import { Text } from "./text.en";


const d3 = require("d3");



// Base class for all charts

export abstract class Chart
{
  
  
  // Container for possible CSS:
  readonly STYLE : string
  
  // Width of a possible legend at the right:
  readonly LEGEND_WIDTH = 200
  
  
  // Dimensions and margins of the chart
  
  readonly CHART_HEIGHT = 400
  readonly MARGIN = 50
  readonly AXIS_HEIGHT = 25
  readonly CHART_Y = 2 * this.MARGIN
  
  // different for cartesian and non-cartesian charts:
  readonly CHART_WIDTH : number
  chart_x : number   // also depends on presence of y-axis title
  
  // Dimensions of the SVG:
  readonly SVG_HEIGHT : number
  svg_width : number
  
  
  // SVG elements
  
  svg : any
  root : any
  chartarea : any
  title : any
  
  
  // Headers of the CSV columns
  
  names_columns : string[]
  values_columns : string[]
  
  
  // States if x-axis is numerical or categorical:
  numerical_names = true
  
  
  public static svg_round_factor = 1000
  
  
  abstract create(data : object[], metadata : any, doc : Document) : string;
  
  
  init(data : object[], metadata : any, doc : Document,
      single_series_legend = false) : void
  {
    
    
    // Extract CSV column headers:
    let headers = Object.keys(data[0]);
    
    // CSV header of the first column:
    this.names_columns = [headers[0]];
    
    
    // Determine the CSV headers of the data column(s);
    // if a data column is specified, only consider this one
    
    if (metadata.column)
    {
      
      // Exit if the stated column number is
      // greater than the number of CSV columns:
      if (metadata.column >= headers.length)
      {
        console.error(Text.ERROR + Text.CSV_HAS_ONLY +
            (headers.length-1) + Text.VALUE_COLUMNS);
        process.exit(3);
      }
      
      this.values_columns = [headers[metadata.column]];
    }
    else
    {
      this.values_columns = headers.slice(1);
    }

    // Check if the grouped bar plot want grouping

    if (metadata.group.length > 0)
    {
      this.values_columns = metadata.group
    }
    
    
    // Infer titles, if not specified by user
    
    // Chart title:
    if (!metadata.chart_title)
    {
      metadata.chart_title = this.values_columns.join(", ") + Text.BY + this.names_columns.join(", ");
    }
    
    // x-axis title:
    if (!metadata.x_axis_title)
    {
      metadata.x_axis_title = this.names_columns[0];
    }
    
    // Values column headers;
    // as y-axis title if none is specified, it's no pie chart,
    // and there is only 1 series:
    if ( (this.values_columns.length === 1) && (!metadata.y_axis_title)
        && (!single_series_legend) )
    {
      metadata.y_axis_title = this.values_columns[0];
    }
    
    // otherwise as data series title(s):
    else
    {
      metadata.series_titles = this.values_columns.slice();
    }
    
    if ( (metadata.y_axis_title) && (!single_series_legend) )
    {
      this.chart_x += this.AXIS_HEIGHT
    }
    this.svg_width = this.MARGIN + this.chart_x + this.CHART_WIDTH
    
    // Legend title:
    if (!metadata.legend_title)
    {
      metadata.legend_title = (single_series_legend) ? this.names_columns[0] : Text.LEGEND;
    }
    
    
    // For each CSV cell, test if its content is numerical
    // and cast all numerical contents from string to number
    
    data.forEach( (d:any) =>
    {
      
      this.names_columns.forEach( (n : any) =>
      {
        let cell = +(d[n].trim());
        if (!Number.isNaN(cell))
        {
          d[n] = cell;
        }
        else
        {
          this.numerical_names = false;
        }
      });
      
      // Values columns may contain only numerical data:
      this.values_columns.forEach( (v : any) =>
      {
        let cell = +(d[v].trim());
        if (!Number.isNaN(cell))
        {
          d[v] = cell;
        }
        else
        {
          console.error(Text.ERROR + Text.ONLY_NUMERICAL_DATA);
          process.exit(4);
        }
        
      });
      
    });
    
    
    // Sort data points by name
    // unless the user has specified the --no-sort option
    
    if (metadata.datapoints_sorting)
    {
      data.sort( (a, b) =>
      {
        return (a[this.names_columns[0]] > b[this.names_columns[0]]) ? 1 : -1;
      });
    }
    
    
    // Decide whether to print a legend at the right;
    // no legend is shown if the user has given the
    // command-line flag "--no-legend" or if a
    // cartesian single-series chart is created:
    metadata.legend = ( (this.values_columns.length > 1) || single_series_legend)
        && metadata.legend;
    
    // If no legend is created, centre the actual chart
    // within the SVG document; otherwise shift it to the left:
    if (metadata.legend)
    {
      this.svg_width += this.LEGEND_WIDTH;
    }
    
    
    // Initialise the SVG document
    
    // Root <svg> element:
    this.svg = d3.select(doc).select("svg");
    
    this.svg.attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
        .attr("version", "1.1")
        .attr("viewBox", "0 0 " + this.svg_width + " " + this.SVG_HEIGHT)
        .attr("role", "graphics-document");
    
    // Chart title as overall <title> element for Describler:
    if ( (metadata.target === Target.DESCRIBLER) && (metadata.tooltips) )
    {
      this.svg.append("title")
          .text(metadata.chart_title);
    }
    
    // Append CSS:
    if (this.STYLE)
    {
      this.svg.append("style")
          .attr("type", "text/css")
          .text(this.STYLE);
    }
    
    // Background:
    this.svg.append("rect")
        .attr("id", "backdrop")
        .attr("width", this.svg_width)
        .attr("height", this.SVG_HEIGHT)
        .attr("fill", "#fff");
    
    // Chart root:
    this.root = this.svg.append("g")
    this.root.attr("id", "ChartRoot")
        .attr("role", "chart")
        .attr("tabindex", "0")
        .attr("transform", "translate(" + this.chart_x + "," + this.CHART_Y + ")");
    
    let chart_label_ids = "title";
    
    // Description for the whole SVG
    // (provided by the author):
    if (metadata.chart_description)
    {
      this.root.append("desc")
          .attr("id", "desc")
          .text(metadata.chart_description);
      
      chart_label_ids += " desc";
    }
    
    this.root.attr("aria-labelledby", chart_label_ids);
    
    // Chart outline:
    this.root.append("rect")
        .attr("role", "chartarea")
        .attr("width", this.CHART_WIDTH)
        .attr("height", this.CHART_HEIGHT)
        .attr("fill", "none");
    
    
    // Chart title horizontally centred at the top:
    this.title = this.root.append("text")
        .attr("id", "title")
        .attr("role", "heading")
        .attr("text-anchor", "middle")
        .attr("font-size", 14)
        .attr("x", this.svg_width / 2 - this.chart_x)
        .attr("y", -this.AXIS_HEIGHT)
        .text(metadata.chart_title);
    
  }
  
  
  addLegend(title : string, color : any,
      squares = false) : void
  {
    let legend = this.root.append("g")
        .attr("role", "legend")
        .attr("aria-roledescription", Text.LEGEND)
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "start")
        .attr("tabindex", "0")
        .attr("aria-labelledby", "legend-title")
        .attr("transform", "translate(" + (this.CHART_WIDTH + 8)
            + ", 20)");
    
    legend.append("text")
        .attr("role", "heading")
        .attr("font-size", "12")
        .attr("id", "legend-title")
        .text(title);
    
    let legend_items = legend.selectAll("g")
        .data(color.domain())
        .enter()
        .append("g")
            .attr("role", "legenditem")
            .attr("id", (d : any, i : number) =>
            {
              return "legenditem" + (i+1);
            })
            .attr("transform", (d : any, i : number) =>
            {
              return "translate(0," + (15 + i * 15) + ")";
            })
            .attr("tabindex", "0");
    
    if (squares)
    {
      legend_items.append("rect")
          .attr("x", "5")
          .attr("y", "-5")
          .attr("width", "10")
          .attr("height", "10")
          .attr("fill", (d : any) =>
          {
            return color(d);
          });
    }
    else
    {
      legend_items.append("line")
          .attr("x2", "20")
          .attr("style", "stroke-width: 3;")
          .attr("stroke", (d : any) =>
          {
            return color(d);
          });
    }
    
    legend_items.append("text")
        .attr("x", "25")
        .attr("alignment-baseline", "middle")
        .text((d : any) =>
        {
          return d;
        });
    
    
  }
  
  
  roundAttributeValue(selection, attribute : string) : void
  {
    selection.each(function()
    {
      let element = d3.select(this);
      element.attr(attribute, Chart.roundString(element.attr(attribute)));
    });
  }
  
  
  round(value : number) : number
  {
    return Math.round(value * Chart.svg_round_factor) / Chart.svg_round_factor;
  }
  
  
  public static roundString(value : string) : string
  {
    value = value.replace(/\d+\.\d+/g, (x : string) =>
    {
      let point_index = x.indexOf(".");
      
      let higher_digits = "";
      higher_digits = x.slice(0, point_index - 1);
      //x = x.slice(point_index - 1);
      return String( Math.round(parseFloat(x) * Chart.svg_round_factor)
          / Chart.svg_round_factor );
    });
    
    return value;
  }
  
  
}