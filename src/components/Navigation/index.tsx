'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Home } from 'iconoir-react';
import { useState } from 'react';

/**
 * This component uses the UI Kit to navigate between pages
 * Bottom navigation is the most common navigation pattern in Mini Apps
 * We require mobile first design patterns for mini apps
 * Read More: https://docs.world.org/mini-apps/design/app-guidelines#mobile-first
 */

export const Navigation = () => {
  const [value, setValue] = useState('home');

  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabItem value="home" icon={<Home />} label="Home" />
    </Tabs>
  );
};
