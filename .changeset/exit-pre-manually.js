import glob from 'tiny-glob/sync.js';
import { unlinkSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// cleanup changests dir, remove all changesets and pre.json
const changesets_dir = dirname(fileURLToPath(import.meta.url));
const changeset_files = glob(`${changesets_dir}/*-*-*.md`);
changeset_files.forEach((f) => unlinkSync(f));
unlinkSync(`${changesets_dir}/pre.json`);
console.log(`removed ${changeset_files.length} changesets`);

// update packages
// set version
// add changelog entry
const packages_dir = fileURLToPath(new URL('../packages', import.meta.url));
const package_files = glob(`${packages_dir}/*/package.json`);
for (const pkg_file of package_files) {
	const pkg = JSON.parse(readFileSync(pkg_file, 'utf-8'));
	const { version } = pkg;
	if (version.includes('-next')) {
		pkg.version = version.replace(/(\d+\.\d+\.\d+)-next.*/, '$1');
		writeFileSync(pkg_file, JSON.stringify(pkg, null, '\t') + '\n');
		const changelog_file = pkg_file.replace(/package\.json$/, 'CHANGELOG.md');
		let changelog = readFileSync(changelog_file, 'utf-8');
		changelog = update_changelog(changelog, pkg);
		writeFileSync(changelog_file, changelog, 'utf-8');
	} else {
		throw new Error(`invalid version ${version}, expected -next tag for ${pkg.name}`);
	}
	console.log(`updated ${pkg.name}@${version} to ${pkg.version}`);
}

function update_changelog(changelog, pkg) {
	const prefix = `# ${pkg.name}\n`;
	if (!changelog.startsWith(prefix)) {
		throw new Error(`changelog invalid for ${pkg.name}. must start with ''${prefix}`);
	}
	return changelog.replace(prefix, `${prefix}${changelog_entry(pkg.version)}`);
}

function changelog_entry(version) {
	return `
## ${version}

### Major Changes

First major release, see below for the history of changes that lead up to this.
Starting from now all releases follow semver and changes will be listed as Major/Minor/Patch
`;
}
