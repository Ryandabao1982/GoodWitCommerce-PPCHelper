import React from 'react';
import { useBrandManager } from './src/hooks/useBrandManager';
import { useApiSettings } from './src/hooks/useApiSettings';
import { useSOPManager } from './src/hooks/useSOPManager';
import { MainAppPage } from './pages/MainAppPage';

const App: React.FC = () => {
  const brandManager = useBrandManager();
  const apiSettingsManager = useApiSettings();
  const sopManager = useSOPManager(brandManager.activeBrand);

  return (
    <MainAppPage
      brandManager={brandManager}
      apiSettingsManager={apiSettingsManager}
      sopManager={sopManager}
    />
  );
};

export default App;
