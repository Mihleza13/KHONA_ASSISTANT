import React from 'react';
import { CommunityHub } from '../Community/CommunityHub';
import type { POPIAConsentState } from '../../types';

interface LearnHubProps {
  popiaConsent: POPIAConsentState;
}

export const LearnHub: React.FC<LearnHubProps> = ({ popiaConsent }) => {
  return <CommunityHub popiaConsent={popiaConsent} />;
};

export default LearnHub;
