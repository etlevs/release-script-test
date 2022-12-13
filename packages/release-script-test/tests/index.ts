import { test } from 'uvu';
import { equal } from 'uvu/assert';
import { cool } from '../src/index';

test('cool', () => {
	equal(cool, '1');
});

test.run();
