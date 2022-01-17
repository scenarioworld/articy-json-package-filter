import path from 'path';
import webpack from 'webpack';
import { createFsFromVolume, Volume } from 'memfs';
import { ArticyJsonPackageFilterOptions } from '../src';

/**
 * In-memory webpack compiler function to run tests on the loader.
 * Taken from https://webpack.js.org/contribute/writing-a-loader/
 *
 * @param fixture Filename to compile
 * @param options Options to pass to the xlsx loader
 */
export default (
  fixture: string,
  options: ArticyJsonPackageFilterOptions
): Promise<webpack.Stats> => {
  const compiler = webpack({
    context: __dirname,
    entry: `./${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.articy\.json$/,
          use: {
            loader: path.resolve(__dirname, '../src/index.ts'),
            options,
          },
        },
      ],
    },
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      else if (!stats) reject(new Error('No stats returned'));
      else if (stats.hasErrors()) reject(stats.toJson().errors);
      else resolve(stats);
    });
  });
};
