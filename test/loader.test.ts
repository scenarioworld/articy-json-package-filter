import { ArticyData } from 'articy-js';
import webpack from 'webpack';
import { ArticyJsonPackageFilterOptions } from '../src';
import compiler from './compiler';

async function RunTest(
  options: ArticyJsonPackageFilterOptions
): Promise<ArticyData> {
  // Compile and collect output
  const stats = await compiler('data.articy.json', options);
  let output = stats.toJson({ source: true }).modules?.[0].source!;

  // Make sure we actually get output
  expect(output).toBeDefined();

  // Convert output to a string
  if (output instanceof Buffer) {
    output = output.toString();
  }

  // Parse to JSON
  return JSON.parse(output) as ArticyData;
}

test('No include means no packages', async () => {
  const result = await RunTest({
    include: [],
  });

  expect(result.Packages).toHaveLength(0);
});

test('Only include game packages', async () => {
  const result = await RunTest({
    include: [/^game\./],
  });

  expect(result.Packages).toHaveLength(3);
  expect(result.Packages.every(p => p.Name.startsWith('game.'))).toBeTruthy();
});

test('Only include sandbox packages', async () => {
  const result = await RunTest({
    include: [/^sandbox\./],
  });

  expect(result.Packages).toHaveLength(2);
  expect(
    result.Packages.every(p => p.Name.startsWith('sandbox.'))
  ).toBeTruthy();
});

test('Include episode one and sandbox', async () => {
  const result = await RunTest({
    include: [/^sandbox\./, /ep1/],
  });

  expect(result.Packages).toHaveLength(3);
  expect(
    result.Packages.every(
      p => p.Name.startsWith('sandbox.') || p.Name.indexOf('ep1') !== -1
    )
  ).toBeTruthy();
});

test('Strings as arguments', async () => {
  const result = await RunTest({
    include: ['sandbox'],
  });

  expect(result.Packages).toHaveLength(2);
  expect(
    result.Packages.every(p => p.Name.startsWith('sandbox.'))
  ).toBeTruthy();
});

test('Bad input causes failure', async () => {
  try {
    await RunTest({
      //@ts-ignore
      include: [4],
    });
    fail('compiler should fail');
  } catch (error) {
    if (Array.isArray(error)) {
      const errors = error as webpack.StatsError[];
      expect(errors[0]).toBeDefined();
      const match = errors[0].message.match(/Error:.*$/gm);
      expect(match?.[0]).toMatchSnapshot();
    } else {
      fail('Expected an array of webpack errors.');
    }
  }
});
