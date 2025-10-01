import { Async_BunPlatform_File_Write_Text } from '../../../src/lib/ericchase/BunPlatform_File_Write_Text.js';
import { BunPlatform_Glob_Match } from '../../../src/lib/ericchase/BunPlatform_Glob_Match.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
import { Class_BuildArtifact, PATTERN } from '../../core/processor/Processor_TypeScript_Generic_Bundler.js';

const PATTERN_USERSCRIPT = `{.user}${PATTERN.JS_JSX_TS_TSX}`;

export function Processor_TypeScript_UserScript_Bundler(config?: Config): Builder.Processor {
  return new Class(config ?? {});
}
class Class implements Builder.Processor {
  ProcessorName = Processor_TypeScript_UserScript_Bundler.name;
  channel = Logger(this.ProcessorName).newChannel();

  bundle_set = new Set<Builder.File>();

  constructor(readonly config: Config) {}
  async onStartUp(): Promise<void> {
    this.config.env ??= 'disable';
    this.config.sourcemap ??= 'none';
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    let trigger_reprocess = false;
    for (const file of files) {
      const query = file.src_path;
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Src}/**/*${PATTERN_USERSCRIPT}`)) {
        file.iswritable = true;
        file.out_path = NodePlatform_PathObject_Relative_Class(file.out_path).replaceExt('.js').join();
        file.addProcessor(this, this.onProcessUserScript);
        this.bundle_set.add(file);
        continue;
      }
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Src}/**/*${PATTERN.JS_JSX_TS_TSX}`)) {
        trigger_reprocess = true;
      }
    }
    if (trigger_reprocess === true) {
      for (const file of this.bundle_set) {
        file.refresh();
      }
    }
  }
  async onRemove(files: Set<Builder.File>): Promise<void> {
    let trigger_reprocess = false;
    for (const file of files) {
      const query = file.src_path;
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Src}/**/*${PATTERN_USERSCRIPT}`)) {
        this.bundle_set.delete(file);
        continue;
      }
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Src}/**/*${PATTERN.JS_JSX_TS_TSX}`)) {
        trigger_reprocess = true;
      }
    }
    if (trigger_reprocess === true) {
      for (const file of this.bundle_set) {
        file.refresh();
      }
    }
  }

  async onProcessUserScript(file: Builder.File): Promise<void> {
    try {
      const define: Options['define'] = {};
      for (const [key, value] of Object.entries(this.config.define?.() ?? {})) {
        define[key] = value === undefined ? 'undefined' : JSON.stringify(value);
      }
      define['import.meta.url'] = 'undefined';

      const results = await ProcessBuildResults(
        Bun.build({
          define,
          drop: this.config.drop,
          entrypoints: [file.src_path],
          env: this.config.env,
          format: 'esm',
          minify: {
            identifiers: false,
            syntax: false,
            whitespace: false,
          },
          sourcemap: this.config.sourcemap,
          target: 'browser',
          banner: await GetUserScriptHeader(file),
        }),
      );
      if (results.bundletext !== undefined) {
        // scan bundle text for source comment paths
        for (const [, ...paths] of results.bundletext.matchAll(/\n?\/\/ (src\/.*)\n?/g)) {
          for (const path of paths) {
            file.addUpstreamPath(path);
          }
        }
        file.setText(results.bundletext);
      }
      // process other artifacts
      for (const artifact of results.artifacts) {
        switch (artifact.kind) {
          case 'entry-point':
            // handled above
            break;
          default:
            await Async_BunPlatform_File_Write_Text(NODE_PATH.join(NODE_PATH.parse(file.out_path).dir, artifact.path), await artifact.blob.text());
            break;
        }
      }
    } catch (error) {
      this.channel.error(error, `UserScript Bundle Error, File: ${file.src_path}`);
    }
  }
}
type Options = Parameters<typeof Bun.build>[0];
interface Config {
  /**
   * Let's you define key value pairs as-is. The processor will call
   * `JSON.stringify(value)` for you.
   * @default undefined
   */
  define?: () => Record<string, any>;
  /**
   * Can only drop built-in and unbounded global identifiers, such as `console`
   * and `debugger`. Cannot drop any identifier that is defined in the final
   * bundle. The only real use case I've seen for this is removing debugger
   * statements and logging.
   * @default undefined */
  drop?: Options['drop'];
  /** @default 'disable' */
  env?: Options['env'];
  /** @default 'none' */
  sourcemap?: Options['sourcemap'];
}

async function ProcessBuildResults(buildtask: Promise<Bun.BuildOutput>): Promise<{
  artifacts: Class_BuildArtifact[];
  bundletext?: string;
  logs: Bun.BuildOutput['logs'];
  success: boolean;
}> {
  const buildresults = await buildtask;
  const out: {
    artifacts: Class_BuildArtifact[];
    bundletext?: string;
    logs: Bun.BuildOutput['logs'];
    success: boolean;
  } = {
    artifacts: [],
    bundletext: undefined,
    logs: buildresults.logs,
    success: buildresults.success,
  };
  if (buildresults.success === true) {
    for (const artifact of buildresults.outputs) {
      switch (artifact.kind) {
        case 'entry-point': {
          out.bundletext = await artifact.text();
        }
      }
      out.artifacts.push(new Class_BuildArtifact(artifact));
    }
  }
  return out;
}
async function GetUserScriptHeader(file: Builder.File) {
  const text = await file.getText();
  const start = text.match(/^\/\/.*?==UserScript==.*?$/dim);
  const end = text.match(/^\/\/.*?==\/UserScript==.*?$/dim);
  const header = text.slice(start?.indices?.[0][0] ?? 0, end?.indices?.[0][1] ?? 0);
  return `${header}\n`;
}
