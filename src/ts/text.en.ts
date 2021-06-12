export class Text
{
  
  
  // Strings for embedding in the charts
  
  static readonly BY = ` by `;
  
  static readonly Y_AXIS_TITLE_REPLACEMENT = `values`;
  
  static readonly CHART_TYPE =
  {
    bar: `Bar Chart`,
    bargroup: `Grouped Bar Chart`,
    barstack: `Stacked Bar Chart`,
    line: `Line Chart`,
    pie: `Pie Chart`,
    scatter: `Scatter Plot`,
    donut: `Donut Chart`,
    similarity: `Similarity Map`,
    time: `Time Chart`,
    flow: `Flow Chart`
  };
  
  static readonly AXIS = `Axis`;
  static readonly LEGEND = `Legend`;
  
  static readonly DATASET = `Data Series`;
  
  
  // Strings for output to terminal
  
  static readonly ACHART_CREATOR_TITLE = `AChart Creator`;
  
  static readonly DEFAULT_FILE = `Opening a default CSV sample file`;
  
  static readonly HELP_OPTION = `Run 'acreate --help' for details!`;
  
  static readonly ERROR = `ERROR: `;
  
  static readonly INVALID_OPTION = `Invalid option`;
  
  static readonly NO_CHART_TYPE = `No supported chart type specified`;
  
  static readonly NO_TARGET = `No supported output target specified`;
  
  static readonly NO_CSV_FILE = `No CSV filename specified`;
  
  static readonly NO_OUTPUT_FILE = `No output filename specified`;
  
  static readonly NO_CHART_TITLE = `No chart title specified`;
  
  static readonly NO_CHART_DESCRIPTION = `No chart description specified`;
  
  static readonly NO_NAMES_TITLE = `No legend / x-axis title specified`;
  
  static readonly NO_Y_AXIS_TITLE = `No y-axis title specified`;
  
  static readonly FILE = `File `;
  
  static readonly LOADED = ` loaded`;
  
  static readonly NOT_FOUND = ` cannot be found.`;
  
  static readonly CANNOT_OPEN = `Cannot open file `;
  
  static readonly WRITING_TO = `Saving chart to file `;
  
  static readonly NO_COLUMN = `No column specified`;
  
  static readonly COLUMN_REQUIREMENTS = `Column must be a number > 0`;

  static readonly ROTATION_REQUIREMENTS = `Rotation must be a number between 180 and -180`;
  
  static readonly NO_PRECISION = `No precision specified`;

  static readonly PRECISION_REQUIREMENTS = `Precision must be a number >= 0`;

  static readonly NO_COLUMNS = `No columns specified`;

  static readonly NO_COLORS = `No colors specified`;
  
  static readonly CSV_HAS_ONLY = `The CSV file contains only `;

  static readonly NO_DATA_GROUP = `No Aria Data Group specified`;

  static readonly DATA_GROUP_REQUIREMENTS = `Aria Data Group must be a string columns or rows `;
  
  static readonly NOT_MULTIDIM_CHART_TYPE = 
  `columns work only with multidimensional chart types like: 
    bar-grouped
    bar-stacked`;
    
  static readonly VALUE_COLUMNS = ` value columns`;
  
  static readonly ONLY_NUMERICAL_DATA =
      `Cells of columns 1 and higher may contain numerical data only.`;
  
  static readonly VERSION = `version`;
  
  static readonly ACHART_CREATOR_HELP =
`AChart Creator -- Creates a chart in SVG format
with WAI-ARIA markup from a CSV file.


Command-line syntax:

acreate [--chart] CHART-TYPE [--dataset CSV-FILENAME]
        [--output SVG-FILENAME] [--chart-title TITLE]
        [--chart-desc DESCRIPTION] [--x-axis-title TITLE]
        [--y-axis-title TITLE] [--legend-title TITLE]
        [--target SOFTWARE] [--column DATA-COLUMN] [--no-sort]
        [--no-legend] [--no-tooltips] [--no-bar-values]
        [--no-segment-values] [--no-segment-percentages]
        [--segment-percentage-precision PLACES] [--svg-precision PLACES]
        [--version] [--help] [--columns] [--rotate-x-labels [ROTATION]]
        [--rotate-y-labels [ROTATION]] [--colors]


Mandatory arguments:

     CHART-TYPE                             Specifies the type of the chart
                                            to be created. Currently
                                            supported chart types are bar,
                                            line, pie, bar-grouped, bar-stacked
                                            (case-insensitive).
                                            This argument can be given either
                                            as the first command-line
                                            parameter or, alternatively, at
                                            any position, prepended by --chart.


Optional arguments:

     --dataset CSV-FILENAME                 Specifies the CSV file
                                            containing the data to be
                                            visualised in the chart. If not
                                            specified, a default CSV file will
                                            be chosen.

     --output SVG-FILENAME                  Specifies the name of the
                                            resulting SVG file. If not
                                            specified, the output file will
                                            be named according to the input
                                            filename with the extension
                                            .svg and placed into its directory.

     --chart-title TITLE                    Specifies a title for the chart
                                            which is visible and accessible
                                            by screen readers. If not
                                            specified, the title will be
                                            derived from the headers of the
                                            CSV columns.

     --chart-desc DESCRIPTION               Assigns the chart a more detailed
                                            overall description in addition
                                            to the title. The description
                                            is not visible but can be
                                            obtained by screen readers.

     --x-axis-title TITLE                   Specifies a title for the x-axis
                                            (if applicable). The title is
                                            visible and accessible by screen
                                            readers. If not specified, it
                                            will be derived from the header
                                            of the first CSV column. For pie
                                            charts, the option has no effect.
                                            Alias: --x-title TITLE

     --y-axis-title TITLE                   Specifies a title for the y-axis
                                            (if applicable). The title is
                                            visible and accessible by screen
                                            readers. If not specified, in
                                            the case of a single-series bar
                                            or line chart, it will be
                                            derived from the header of the
                                            data column. For pie charts,
                                            the option has no effect.
                                            Alias: --y-title TITLE
     
     --legend-title TITLE                   Specifies a title for the
                                            legend (if applicable). The
                                            title is visible and accessible
                                            by screen readers. If not
                                            specified, in the case of a pie
                                            chart, it will be derived from
                                            the header of the first CSV
                                            column. For multi-line charts, the
                                            legend title defaults to "Legend".
                                            If no legend is printed, the
                                            option has no effect.

     --target SOFTWARE                      States which assistive software
                                            the accessibility markup shall
                                            be optimised for.
                                            Valid arguments for SOFTWARE are
                                            (case-insensitive):
                                            achart         for AChart
                                                           Interpreter (default).
                                            describler     for Describler.
                                            screen-reader  for common screen
                                                           readers (JAWS,
                                                           NVDA, etc.)
                                                           interacting with
                                                           browsers without
                                                           any special chart
                                                           reading software.
                                            This is meant to optimise the
                                            user experience for the respective
                                            target; in general, all the
                                            three targets should work with
                                            all the named types of
                                            assistive software.

     --column DATA-COLUMN                   Specifies the CSV column
                                            containing the data series to
                                            be visualised. DATA-COLUMN is an
                                            integer > 0, where the columns
                                            are assumed to be counted with
                                            increasing numbers from left to
                                            right. If the option is not
                                            given, in the case of a line
                                            chart, all columns of the CSV
                                            file, starting by number 1,
                                            will be visualised, where one
                                            line (data series) corresponds
                                            to one column. For bar and pie
                                            charts, DATA-COLUMN defaults to 1.

     --no-sort                              By default, all data points are
                                            sorted in increasing order by
                                            name, i.e. the content of the
                                            corresponding cells of the first
                                            CSV column. If this option is
                                            given, the data points will
                                            instead be visualised in the
                                            order their corresponding lines
                                            are listed in the CSV file from
                                            top to bottom.

     --no-tooltips                          Suppresses all tooltips on
                                            mouse-over (<title> elements).
                                            This may slightly impair the
                                            optimisation for Describler,
                                            even if the option
                                            --target describler is used.

     --no-legend                            Suppresses the creation of a
                                            legend. Unless --no-tooltips
                                            is given as well, in the case
                                            of a multi-line chart, each line
                                            will instead be given a <title>
                                            element with the corresponding
                                            data series title, which is
                                            accessible by screen readers
                                            and visible as a tooltip on
                                            mouse-over. For pie charts,
                                            labels are instead displayed
                                            within their corresponding pie
                                            segments.

     --no-bar-values                        Suppresses the visual labelling
                                            of bars in bar charts with data
                                            point values. The bar values
                                            are then available as tooltips,
                                            unless --no-tooltips is given
                                            as well. For other chart types,
                                            the option has no effect.

     --no-segment-values                    Suppresses the visual labelling
                                            of pie segments in pie charts
                                            with data point values.
                                            The segment values are then
                                            available as tooltips, unless
                                            --no-tooltips is given as well.
                                            For other chart types, the
                                            option has no effect.

     --no-segment-percentages               Suppresses the visual labelling
                                            of pie chart segments with data
                                            point percentages. The
                                            percentages are then available
                                            as tooltips, unless
                                            --no-tooltips is given as well.
                                            For other chart types, the
                                            option has no effect.

     --segment-percentage-precision PLACES  Specifies the number of decimal
                                            places for rounding percentages
                                            in labels or tooltips of pie
                                            chart segments. PLACES must
                                            be an integer ≥ 0. The default
                                            is 1. For other chart types,
                                            the option has no effect.

     --svg-precision PLACES                 Specifies the number of decimal
                                            places for rounding SVG
                                            coordinates and lengths.
                                            PLACES must be an integer ≥ 0.
                                            The default is 3.

     --columns DATA-COLUMN                  Specifies the CSV columns
                                            containing the data series to
                                            be grouped. DATA-COLUMN is an
                                            string with column indices or 
                                            column name, or both. If column
                                            indices are used the columns
                                            are assumed to be counted with
                                            increasing numbers from left to
                                            right. If the option is not
                                            given, all columns of the CSV
                                            file, starting by number 1,
                                            will be grouped.

     --rotate-x-labels [ROTATION]           Rotate the x labels by -45 degree.
                                            If ROTATION is given x labels are
                                            rotated by ROTATION. ROTATION must
                                            be a number between -180 and 180.

     --rotate-y-labels [ROTATION]           Rotate the x labels by -45 degree.
                                            If ROTATION is given x labels are
                                            rotated by ROTATION. ROTATION must
                                            be a number between -180 and 180.

     --colors COLORS                        Specidies the color of each datagroup.
                                            COLORS is a string of colors. All
                                            colors are seperated with a whitespace.
                                            Following color types are supported:
                                              - d3 colornames (e.g. red, green, ...)
                                              - HEX code (e.g. #69b3a2)
                                              - rgb(r, g, b)
                                              - rgba(r, g, b, a)
                                            The different types can also be 
                                            combined in onestring.

     --version                              Prints version information
                                            and exits.

     --help                                 Prints this help message
                                            and exits.


All parameters and options are case-insensitive. If an argument
contains spaces, enclose it in double quotation marks (""). Filenames 
may contain relative or absolute paths. If no path is given,
the current working directory is assumed.`;
  
}
