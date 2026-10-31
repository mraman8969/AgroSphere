
import React, { useEffect, useState } from 'react';
import MarketplaceRoleSelection from './MarketplaceRoleSelection';
import MarketplaceOnboarding from './MarketplaceOnboarding';
import MarketplaceDashboard from './MarketplaceDashboard';

export default function MarketplaceView({ currentUser }) {
  const userKey =
    currentUser?.email?.trim().toLowerCase() || 'guest';

  const storageKey =
    `agrosphere_marketplace_profiles_${userKey}`;

  const [profiles, setProfiles] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeRole, setActiveRole] = useState(null);

  // Load saved Marketplace profiles
  useEffect(() => {
    try {
      const savedProfiles = JSON.parse(
        localStorage.getItem(storageKey) || '{}'
      );

      setProfiles(savedProfiles);
    } catch {
      setProfiles({});
    }

    setSelectedRole(null);
    setActiveRole(null);
  }, [storageKey]);

  // Handle role selection
  const handleRoleSelection = (role) => {
    const savedProfiles = (() => {
      try {
        return JSON.parse(
          localStorage.getItem(storageKey) || '{}'
        );
      } catch {
        return {};
      }
    })();

    setProfiles(savedProfiles);

    if (savedProfiles[role]?.completed) {
      setActiveRole(role);
      setSelectedRole(null);
    } else {
      setSelectedRole(role);
      setActiveRole(null);
    }
  };

  // Handle successful onboarding
  const handleOnboardingComplete = (profile) => {
    const updatedProfiles = {
      ...profiles,
      [profile.role]: profile
    };

    setProfiles(updatedProfiles);
    setActiveRole(profile.role);
    setSelectedRole(null);
  };

  // Show onboarding
  if (selectedRole) {
    return (
      <MarketplaceOnboarding
        role={selectedRole}
        currentUser={currentUser}
        onBack={() => setSelectedRole(null)}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Show role dashboard
  if (activeRole) {
    return (
      <MarketplaceDashboard
        role={activeRole}
        profile={profiles[activeRole]}
        onBack={() => setActiveRole(null)}
      />
    );
  }

  // Show role selection
  return (
    <MarketplaceRoleSelection
      onSelectRole={handleRoleSelection}
    />
  );
}
