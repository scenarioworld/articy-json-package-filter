import { LoaderDefinition } from 'webpack';
import { ArticyData } from 'articy-js';
import { validate } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/validate';

const schema: Schema = {
  type: 'object',
  properties: {
    include: {
      type: 'array',
      items: {
        anyOf: [{ instanceof: 'RegExp' }, { type: 'string' }],
      },
    },
  },
};

export interface ArticyJsonPackageFilterOptions {
  include: (RegExp | string)[];
}

// Our asyncronous loader
const loader: LoaderDefinition<ArticyJsonPackageFilterOptions> = function(
  source
) {
  const options = this.getOptions();

  validate(schema, options, {
    name: 'Articy JSON Package Filter',
    baseDataPath: 'options',
  });

  // Load source as JSON
  const parsedData = JSON.parse(source) as ArticyData;

  // Get the names of each package
  const packageIds = parsedData.Packages.map(p => p.Name);

  // For each package, remove if its name doesn't match any of the include regex
  for (const packageId of packageIds) {
    if (
      !options.include.some(r =>
        typeof r === 'string' ? packageId.indexOf(r) !== -1 : r.test(packageId)
      )
    ) {
      parsedData.Packages.splice(
        parsedData.Packages.findIndex(p => p.Name === packageId),
        1
      );
    }
  }

  // Re-export
  return `${JSON.stringify(parsedData)}`;
};

export default loader;
