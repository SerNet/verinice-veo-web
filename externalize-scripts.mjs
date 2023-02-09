import { writeFileSync, readFile } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob';
import hash from 'hash-sum';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const name = () => {
  const BUILD_OUTPUT_DIR = resolve(__dirname, '.output', 'public');

  let configData;
  let configFileName;

  // Get a list of all compiled html files (those could contain <script>)
  const htmlFiles = glob.sync(`${BUILD_OUTPUT_DIR}/**/*.html`);

  for(const file of htmlFiles) {
    // Read every file and check whether <script> exists within. if so, replace it with a link to the config file (created as soon as the first match is found with the config data of the match (all files contain the same config))
    readFile(file, (_error, fileContent) => {
      const newContent = fileContent.toString().replace(/<script([^>]*)>(.+?)<\/script>/gis, (text, args, content) => {
        // If src= is already set, this is not the tag we are looking for, so leave everything as it is
        if (args.includes('src=')) {
          return text;
        }
        // If config isn't saved yet, do so
        if(!configData && !configFileName) {
          configData = content;
          configFileName = `config.${hash(content)}.js`;
          writeFileSync(resolve(BUILD_OUTPUT_DIR, '_nuxt', configFileName), configData);
        }

        // Replace old script tag with new one with the link
        return `<script${args} src="/_nuxt/${configFileName}"></script>`;
      });
      writeFileSync(file, newContent);
    });
  }
};

name();
