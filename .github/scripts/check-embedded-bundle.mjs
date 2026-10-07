// Fails unless a release build embedded its bundle: the hotcodepush.json in the directory given names an embedded
// bundle, and each file of that bundle sits in the same directory with the hash its manifest records.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const [directoryPath] = process.argv.slice(2);
const { embeddedBundleManifest } = JSON.parse(
  readFileSync(join(directoryPath, 'hotcodepush.json'), 'utf8'),
);
if (embeddedBundleManifest === null) {
  throw new Error(`${directoryPath}/hotcodepush.json names no embedded bundle`);
}
for (const { path, sha256 } of embeddedBundleManifest.files) {
  const filePath = join(directoryPath, path);
  const fileSha256 = createHash('sha256')
    .update(readFileSync(filePath))
    .digest('hex');
  if (fileSha256 !== sha256) {
    throw new Error(
      `${filePath} is not the file the embedded bundle's manifest records`,
    );
  }
}
console.log(
  `${directoryPath} holds every file of the embedded bundle, ${embeddedBundleManifest.files.length} in all`,
);
