import { FileHelper } from "./file-helper";
import { Text } from "./text.en";
import { Chart } from "./chart";
import { BarChart } from "./bar-chart";
import { BarChartGrouped } from "./bar-chart-grouped";
import { LineChart } from "./line-chart";
import { PieChart } from "./pie-chart";


const { JSDOM } = require("jsdom");

const dom = new JSDOM(`<svg xmlns="http://www.w3.org/2000/svg"></svg>`,
  {
    contentType: "text/xml"
  });
export const doc = dom.window.document;


export const { Console } = console;


export enum Target {
  ACHART = 0,
  SCREEN_READER,
  DESCRIBLER
}



export class AChartCreator {


  readonly VERSION = "2.0.0";


  readonly DEFAULT_INPUT_FILE = "data/fruit.csv"
  readonly DEFAULT_INPUT_FILE_LINE = "data/prices.csv"

  input_file = ""
  output_file = ""
  chart_type = ""

  chart_metadata =
    {
      chart_title: "",
      chart_description: "",
      x_axis_title: "",
      y_axis_title: "",
      series_titles: [],
      legend_title: "",
      column: 0,
      columns: [],
      datapoints_sorting: true,
      legend: true,
      tooltips: true,
      bar_values: true,
      segment_values: true,
      segment_percentages: true,
      label_round_factor: 10,
      target: Target.ACHART,
    }

  chart: Chart


  constructor() {

    // Make sure all output is encoded in UTF-8:
    //process.stdout.setEncoding("utf8");
    //process.stderr.setEncoding("utf8");

    console.info(`${Text.ACHART_CREATOR_TITLE} ${Text.VERSION} ${this.VERSION} \n`);

    this.parseCommandLine();

    FileHelper.loadFile(this);
  }


  parseCommandLine(): void {
    let target = "";

    for (let index = 2; index < process.argv.length; index++) {

      switch (process.argv[index].toLowerCase()) {

        case "--chart":
          if ((++index) < process.argv.length) {
            this.chart_type = process.argv[index].toLowerCase();
          }
          break;

        case "--dataset":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_CSV_FILE);
          }
          this.input_file = process.argv[index];
          break;

        case "--output":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_OUTPUT_FILE);
          }
          this.output_file = process.argv[index];
          break;

        case "--chart-title":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_CHART_TITLE);
          }
          this.chart_metadata.chart_title = process.argv[index];
          break;

        case "--chart-desc":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_CHART_DESCRIPTION);
          }
          this.chart_metadata.chart_description = process.argv[index];
          break;

        case "--x-axis-title":
        case "--x-title":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_NAMES_TITLE);
          }
          this.chart_metadata.x_axis_title = process.argv[index];
          break;

        case "--legend-title":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_NAMES_TITLE);
          }
          this.chart_metadata.legend_title = process.argv[index];
          break;

        case "--y-axis-title":
        case "--y-title":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_Y_AXIS_TITLE);
          }
          this.chart_metadata.y_axis_title = process.argv[index];
          break;

        case "--target":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_TARGET);
          }
          target = process.argv[index];
          break;

        case "--column":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_COLUMN);
          }
          let column = +process.argv[index];
          if (!(/\d/g.test(process.argv[index])) || (column < 1)) {
            this.syntaxError(Text.COLUMN_REQUIREMENTS);
          }
          this.chart_metadata.column = column;
          break;

        case "--svg-precision":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_PRECISION);
          }
          let precision = +process.argv[index];
          if (!(/\d/g.test(process.argv[index])) || (precision < 0)) {
            this.syntaxError(Text.PRECISION_REQUIREMENTS);
          }
          Chart.svg_round_factor = 10 ** precision;
          break;

        case "--segment-percentage-precision":
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_PRECISION);
          }
          precision = +process.argv[index];
          if (!(/\d/g.test(process.argv[index])) || (precision < 0)) {
            this.syntaxError(Text.PRECISION_REQUIREMENTS);
          }
          this.chart_metadata.label_round_factor = 10 ** precision;
          break;

        case "--no-sort":
          this.chart_metadata.datapoints_sorting = false;
          break;

        case "--no-legend":
          this.chart_metadata.legend = false;
          break;

        case "--no-bar-values":
          this.chart_metadata.bar_values = false;
          break;

        case "--no-segment-values":
          this.chart_metadata.segment_values = false;
          break;

        case "--no-segment-percentages":
          this.chart_metadata.segment_percentages = false;
          break;

        case "--no-tooltips":
          this.chart_metadata.tooltips = false;
          break;

        case "--help":
          console.info(Text.ACHART_CREATOR_HELP);

        case "--version":
          process.exit(0);

        case "--columns":
          /* TODO:
          in chart.ts
          Check if the given columns exist!
          */
          if ((++index) >= process.argv.length) {
            this.syntaxError(Text.NO_GROUP);
          }
          var columns = process.argv[index];
          this.chart_metadata.columns = columns.split(" ");
          break;

        default:
          if (index === 2) {
            this.chart_type = process.argv[index];
          }
          else {
            this.syntaxError(Text.INVALID_OPTION + ": " + process.argv[index]);
          }
      }

    }


    switch (this.chart_type) {
      case "bar":
        this.chart = new BarChart();
        break;

      case "bar-grouped":
        this.chart = new BarChartGrouped();
        break;

      case "line":
        this.chart = new LineChart();
        break;

      case "pie":
        this.chart = new PieChart();
        break;

      default:
        this.syntaxError(Text.NO_CHART_TYPE);

    }


    switch (target) {

      case "achart":
      case "":
        this.chart_metadata.target = Target.ACHART;
        break;

      case "screen-reader":
        this.chart_metadata.target = Target.SCREEN_READER;
        break;

      case "describler":
        this.chart_metadata.target = Target.DESCRIBLER;
        break;

      default:
        this.syntaxError(Text.NO_TARGET);

    }

  }


  syntaxError(message: string): void {
    console.error(Text.ERROR + message + "\n");

    console.info(Text.ACHART_CREATOR_HELP);

    process.exit(1);
  }


  create_chart(data: object[]): void {
    FileHelper.writeSvg(this.chart_type,
      this.chart.create(data, this.chart_metadata, doc),
      this.output_file);
  }

}
