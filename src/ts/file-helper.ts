import { AChartCreator } from "./achart-creator";
import { Text } from "./text.en";
import { doc } from "./achart-creator";
import { Console } from "./achart-creator";


const FS = require("fs");
const csv = require("csvtojson");
const format = require("xml-formatter");
  
  

export class FileHelper
{
  
  
  private constructor() {}
  
  
  static writeSvg(chart_type : string, markup : string,
      output_file : string) : void
  {
    console.info(Text.WRITING_TO + output_file);
    
    markup = format(markup,
    {
      indentation: "  ",
      collapseContent: true,
      lineSeparator: "\n"
    });
    
    FS.writeFileSync(output_file, markup, "utf8");
  }
  
  
  static loadFile(achart_creator : AChartCreator) : void
  {
    
    if (!achart_creator.input_file)
    {
      console.info(Text.NO_CSV_FILE);
      console.info(Text.DEFAULT_FILE);
      console.info(Text.HELP_OPTION + "\n");
      
      achart_creator.input_file = (FS.existsSync(achart_creator.DEFAULT_INPUT_FILE)) ?
          "" : "../";
      
      achart_creator.input_file += (achart_creator.chart_type === "line") ?
          achart_creator.DEFAULT_INPUT_FILE_LINE : achart_creator.DEFAULT_INPUT_FILE;
    }
    
    if (!achart_creator.output_file)
    {
      let extension_index = achart_creator.input_file.length - 4;
      
      achart_creator.output_file = (achart_creator.input_file.indexOf(".csv",
          extension_index) === -1) ? achart_creator.input_file :
          achart_creator.input_file.substring(0, extension_index);
      achart_creator.output_file += ".svg";
    }
    
    if (!FS.existsSync(achart_creator.input_file))
    {
      console.error(Text.FILE + achart_creator.input_file + Text.NOT_FOUND);
      process.exit(2);
    }
    
    csv(
    {
      delimiter: "auto",
      flatKeys: "true"
    })
        .fromFile(achart_creator.input_file, "utf8")
        .then( (data : object[]) =>
        {
          console.info(Text.FILE + achart_creator.input_file + Text.LOADED);
          
          achart_creator.create_chart(data);
        }).catch( (err) =>
        {
          console.error(Text.ERROR + Text.CANNOT_OPEN + achart_creator.input_file);
          process.exit(2);
        });
    
  }
  
}
