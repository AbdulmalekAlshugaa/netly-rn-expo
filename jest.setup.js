/* eslint-env jest */
// Default mock for netinfo; individual test files override `useNetInfo`
// with controllable return values where needed.
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js')
);
