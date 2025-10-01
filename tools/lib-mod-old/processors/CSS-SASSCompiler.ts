// import * as sass from 'sass-embedded';
// import { Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
// import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
// import { BuilderInternal, ProcessorModule, ProjectFile } from '../../lib/Builder.js';

// const logger = Logger(Processor_CSS_SASSCompiler.name);

// export function Processor_CSS_SASSCompiler(): ProcessorModule {
//   return new CProcessor_CSS_SASSCompiler();
// }

// class CProcessor_CSS_SASSCompiler implements ProcessorModule {
//   channel = logger.newChannel();

//   sass_compiler: sass.AsyncCompiler | undefined;

//   async onStartUp(builder: BuilderInternal): Promise<void> {
//     this.sass_compiler = await sass.initAsyncCompiler();
//   }
//   async onAdd(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
//     for (const file of files) {
//       if (builder.platform.Utility.globMatch(file.src_path.standard, '**/*{.sass,.scss}')) {
//         file.out_path = Path(file.src_path);
//         file.out_path.basename = `${file.out_path.name}.compiled.css`;
//         file.addProcessor(this, this.onProcess);
//       }
//     }
//   }
//   async onCleanUp(builder: BuilderInternal): Promise<void> {
//     await this.sass_compiler?.dispose();
//   }

//   async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
//     try {
//       if (this.sass_compiler !== undefined) {
//         const results = await this.sass_compiler.compileStringAsync(await file.getText());
//         file.setText(results.css);
//         await file.write();
//       }
//     } catch (error) {
//       this.channel.error(error);
//     }
//   }
// }
