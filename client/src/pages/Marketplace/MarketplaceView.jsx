import React, { useState } from 'react';
import MarketplaceRoleSelection from './MarketplaceRoleSelection';

export default function MarketplaceView() {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    console.log('Selected Marketplace Role:', role);
  };

  return (
    <MarketplaceRoleSelection
      onSelectRole={handleRoleSelection}
    />
  );
}