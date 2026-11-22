import SequencerModule from '@jest/test-sequencer';

const BaseSequencer = SequencerModule.default || SequencerModule;

class CustomSequencer extends BaseSequencer {
  /**
   * Sort test suites in strictly alphabetical and numerical order (01 -> 02 -> ... -> 10)
   */
  sort(tests) {
    const copyTests = Array.from(tests);
    return copyTests.sort((testA, testB) =>
      testA.path.localeCompare(testB.path, undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    );
  }
}

export default CustomSequencer;
