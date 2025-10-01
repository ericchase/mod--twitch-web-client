import { Async_BunPlatform_File_Write_Text } from '../../../src/lib/ericchase/BunPlatform_File_Write_Text.js';
import { Async_BunPlatform_Glob_Scan_Generator } from '../../../src/lib/ericchase/BunPlatform_Glob_Scan_Generator.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { HTML_UTIL } from '../../core/bundle/html-util/html-util.js';
import { Logger } from '../../core/Logger.js';

export function Step_Dev_Generate_Links(config: Config): Builder.Step {
  return new Class(config);
}
class Class implements Builder.Step {
  StepName = Step_Dev_Generate_Links.name;
  channel = Logger(this.StepName).newChannel();

  constructor(public config: Config) {}
  async onStartUp(): Promise<void> {}
  async onRun(): Promise<void> {
    this.channel.log('Generate Links');
    const atag_list = await async_getATags(this.config.dirpath, this.config.pattern);
    const atag_list_node = HTML_UTIL.ParseDocument(atag_list.join('\n'));
    const file = Builder.File.Get(NODE_PATH.join(Builder.Dir.Src, 'index.html'));
    if (file !== undefined) {
      const source_html = (await file.getText()).trim();
      const source_node = HTML_UTIL.ParseDocument(source_html, { recognize_self_closing_tags: true }); // html only supports self-closing void tags
      const placeholder_node = HTML_UTIL.QuerySelector(source_node, 'links-placeholder');
      if (placeholder_node !== undefined) {
        HTML_UTIL.ReplaceNode(placeholder_node, atag_list_node);
        const output_html = HTML_UTIL.GetHTML(source_node);
        await Async_BunPlatform_File_Write_Text(file.out_path, output_html);
      } else {
        this.channel.error(new Error(`Could not find "<links-placeholder>" element in "${Builder.Dir.Src}/index.html".`));
      }
    } else {
      this.channel.error(new Error(`Could not find "${Builder.Dir.Src}/index.html" file.`));
    }
  }
  async onCleanUp(): Promise<void> {}
}
interface Config {
  /** Target folder to scan. */
  dirpath: string;
  /** Glob pattern to scan for. */
  pattern: string;
}

async function async_getATags(dirpath: string, pattern: string): Promise<string[]> {
  const tags: string[] = [];
  const path_objects = (await Array.fromAsync(Async_BunPlatform_Glob_Scan_Generator(dirpath, pattern)))
    .map((path) => {
      return NodePlatform_PathObject_Relative_Class(path).toPosix();
    })
    .sort((a, b) => {
      return a.ext.localeCompare(b.ext);
    });
  for (const po of path_objects) {
    tags.push(`<a href="${po.join({ dot: true })}" target="_blank">${po.join()}</a>`);
  }
  return tags;
}
