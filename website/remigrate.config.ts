import { defineRemigrateConfig } from 'redux-remigrate';

export default defineRemigrateConfig({
  storagePath: './src/remigrate',
  stateFilePath: './src/types/state.ts',
  stateTypeExpression: 'State',
});
