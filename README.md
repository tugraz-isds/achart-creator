# AChart Creator



## 1 Introduction


AChart Creator (standing for Accessible Chart Creator) is a command-line 
tool to generate accessible charts as standalone SVG files from tabular 
data contained in CSV files. The SVG files are annotated with WAI-ARIA 
attributes and other accessibility markup.



## 2 Features


- Reads CSV file and creates accessible chart as SVG file.
- Supports bar, multi-line, and pie charts.
- Inserts ARIA attributes for enhanced accessibility.
- Command-line options to specify SVG Title and Description
- Command-line options to specify legend, x, and y axis titles.
- Other command-line options for further adaptation.
- Written in TypeScript.



## 3 Description

AChart Creator is built around a suite of “recipes”, one for each
chart type. Each recipe uses D3 and jsdom to create a chart as a
standalone SVG file, reading the dataset from a specified CSV file.



## 4 Installation


To install AChart Creator, use the following commands in the
terminal:

```
git clone "<repo url>"
npm install
npx gulp build
```



## 5 Usage


### 5.1 Creating a Chart

To create a chart, the following syntax is used:

```
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
                                            line, pie, bar-grouped, bar-stacked,
                                            scatter (case-insensitive).
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
                                            If scatter plot is used the
                                            first value of DATA-COLUMN is
                                            used as x1 (x-axis), the second
                                            as x2 (y-axis) the third as
                                            size (size of the scatter points)
                                            and the fourth as color (color of
                                            the scatter points)

     --rotate-x-labels [ROTATION]           Rotate the x labels by -45 degree.
                                            If ROTATION is given x labels are
                                            rotated by ROTATION. ROTATION must
                                            be a number between -180 and 180.

     --rotate-y-labels [ROTATION]           Rotate the x labels by -45 degree.
                                            If ROTATION is given x labels are
                                            rotated by ROTATION. ROTATION must
                                            be a number between -180 and 180.

     --colors COLORS                        Specifies the color of each datagroup.
                                            COLORS is a string of colors. All
                                            colors are seperated with a whitespace.
                                            Following color types are supported:
                                              - d3 colornames (e.g. red, green, ...)
                                              - HEX code (e.g. #69b3a2)
                                              - rgb(r, g, b)
                                              - rgba(r, g, b, a)
                                            The different types can also be 
                                            combined in onestring. If scatter plot 
                                            is uesed. The colors correspond to the
                                            unique classes in the color column.

     --aria-datagroup DIMENSION             Specifies if the data should be grouped
                                            by DIMENSION. DINMENSION can be either
                                            rows or columns. It defaults to rows.
                                            If scatter plot is used this command
                                            can be used to specifie by which column
                                            the data should be grouped. Here 
                                            DIMENSION can be either the index of
                                            the column or the name.

     --version                              Prints version information
                                            and exits.

     --help                                 Prints this help message
                                            and exits.


All parameters and options are case-insensitive. If an argument
contains spaces, enclose it in double quotation marks (""). Filenames 
may contain relative or absolute paths. If no path is given,
the current working directory is assumed. Sample CSV data files can be
found in the `data/` directory.
```

Note that, in order to use AChart Creator, you first need to run:
```
npx gulp build
```

Since this is the default gulp task, `build` can be omitted. This task 
transpiles the TypeScript code into JavaScript, placing the resulting 
JavaScript files into the folder `build/`.


### 5.2 Examples

To create a bar chart from the data in the CSV file data/fruit.csv:
```
node build/acreate.js --chart bar --dataset data/fruit.csv --chart-title "Most Popular Fruits" --chart-desc "Each fruit with volume sold."
```

To create a multi-line chart from the data in the CSV file data/prices.csv:
```
node build/acreate.js --chart line --dataset data/prices.csv --x-axis-title "Year" --y-axis-title "Fees in $"
```

To create a pie chart from the data in column 3 of the CSV file
data/fruit.csv:
```
node build/acreate.js --chart pie --dataset data/fruit.csv --legend-title Fruits --column 3
```

To create a stacked bar chart from the data of the CSV file
data/nrw2019.csv:
```
node build/acreate.js --chart bar-stacked --dataset .\data\nrw2019.csv --chart-title "Seats of Political Parties in Austria" --chart-desc "Seats of Political Parties in Austria per Federal state" --x-axis-title "Federal States" --y-axis-title "Number of  Seats in percent" --colors "#63C3D0 #CE000C #0056A2 #88B626 #E84188 #DCDCDC" --rotate-x-labels
```

To create a grouped bar chart from the data of the CSV file
data/nrw2019.csv:
```
node build/acreate.js --chart bar-grouped --dataset .\data\nrw2019.csv --chart-title "Seats of Political Parties in Austria" --chart-desc "Seats of Political Parties in Austria per Federal state" --x-axis-title "Federal States" --y-axis-title "Number of  Seats in percent" --colors "#63C3D0 #CE000C #0056A2 #88B626 #E84188 #DCDCDC" --rotate-x-labels
```

To create ascatter plot from the data of the CSV file
data/iris.csv:
```
node build/acreate.js --chart scatter --dataset .\data\iris.csv --chart-title "Iris Flower" --chart-desc "Sepal length and width plotted as Scatter Plot. Color is maped to species and size is maped to petal length" --x-axis-title "sepal length" --y-axis-title "sepal width" --columns "sepal_length sepal_width petal_length species" --aria-datagroup "species"
```



### 5.3 Cleanup

To remove all build files (`build/*`, `binaries/*`, `src/ts/build/*`)
and their folders:
```
npx gulp clean
```

To remove all node modules and all build files (`node_modules/*`, `build/*`,
`binaries/*`, `src/ts/build/*`) and their folders:
```
npx gulp cleanall
```




### 5.4 Creating Standalone Versions

A standalone binary executable of AChart Creator can be built using
`nexe` with the following command:

```
npx gulp binary [--target PLATFORM-ARCHITECTURE]
```

The option --target can be used to specify the build target. PLATFORM 
stands for the operating system and may be set, for instance, to 
windows, linux, or mac. ARCHITECTURE specifies the processor 
architecture and accepts x86 and x64. For a complete list of possible 
build targets, see:
<https://github.com/nexe/nexe/releases>
If either of PLATFORM or ARCHITECTURE is omitted or if the option 
--target is not given, the respective parameter(s) of the build computer 
is/are used.

The resulting executable file is named `acreate` (or, for Windows, `acreate.exe`)
and is placed into the directory `binaries/TARGET`, where TARGET 
corresponds to the specified build target or, if omitted, to the 
platform and architecture of the build computer.

The executable file is self-contained and can be copied or relocated to
a different folder. It can be run like this:
```
./acreate --chart line --dataset data/prices.csv --x-axis-title "Year" --y-axis-title "Fees in $"
```






## 6 For Developers

TypeScript source files are located in the `src/ts/` folder.
Corresponding JavaScript files are created in the `build/` folder.


