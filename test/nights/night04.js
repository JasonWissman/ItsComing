// The Quarry: chain the gate, wait for it to close, padlock it.
module.exports = {
  normal: [['pickup', 'chain'], ['pickup', 'padlock'], ['use', 'gate'], ['wait', 1400], ['use', 'gate']],
};
